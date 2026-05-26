import * as XLSX from "xlsx";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../utils/password";
import { Prisma } from "@prisma/client";

// ── Column header mapping ──────────────────────────────────────────────
const COLUMN_MAP: Record<string, string> = {
  "ID Nomina": "payrollType",
  "Clave de Participante": "payrollCode",
  "Nombre": "fullName",
  "Aportación Empleado": "employeeContribution",
  "Total Aportaciones": "totalContributions",
  "Total Rendimientos": "yields",
  "Total Egresos": "withdrawals",
  "TOTAL": "totalBalance",
  "Saldo en Prestamos": "loanBalance",
  "Saldo": "finalBalance",
};

interface ParsedRow {
  payrollType: string;
  payrollCode: string;
  fullName: string;
  employeeContribution: number;
  totalContributions: number;
  yields: number;
  withdrawals: number;
  totalBalance: number;
  loanBalance: number;
  finalBalance: number;
}

export interface ProcessResult {
  recordsProcessed: number;
  newUsersCreated: number;
  errors: string[];
  credentials: { username: string; tempPassword?: string }[];
}

/**
 * Determines whether a row should be excluded from processing.
 */
function shouldExcludeRow(row: Record<string, unknown>): boolean {
  const payrollType = String(row["payrollType"] ?? "").trim();
  const payrollCode = String(row["payrollCode"] ?? "").trim();
  const keys = Object.keys(row);
  const firstKey = keys[0];
  const firstCellValue = firstKey ? String(row[firstKey] ?? "").trim() : "";

  if (payrollType === "MOV") return true;
  if (payrollCode === "999999" || payrollCode === "777777") return true;
  if (firstCellValue === "TOTALES") return true;
  if (!payrollType || !payrollCode || !row["fullName"]) return true;

  return false;
}

/**
 * Parses the Excel buffer and extracts employee rows from the
 * "Listado Empleados" sheet. Headers are expected on row 3.
 */
function parseExcel(buffer: Buffer): ParsedRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });

  const sheetName =
    workbook.SheetNames.find((name) =>
      name.toLowerCase().includes("listado empleados")
    ) ?? workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("El archivo Excel no contiene ninguna hoja.");
  }

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`No se encontró la hoja "${sheetName}" en el archivo.`);
  }

  // Parse as JSON starting from row 3 (header = row index 2)
  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  }) as unknown as Record<string, unknown>[];

  // Find the header row (row 3 = index 2, but scan up to row 10 as safety)
  let headerRowIndex = -1;
  let headers: string[] = [];

  for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
    const row = rawRows[i] as unknown as unknown[];
    if (!Array.isArray(row)) continue;
    const rowStrings = row.map((cell) => String(cell ?? "").trim());
    if (
      rowStrings.some((s) => s === "ID Nomina" || s === "Nombre")
    ) {
      headerRowIndex = i;
      headers = rowStrings;
      break;
    }
  }

  if (headerRowIndex === -1) {
    throw new Error(
      'No se encontró la fila de encabezados. Se esperan columnas como "ID Nomina", "Nombre", etc.'
    );
  }

  // Map header names to our internal field names
  const colIndices: Record<string, number> = {};
  headers.forEach((header, idx) => {
    const mapped = COLUMN_MAP[header];
    if (mapped) {
      colIndices[mapped] = idx;
    }
  });

  // Validate required columns exist
  const requiredFields = [
    "payrollType",
    "payrollCode",
    "fullName",
    "employeeContribution",
    "totalContributions",
    "yields",
    "withdrawals",
    "totalBalance",
    "finalBalance",
  ];

  const missingFields = requiredFields.filter((f) => !(f in colIndices));
  if (missingFields.length > 0) {
    throw new Error(
      `Columnas faltantes en el archivo: ${missingFields.join(", ")}`
    );
  }

  // Extract data rows
  const dataRows = rawRows.slice(headerRowIndex + 1) as unknown as unknown[][];
  const parsedRows: ParsedRow[] = [];

  for (const rawRow of dataRows) {
    if (!Array.isArray(rawRow)) continue;

    const mapped: Record<string, unknown> = {};
    for (const [field, idx] of Object.entries(colIndices)) {
      mapped[field] = rawRow[idx];
    }

    if (shouldExcludeRow(mapped)) continue;

    const row: ParsedRow = {
      payrollType: String(mapped.payrollType).trim(),
      payrollCode: String(mapped.payrollCode).trim(),
      fullName: String(mapped.fullName).trim(),
      employeeContribution: toNumber(mapped.employeeContribution),
      totalContributions: toNumber(mapped.totalContributions),
      yields: toNumber(mapped.yields),
      withdrawals: toNumber(mapped.withdrawals),
      totalBalance: toNumber(mapped.totalBalance),
      loanBalance: toNumber(mapped.loanBalance ?? 0),
      finalBalance: toNumber(mapped.finalBalance),
    };

    parsedRows.push(row);
  }

  return parsedRows;
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

/**
 * Processes an uploaded Excel file:
 * 1. Parses rows from the spreadsheet
 * 2. Upserts Employee records
 * 3. Upserts EmployeeMonthlyRecord records
 * 4. Creates User accounts for new employees (temporary credentials)
 * 5. Logs the upload
 *
 * All DB operations run inside a transaction.
 */
export async function processExcelUpload(
  buffer: Buffer,
  filename: string,
  periodDate: Date,
  adminId: string
): Promise<ProcessResult> {
  const rows = parseExcel(buffer);

  if (rows.length === 0) {
    // Log the empty upload
    await prisma.uploadLog.create({
      data: {
        adminId,
        filename,
        periodDate,
        status: "WARNING",
        recordsProcessed: 0,
        newUsersCreated: 0,
        errorMessage: "No se encontraron filas válidas en el archivo.",
      },
    });
    throw new Error("No se encontraron filas válidas en el archivo.");
  }

  let newUsersCreated = 0;
  const errors: string[] = [];
  const credentials: { username: string; tempPassword?: string }[] = [];

  // Process in a transaction
  await prisma.$transaction(
    async (tx) => {
      for (const row of rows) {
        try {
          // 1) Upsert Employee
          const employee = await tx.employee.upsert({
            where: {
              payrollType_payrollCode: {
                payrollType: row.payrollType,
                payrollCode: row.payrollCode,
              },
            },
            update: {
              fullName: row.fullName,
              isActive: true,
            },
            create: {
              payrollType: row.payrollType,
              payrollCode: row.payrollCode,
              fullName: row.fullName,
              isActive: true,
            },
          });

          // 2) If employee has no linked User, create one
          if (!employee.userId) {
            const username = `${row.payrollType}-${row.payrollCode}`;
            const tempPassword = `Temp2026!${Math.floor(
              1000 + Math.random() * 9000
            )}`;
            const passwordHash = await hashPassword(tempPassword);

            // Check if username already exists (edge case)
            const existingUser = await tx.user.findUnique({
              where: { username },
            });

            if (!existingUser) {
              const newUser = await tx.user.create({
                data: {
                  username,
                  passwordHash,
                  role: "USER",
                  mustChangePassword: true,
                },
              });

              await tx.employee.update({
                where: { id: employee.id },
                data: { userId: newUser.id },
              });

              newUsersCreated++;
              credentials.push({ username, tempPassword });
            } else {
              // Link existing user to employee if not already linked
              await tx.employee.update({
                where: { id: employee.id },
                data: { userId: existingUser.id },
              });
            }
          }

          // 3) Upsert monthly record
          await tx.employeeMonthlyRecord.upsert({
            where: {
              employeeId_periodDate: {
                employeeId: employee.id,
                periodDate,
              },
            },
            update: {
              employeeContribution: new Prisma.Decimal(
                row.employeeContribution
              ),
              totalContributions: new Prisma.Decimal(row.totalContributions),
              yields: new Prisma.Decimal(row.yields),
              withdrawals: new Prisma.Decimal(row.withdrawals),
              totalBalance: new Prisma.Decimal(row.totalBalance),
              loanBalance: new Prisma.Decimal(row.loanBalance),
              finalBalance: new Prisma.Decimal(row.finalBalance),
            },
            create: {
              employeeId: employee.id,
              periodDate,
              employeeContribution: new Prisma.Decimal(
                row.employeeContribution
              ),
              totalContributions: new Prisma.Decimal(row.totalContributions),
              yields: new Prisma.Decimal(row.yields),
              withdrawals: new Prisma.Decimal(row.withdrawals),
              totalBalance: new Prisma.Decimal(row.totalBalance),
              loanBalance: new Prisma.Decimal(row.loanBalance),
              finalBalance: new Prisma.Decimal(row.finalBalance),
            },
          });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Error desconocido";
          errors.push(
            `Fila ${row.payrollType}-${row.payrollCode}: ${message}`
          );
        }
      }
    },
    {
      maxWait: 30000,
      timeout: 60000,
    }
  );

  const status = errors.length > 0 ? "PARTIAL" : "SUCCESS";

  // Log the upload
  await prisma.uploadLog.create({
    data: {
      adminId,
      filename,
      periodDate,
      status,
      recordsProcessed: rows.length - errors.length,
      newUsersCreated,
      errorMessage: errors.length > 0 ? errors.join("; ") : null,
    },
  });

  return {
    recordsProcessed: rows.length - errors.length,
    newUsersCreated,
    errors,
    credentials,
  };
}
