import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { processExcelUpload } from "../services/excel-processor.service";

const uploadSchema = z.object({
  periodDate: z
    .string()
    .min(1, "La fecha del periodo es requerida")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Formato de fecha inválido",
    }),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(5000).default(20),
  search: z.string().optional(),
});

// ── POST /api/admin/upload ─────────────────────────────────────────────
export async function uploadExcel(
  req: Request,
  res: Response
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No se proporcionó ningún archivo." });
      return;
    }

    const validation = uploadSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: "Datos inválidos",
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const periodDate = new Date(validation.data.periodDate);
    const adminId = req.user!.id;

    const result = await processExcelUpload(
      req.file.buffer,
      req.file.originalname,
      periodDate,
      adminId
    );

    res.json({
      message: "Archivo procesado exitosamente.",
      ...result,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al procesar el archivo";
    res.status(400).json({ error: message });
  }
}

// ── GET /api/admin/dashboard ───────────────────────────────────────────
export async function getDashboard(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    // Total active employees
    const employeeCount = await prisma.employee.count({
      where: { isActive: true },
    });

    // Sum of all final balances from latest records per employee
    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      include: {
        monthlyRecords: {
          orderBy: { periodDate: "desc" },
          take: 1,
          select: {
            finalBalance: true,
            yields: true,
            totalContributions: true,
          },
        },
      },
    });

    let totalBalance = 0;
    let totalYields = 0;
    let totalContributions = 0;

    for (const emp of employees) {
      const latestRecord = emp.monthlyRecords[0];
      if (latestRecord) {
        totalBalance += Number(latestRecord.finalBalance);
        totalYields += Number(latestRecord.yields);
        totalContributions += Number(latestRecord.totalContributions);
      }
    }

    // Monthly growth: sum of finalBalance grouped by periodDate (last 12 months)
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 12);

    const monthlyGrowthRaw = await prisma.employeeMonthlyRecord.groupBy({
      by: ["periodDate"],
      where: {
        periodDate: {
          gte: cutoffDate,
        },
      },
      _sum: {
        finalBalance: true,
      },
      orderBy: {
        periodDate: "asc",
      },
    });

    const monthlyGrowth = monthlyGrowthRaw.map((m) => ({
      period: m.periodDate,
      total: Number(m._sum.finalBalance ?? 0),
    }));

    res.json({
      employeeCount,
      totalBalance,
      totalYields,
      totalContributions,
      monthlyGrowth,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al obtener dashboard";
    res.status(500).json({ error: message });
  }
}

// ── GET /api/admin/employees ───────────────────────────────────────────
export async function getEmployees(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const validation = paginationSchema.safeParse(req.query);
    if (!validation.success) {
      res.status(400).json({
        error: "Parámetros inválidos",
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { page, limit, search } = validation.data;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" as const } },
            { payrollCode: { contains: search, mode: "insensitive" as const } },
            { payrollType: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fullName: "asc" },
        include: {
          user: {
            select: { username: true, mustChangePassword: true },
          },
          monthlyRecords: {
            orderBy: { periodDate: "desc" },
            take: 1,
            select: { finalBalance: true },
          },
        },
      }),
      prisma.employee.count({ where }),
    ]);

    res.json({
      employees: employees.map((emp) => ({
        id: emp.id,
        userId: emp.userId,
        payrollType: emp.payrollType,
        payrollCode: emp.payrollCode,
        fullName: emp.fullName,
        isActive: emp.isActive,
        createdAt: emp.createdAt,
        updatedAt: emp.updatedAt,
        user: emp.user,
        currentBalance: Number(emp.monthlyRecords[0]?.finalBalance ?? 0),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al obtener empleados";
    res.status(500).json({ error: message });
  }
}

// ── GET /api/admin/employees/:id/records ───────────────────────────────
export async function getEmployeeRecords(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = String(req.params.id);

    const employee = await prisma.employee.findUnique({
      where: { id },
      select: { id: true, fullName: true, payrollType: true, payrollCode: true },
    });

    if (!employee) {
      res.status(404).json({ error: "Empleado no encontrado." });
      return;
    }

    const records = await prisma.employeeMonthlyRecord.findMany({
      where: { employeeId: id },
      orderBy: { periodDate: "desc" },
    });

    res.json({
      employee,
      records: records.map((r) => ({
        id: r.id,
        periodDate: r.periodDate,
        employeeContribution: Number(r.employeeContribution),
        totalContributions: Number(r.totalContributions),
        yields: Number(r.yields),
        withdrawals: Number(r.withdrawals),
        totalBalance: Number(r.totalBalance),
        loanBalance: Number(r.loanBalance),
        finalBalance: Number(r.finalBalance),
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al obtener registros";
    res.status(500).json({ error: message });
  }
}

// ── GET /api/admin/upload-logs ─────────────────────────────────────────
export async function getUploadLogs(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const logs = await prisma.uploadLog.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        admin: { select: { username: true } },
      },
    });

    res.json({ logs });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al obtener logs de carga";
    res.status(500).json({ error: message });
  }
}
