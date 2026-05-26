import { Request, Response } from "express";
import * as userService from "../services/user.service";

// ── GET /api/user/profile ──────────────────────────────────────────────
export async function getProfile(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = req.user!.id;
    const profile = await userService.getEmployeeProfile(userId);
    res.json({ profile });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al obtener perfil";
    res.status(404).json({ error: message });
  }
}

// ── GET /api/user/records ──────────────────────────────────────────────
export async function getRecords(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = req.user!.id;
    const records = await userService.getEmployeeRecords(userId);
    res.json({ records });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al obtener registros";
    res.status(404).json({ error: message });
  }
}

// ── GET /api/user/summary ──────────────────────────────────────────────
export async function getSummary(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = req.user!.id;
    const summary = await userService.getEmployeeSummary(userId);
    res.json({ summary });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al obtener resumen";
    res.status(404).json({ error: message });
  }
}
