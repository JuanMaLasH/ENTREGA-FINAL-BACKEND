import { Router } from "express";
const router = Router();
import { ProductManager } from "../controllers/ProductManager.js";
const productManager = new ProductManager();
import passport from "passport";

router.get("/", productManager.getProducts);
router.get("/:pid", productManager.getProductById);
router.post("/", passport.authenticate("jwt", { session: false }), productManager.addProduct);
router.put("/:pid", productManager.updateProduct);
router.delete("/:pid", productManager.deleteProduct);

export default router;
