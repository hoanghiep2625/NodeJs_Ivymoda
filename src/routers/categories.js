import { Router } from "express";
import {
    createCategory,
    getCategories,
    getCategoryById,
    deleteCategory,
    updateCategory
} from "../controllers/categories.js";

import { checkAuth } from "../middlewares/checkAuth.js";

const router = Router();

router.get("/categories", getCategories);
router.get("/categories/:id", getCategoryById);
export default router;
