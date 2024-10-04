import { UserModel } from "../daos/mongodb/models/user.model.js";
import { CartModel } from "../daos/mongodb/models/carts.model.js";
import jwt from "jsonwebtoken";
import { createHash, isValidPassword } from "../utils/hashbcrypt.js";
import { UserDTO } from "../dto/user.dto.js";
import generarResetToken from "../utils/tokenreset.js";
import EmailManager from "../services/email.js";
const emailManager = new EmailManager();
import { UserRepository } from "../repositories/user.repository.js";
const userRepository = new UserRepository(); 

export class UserManager {
  async register(req, res) {
    const { first_name, last_name, email, password, age } = req.body;
    try {
      const existeUsuario = await UserModel.findOne({ email });
      if (existeUsuario) {
        return res.status(400).send("El usuario ya existe");
      }
      const nuevoCarrito = new CartModel();
      await nuevoCarrito.save();
      const nuevoUsuario = new UserModel({
        first_name,
        last_name,
        email,
        cart: nuevoCarrito._id, 
        password: createHash(password),
        age
      });
      await userRepository.create(nuevoUsuario);
      const token = jwt.sign({
        user: nuevoUsuario
       }, "coderhouse", {
        expiresIn: "24h"
      });
      res.cookie("coderCookieToken", token, {
        maxAge: 3600000,
        httpOnly: true
      });
      res.redirect("/login");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error interno del servidor");
    }
}

  async login(req, res) {
    const { email, password } = req.body;
    try {
      const usuarioEncontrado = await UserModel.findOne({ email });
      if (!usuarioEncontrado) {
        return res.status(401).send("Usuario no válido");
      }
      const esValido = isValidPassword(password, usuarioEncontrado);
      if (!esValido) {
        return res.status(401).send("Contraseña incorrecta");
      }
      const token = jwt.sign({ user: usuarioEncontrado }, "coderhouse", {
        expiresIn: "1h"
      });
      usuarioEncontrado.last_connection = new Date();
      await usuarioEncontrado.save();
      res.cookie("coderCookieToken", token, {
        maxAge: 3600000,
        httpOnly: true
      });
      res.redirect("/api/users/profile");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error interno del servidor");
    }
  }

  async profile(req, res) {
    try {
      const userDto = new UserDTO(req.user.first_name, req.user.last_name, req.user.role, req.user.cart, req.user.age, req.user.email);
      const isPremium = req.user.role === 'premium';
      const isAdmin = req.user.role === 'admin';
      const isUser = req.user.role === 'usuario';

      res.render("profile", { user: userDto, isPremium, isAdmin, isUser });
    } catch (error) {
        res.status(500).send('Error interno del servidor');
    }
  }

  async logout(req, res) {
    res.clearCookie("coderCookieToken");
    res.redirect("/login");
  }

  async admin(req, res) {
    if (req.user.user.role !== "admin") {
      return res.status(403).send("Acceso denegado");
    }
    res.render("admin");
  }

  async requestPasswordReset(req, res) {
    const { email } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).send("Usuario no encontrado");
        }
        const token = generarResetToken(); 
        user.resetToken = {
            token: token,
            expire: new Date(Date.now() + 3600000) 
        }
        await user.save();
        await emailManager.enviarCorreoRestablecimiento(email, user.first_name, token);
        res.redirect("/confirmacion-envio");
    } catch (error) {
        res.status(500).send("Error interno del servidor");
    }
  }

  async resetPassword(req, res) {
    const { email, password, token } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.render("passwordcambio", { error: "Usuario no encontrado" });
        }
        const resetToken = user.resetToken;
        if (!resetToken || resetToken.token !== token) {
            return res.render("passwordreset", { error: "El token es invalido" });
        }
        const ahora = new Date();
        if (ahora > resetToken.expire) {
            return res.render("passwordreset", { error: "El token es invalido" });
        }
        if (isValidPassword(password, user)) {
            return res.render("passwordcambio", { error: "La nueva contraseña no puede ser igual a la anterior" });
        }
        user.password = createHash(password);
        user.resetToken = undefined;
        await user.save();
        return res.redirect("/login");
    } catch (error) {
        res.status(500).render("passwordreset", { error: "Error interno del servidor" });
    }
  } 

  async cambiarRolPremium(req, res) { 
    const {uid} = req.params;
    try {
        const user = await UserModel.findById(uid); 
        if(!user) {
            return res.status(404).send("Usuario no encontrado"); 
        }
        const documentacionRequerida = ["Identificacion", "Comprobante de domicilio", "Comprobante de estado de cuenta"];
        const userDocuments = user.documents.map(doc => doc.name);
        const tieneDocumentacion = documentacionRequerida.every(doc => userDocuments.includes(doc));
        if (!tieneDocumentacion) {
          return res.status(400).send("El usuario tiene que completar toda la documentacion requerida");
        }
        const nuevoRol = user.role === "usuario" ? "premium" : "usuario"; 
        res.send(nuevoRol); 
    } catch (error) {
        res.status(500).send("Error en el servidor"); 
    }
  }
}
