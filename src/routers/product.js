import { Router } from "express";
import {
    createProduct,
    getProductById,
    getProducts,
    deleteProduct,
    updateProduct,
} from "../controllers/product";
import { checkAuth } from "../middlewares/checkAuth";

const router = Router();

router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.post("/products", checkAuth, createProduct);
router.delete("/products/:id", checkAuth, deleteProduct);
router.put("/products/:id", checkAuth, updateProduct);

export default router;
