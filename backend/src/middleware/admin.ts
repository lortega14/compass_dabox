import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";

/**
 * Middleware that gates a route to ADMIN-only access.
 * Must be used AFTER authMiddleware so req.user is populated.
 */
export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: "No autenticado." });
    return;
  }

  if (req.user.role !== Role.ADMIN) {
    res.status(403).json({ error: "Acceso denegado. Se requiere rol de administrador." });
    return;
  }

  next();
}
