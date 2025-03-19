import { Router } from "express";
import { login, register, requestRefreshToken } from "../controllers/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", requestRefreshToken);

export default router;
