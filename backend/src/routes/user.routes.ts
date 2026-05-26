import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

router.get("/profile", userController.getProfile);
router.get("/records", userController.getRecords);
router.get("/summary", userController.getSummary);

export default router;
