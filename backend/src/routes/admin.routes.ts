import { Router } from "express";
import multer from "multer";
import * as adminController from "../controllers/admin.controller";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { uploadLimiter } from "../middleware/rate-limit";

const router = Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// File upload config: memory storage, max 10MB, Excel only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos Excel (.xlsx, .xls)"));
    }
  },
});

router.post(
  "/upload",
  uploadLimiter,
  upload.single("file"),
  adminController.uploadExcel
);
router.get("/dashboard", adminController.getDashboard);
router.get("/employees", adminController.getEmployees);
router.get("/employees/:id/records", adminController.getEmployeeRecords);
router.get("/upload-logs", adminController.getUploadLogs);

export default router;
