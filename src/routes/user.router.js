import { Router } from "express";
const router = Router();
import passport from "passport"; 
import { UserManager } from "../controllers/UserManager.js";
const userManager = new UserManager();
import { UserRepository } from "../repositories/user.repository.js";
const userRepository = new UserRepository();
import upload from "../middleware/multer.js";

router.post("/register", userManager.register);
router.post("/login", userManager.login);
router.get("/profile", passport.authenticate("jwt", { session: false }), userManager.profile);
router.post("/logout", userManager.logout.bind(userManager));
router.get("/admin", passport.authenticate("jwt", { session: false }), userManager.admin);
router.post("/requestPasswordReset", userManager.requestPasswordReset);
router.post("/reset-password", userManager.resetPassword);
router.put("/premium/:uid", userManager.cambiarRolPremium);
router.post("/:uid/documents", upload.fields([{ name: "document" }, { name: "products" }, { name: "profile" }]), async (req, res) => {
    const { uid } = req.params;
    const uploadedDocuments = req.files;
    try {
        const user = await userRepository.findById(uid);
        if (!user) {
            return res.status(404).send("Usuario no encontrado");
        }
        if (uploadedDocuments) {
            if (uploadedDocuments.document) {
                user.documents = user.documents.concat(uploadedDocuments.document.map(doc => ({
                    name: doc.originalname,
                    reference: doc.path
                })))
            }
            if (uploadedDocuments.products) {
                user.documents = user.documents.concat(uploadedDocuments.products.map(doc => ({
                    name: doc.originalname,
                    reference: doc.path
                })))
            }
            if (uploadedDocuments.profile) {
                user.documents = user.documents.concat(uploadedDocuments.profile.map(doc => ({
                    name: doc.originalname,
                    reference: doc.path
                })))
            }
        }
        await user.save();
        res.status(200).send("Documentos cargados exitosamente");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error interno del servidor");
    }
})

export default router;