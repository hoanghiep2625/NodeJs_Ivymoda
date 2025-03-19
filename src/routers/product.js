import { Router } from "express";
import {
    createProduct,
    getProductById,
    getProducts,
    deleteProduct,
    updateProduct,
} from "../controllers/product.js";

import { checkAuth } from "../middlewares/checkAuth.js";

const router = Router();

router.get("/products", getProducts);
router.get("/products/:id", getProductById);

export default router;
