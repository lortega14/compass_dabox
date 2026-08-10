import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { generalLimiter } from "./middleware/rate-limit";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import userRoutes from "./routes/user.routes";

const app = express();

// ── Global Middleware ──────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.endsWith(".vercel.app") ||
        env.CORS_ORIGIN === "*" ||
        env.CORS_ORIGIN === origin
      ) {
        callback(null, true);
      } else {
        callback(null, env.CORS_ORIGIN);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(generalLimiter);

// ── Health Check ───────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ─────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

// ── 404 Catch-All ──────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada." });
});

// ── Global Error Handler ───────────────────────────────────────────────
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);

    // Multer errors (file size, etc.)
    if (err.message && err.message.includes("Solo se permiten")) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.status(500).json({
      error:
        env.NODE_ENV === "production"
          ? "Error interno del servidor."
          : err.message,
    });
  }
);

// ── Start Server (Only when run directly, not in Vercel serverless) ───────
if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`🚀 Compass DABox backend running on port ${env.PORT}`);
    console.log(`   Environment: ${env.NODE_ENV}`);
  });
}

export default app;
