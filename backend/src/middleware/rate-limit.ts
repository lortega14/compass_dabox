import rateLimit from "express-rate-limit";
import { env } from "../config/env";

/**
 * General API rate limit: 100 requests per 15 minutes per IP.
 * Skipped in development.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "development",
  message: {
    error: "Demasiadas solicitudes. Intente de nuevo más tarde.",
  },
});

/**
 * Stricter rate limit for auth endpoints: 10 requests per 15 minutes per IP.
 * Skipped in development.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "development",
  message: {
    error: "Demasiados intentos de autenticación. Intente de nuevo más tarde.",
  },
});

/**
 * Upload rate limit: 5 uploads per 15 minutes per IP.
 * Skipped in development.
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "development",
  message: {
    error: "Demasiadas cargas de archivos. Intente de nuevo más tarde.",
  },
});
