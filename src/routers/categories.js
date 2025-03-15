import { Router } from "express";
import {
    createCategory
} from "../controllers/categories";

import { checkAuth } from "../middlewares/checkAuth";

const router = Router();

// router.get("/categories", getProducts);
// router.get("/categories/:id", getProductById);
router.post("/categories", checkAuth, createCategory);
// router.delete("/categories/:id", checkAuth, removeProduct);
// router.put("/categories/:id", checkAuth, updateProduct);

export default router;
