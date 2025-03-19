import { Router } from "express";
import {
    createProduct,
    deleteProduct,
    updateProduct,
} from "../controllers/product.js";
import {
    createCategory,
    getCategories,
    getCategoryById,
    deleteCategory,
    updateCategory
} from "../controllers/categories.js";

import { checkAuthAdmin } from "../middlewares/checkAuthAdmin.js";
const router = Router();

router.use(checkAuthAdmin);



router.post("/products", createProduct);
router.delete("/products/:id", deleteProduct);
router.put("/products/:id", updateProduct);

router.post("/categories", createCategory);
router.delete("/categories/:id", deleteCategory);
router.put("/categories/:id", updateCategory);

export default router;
