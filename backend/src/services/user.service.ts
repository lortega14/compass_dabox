import { prisma } from "../lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function getEmployeeProfile(userId: string) {
  const employee = await prisma.employee.findUnique({
    where: { userId },
    select: {
      id: true,
      payrollType: true,
      payrollCode: true,
      fullName: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!employee) {
    throw new Error("No se encontró el registro de empleado asociado a su cuenta.");
  }

  return employee;
}

export async function getEmployeeRecords(userId: string) {
  const employee = await prisma.employee.findUnique({
    where: { userId },
  });

  if (!employee) {
    throw new Error("No se encontró el registro de empleado asociado a su cuenta.");
  }

  const records = await prisma.employeeMonthlyRecord.findMany({
    where: { employeeId: employee.id },
    orderBy: { periodDate: "desc" },
  });

  // Convert Decimals to numbers for JSON
  return records.map((r) => ({
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
  }));
}

export async function getEmployeeSummary(userId: string) {
  const employee = await prisma.employee.findUnique({
    where: { userId },
  });

  if (!employee) {
    throw new Error("No se encontró el registro de empleado asociado a su cuenta.");
  }

  // Get the latest record for current balances
  const latestRecord = await prisma.employeeMonthlyRecord.findFirst({
    where: { employeeId: employee.id },
    orderBy: { periodDate: "desc" },
  });

  if (!latestRecord) {
    return {
      fullName: employee.fullName,
      payrollType: employee.payrollType,
      payrollCode: employee.payrollCode,
      currentBalance: 0,
      totalContributions: 0,
      totalYields: 0,
      totalWithdrawals: 0,
      loanBalance: 0,
      finalBalance: 0,
      lastPeriod: null,
      recordCount: 0,
    };
  }

  const recordCount = await prisma.employeeMonthlyRecord.count({
    where: { employeeId: employee.id },
  });

  return {
    fullName: employee.fullName,
    payrollType: employee.payrollType,
    payrollCode: employee.payrollCode,
    currentBalance: Number(latestRecord.totalBalance),
    totalContributions: Number(latestRecord.totalContributions),
    totalYields: Number(latestRecord.yields),
    totalWithdrawals: Number(latestRecord.withdrawals),
    loanBalance: Number(latestRecord.loanBalance),
    finalBalance: Number(latestRecord.finalBalance),
    lastPeriod: latestRecord.periodDate,
    lastUpdated: latestRecord.updatedAt,
    recordCount,
  };
}
