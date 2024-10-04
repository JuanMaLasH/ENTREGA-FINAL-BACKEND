import { ProductRepository } from "../repositories/product.repository.js";
const productRepository = new ProductRepository();

export class ProductManager {
    async addProduct(req, res) {
        const nuevoProducto = req.body;
        try {
            await productRepository.agregarProducto(nuevoProducto);
        } catch (error) {
            res.status(500).send("Error");
        }
    }

    async getProducts(req, res) {
        try {
            let { limit = 10, page = 1, sort, query } = req.query;
            const products = await productRepository.obtenerProductos(limit, page, sort, query);
            res.json(products);
        } catch (error) { 
            res.status(500).send("Error");
        }
    }

    async getProductById(req, res) {
        const id = req.params.pid;
        try {
            const buscado = await productRepository.obtenerProductoPorId(id);
            if (!buscado) {
                return res.json({
                    error: "Producto no encontrado"
                });
            }
            res.json(buscado);
        } catch (error) {
            res.status(500).send("Error");
        }
    }

    async updateProduct(req, res) {
        try {
            const id = req.params.pid;
            const productoActualizado = req.body;

            const resultado = await productRepository.actualizarProducto(id, productoActualizado);
            res.json(resultado);
        } catch (error) {
            res.status(500).send("Error al actualizar el producto");
        }
    }

    async deleteProduct(req, res) {
        const id = req.params.pid;
        const userRole = req.user.role; 
        try {
            const borrarProducto = await productRepository.eliminarProducto(id);
            if(!borrarProducto) {
                return res.status(404).send({message: "Producto no encontrado"});
            }
            if (userRole === "premium") {
                    if (borrarProducto.owner !== req.user.email) {
                        return res.status(403).send({ message: "No eres el propietario del producto" });
                    }
                } else if (userRole !== "admin") {
                    return res.status(403).send({ message: "No tienes permiso para eliminar este producto" });
                }
                await productRepository.eliminarProducto(id);
                return res.status(200).send({ message: "Producto eliminado correctamente", product: eliminarProducto });
        } catch (error) {
            res.status(500).send("Error al eliminar el producto");
        }
    }
}

/*
PRODUCTOS:

{
    "title": "Disco Rígido WD 2TB BLUE 256MB SATA 6.0GB/s",
    "description": "Tipo de conexión: SATA, Consumo: 5w y Tipo de disco: Mecánico",
    "code": "WD20EZBX-00AYRA0",
    "price": 73840,
    "status": true,
    "stock": 50,
    "category": "Disco rígido",
    "thumbnails": "https://imagenes.compragamer.com/productos/compragamer_Imganen_general_35996_Disco_Rigido_WD_2TB_BLUE_256MB_SATA_6.0GB_s_7200RPM_dc36f8f5-grn.jpg"	
}

{
    "title": "Procesador Intel Core i7 12700k 5.0GHz Turbo Socket 1700 Alder Lake",
    "description": "Núcleos: 12",
    "code": "BX8071512700K",
    "price": 409900,
    "status": true,
    "stock": 30,
    "category": "Procesador",
    "thumbnails": "https://imagenes.compragamer.com/productos/compragamer_Imganen_general_29140_Procesador_Intel_Core_i7_12700K_5.0GHz_Turbo_Socket_1700_Alder_Lake_4319ac0c-grn.jpg"	
}

*/