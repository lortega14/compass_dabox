"use client";

import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Skeleton } from "../ui/skeleton";
import { api } from "../../lib/api";
import { formatCurrency, formatDate } from "../../lib/format";
import { EmployeeMonthlyRecord } from "../../types";
import { Landmark, TrendingUp, DollarSign, Receipt, Eye } from "lucide-react";

interface EmployeeHistoryDrawerProps {
  employeeId: string | null;
  employeeName: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface HistoryResponse {
  employee: {
    id: string;
    fullName: string;
    payrollType: string;
    payrollCode: string;
  };
  records: EmployeeMonthlyRecord[];
}

export function EmployeeHistoryDrawer({
  employeeId,
  employeeName,
  isOpen,
  onClose,
}: EmployeeHistoryDrawerProps) {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !employeeId) {
      setData(null);
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<HistoryResponse>(
          `/api/admin/employees/${employeeId}/records`
        );
        setData(response.data);
      } catch (error) {
        console.error("Error al obtener historial del colaborador:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [isOpen, employeeId]);

  // Aggregate values from current list of records for quick stat highlights
  const getLatestStats = () => {
    if (!data?.records || data.records.length === 0) {
      return { balance: 0, contributions: 0, yields: 0, loan: 0 };
    }
    const latest = data.records[0]; // first item is newest
    
    // Sum total yields and contributions
    let sumContributions = 0;
    let sumYields = 0;
    data.records.forEach((r) => {
      sumContributions += r.employeeContribution;
      sumYields += r.yields;
    });

    return {
      balance: latest.finalBalance,
      contributions: latest.totalContributions,
      yields: sumYields,
      loan: latest.loanBalance,
    };
  };

  const stats = getLatestStats();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="glass-panel w-full data-[side=right]:sm:max-w-2xl border-l border-slate-200 text-slate-950 flex flex-col p-6 bg-background"
      >
        <SheetHeader className="mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-650 border border-indigo-600/20">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle className="text-lg font-bold text-slate-950 text-left">
                Historial de Ahorros
              </SheetTitle>
              <SheetDescription className="text-slate-500 text-sm text-left">
                {employeeName || "Cargando colaborador..."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {isLoading ? (
          // Drawer Loading Skeleton
          <div className="space-y-6 flex-1 overflow-hidden">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 bg-slate-200 rounded-xl" />
              <Skeleton className="h-20 bg-slate-200 rounded-xl" />
              <Skeleton className="h-20 bg-slate-200 rounded-xl" />
              <Skeleton className="h-20 bg-slate-200 rounded-xl" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-8 bg-slate-200 rounded-xl" />
              <Skeleton className="h-32 bg-slate-200 rounded-xl" />
            </div>
          </div>
        ) : data ? (
          <div className="flex-1 flex flex-col min-h-0 space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium block">
                  Saldo Final
                </span>
                <span className="text-sm font-bold text-slate-950 mt-1 block">
                  {formatCurrency(stats.balance)}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium block">
                  Total Ahorrado
                </span>
                <span className="text-sm font-bold text-indigo-650 mt-1 block">
                  {formatCurrency(stats.contributions)}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium block">
                  Rendimientos
                </span>
                <span className="text-sm font-bold text-emerald-700 mt-1 block">
                  {formatCurrency(stats.yields)}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium block">
                  Préstamos Act.
                </span>
                <span className="text-sm font-bold text-rose-700 mt-1 block">
                  {formatCurrency(stats.loan)}
                </span>
              </div>
            </div>
            {/* History Table */}
            <div className="flex-1 flex flex-col min-h-0">
              <h3 className="text-sm font-semibold text-slate-950 mb-3 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-indigo-650" />
                Registros Mensuales
              </h3>

              <div className="flex-1 overflow-auto border border-slate-200 rounded-2xl bg-white/50">
                <Table className="relative">
                  <TableHeader className="bg-slate-50 sticky top-0 border-b border-slate-200 z-10">
                    <TableRow className="border-none hover:bg-transparent">
                      <TableHead className="text-slate-600 text-xs font-semibold py-2.5">Periodo</TableHead>
                      <TableHead className="text-slate-600 text-xs font-semibold py-2.5">Ahorro Emp.</TableHead>
                      <TableHead className="text-slate-600 text-xs font-semibold py-2.5">Ahorro Tot.</TableHead>
                      <TableHead className="text-slate-600 text-xs font-semibold py-2.5">Rendimientos</TableHead>
                      <TableHead className="text-slate-600 text-xs font-semibold py-2.5">Retiros</TableHead>
                      <TableHead className="text-slate-600 text-xs font-semibold py-2.5">Préstamo</TableHead>
                      <TableHead className="text-slate-600 text-xs font-semibold py-2.5 text-right">Saldo Final</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-200">
                    {data.records.length > 0 ? (
                      data.records.map((record) => (
                        <TableRow
                          key={record.id}
                          className="hover:bg-slate-50/50 transition-premium border-b border-slate-200"
                        >
                          <td className="px-4 py-3 text-xs font-semibold text-slate-950 capitalize">
                            {formatDate(record.periodDate)}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-700">
                            {formatCurrency(record.employeeContribution)}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-700">
                            {formatCurrency(record.totalContributions)}
                          </td>
                          <td className="px-4 py-3 text-xs text-emerald-700 font-medium">
                            {record.yields > 0 ? `+${formatCurrency(record.yields)}` : "$0.00 MXN"}
                          </td>
                          <td className="px-4 py-3 text-xs text-rose-700">
                            {record.withdrawals > 0 ? `-${formatCurrency(record.withdrawals)}` : "$0.00 MXN"}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">
                            {formatCurrency(record.loanBalance)}
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-right text-slate-950">
                            {formatCurrency(record.finalBalance)}
                          </td>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <td
                          colSpan={7}
                          className="px-4 py-12 text-center text-xs text-slate-500"
                        >
                          No hay registros históricos cargados.
                        </td>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-sm">
            No se cargaron datos correctamente
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
