import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth";
import { authLimiter } from "../middleware/rate-limit";

const router = Router();

// Public routes (rate-limited)
router.post("/login", authLimiter, authController.login);
router.post("/logout", authController.logout);

// Protected routes
router.post("/change-password", authMiddleware, authController.changePassword);
router.get("/me", authMiddleware, authController.me);

export default router;
