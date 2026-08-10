import { Request, Response } from "express";
import { z } from "zod";
import * as authService from "../services/auth.service";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { comparePassword, hashPassword, validatePasswordStrength } from "../utils/password";

const loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  password: z.string().optional(),
});

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: "Datos inválidos",
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { username, password } = validation.data;
    const result = await authService.login(username, password);

    // Set HTTP-only cookie
    const isProduction = env.NODE_ENV === "production";
    res.cookie("access_token", result.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
    });

    res.json({
      user: result.user,
      mustChangePassword: result.user.mustChangePassword,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al iniciar sesión";
    res.status(401).json({ error: message });
  }
}

export async function changePassword(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const validation = changePasswordSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: "Datos inválidos",
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { currentPassword, newPassword, password } = validation.data;
    const finalNewPassword = newPassword || password;

    if (!finalNewPassword) {
      res.status(400).json({ error: "La nueva contraseña es requerida." });
      return;
    }

    const userId = req.user!.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ error: "Usuario no encontrado." });
      return;
    }

    // Verify current password only if they don't have mustChangePassword active
    if (!user.mustChangePassword) {
      if (!currentPassword) {
        res.status(400).json({ error: "La contraseña actual es requerida." });
        return;
      }
      const validCurrent = await comparePassword(currentPassword, user.passwordHash);
      if (!validCurrent) {
        res.status(400).json({ error: "La contraseña actual es incorrecta." });
        return;
      }
    }

    const strength = validatePasswordStrength(finalNewPassword);
    if (!strength.valid) {
      res.status(400).json({ error: strength.message! });
      return;
    }

    const newHash = await hashPassword(finalNewPassword);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
      include: {
        employee: true,
      },
    });

    res.json({
      message: "Contraseña actualizada exitosamente.",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role,
        mustChangePassword: updatedUser.mustChangePassword,
        employee: updatedUser.employee
          ? {
              fullName: updatedUser.employee.fullName,
            }
          : null,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cambiar contraseña";
    res.status(400).json({ error: message });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  const isProduction = env.NODE_ENV === "production";
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  });
  res.json({ message: "Sesión cerrada exitosamente." });
}

export async function me(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const user = await authService.getMe(userId);
    res.json({ user });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al obtener usuario";
    res.status(404).json({ error: message });
  }
}
