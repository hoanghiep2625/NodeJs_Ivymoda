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
router.post("/categories", checkAuth, createCategory);
router.delete("/categories/:id", checkAuth, deleteCategory);
router.put("/categories/:id", checkAuth, updateCategory);

export default router;
