"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/use-auth";
import { api } from "../../../lib/api";
import { formatCurrency, formatDate, formatDateTime } from "../../../lib/format";
import { UserSummary, EmployeeMonthlyRecord } from "../../../types";
import { KPICard } from "../../../components/dashboard/kpi-card";
import { BarChart } from "../../../components/charts/bar-chart";
import { AreaChart } from "../../../components/charts/area-chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  Percent,
  Calendar,
  Layers,
  BarChart3,
  AreaChart as AreaIcon,
  BadgeAlert,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "../../../components/ui/skeleton";

export default function UserDashboard() {
  // Verify USER role, protect route
  const { user } = useAuth("USER");

  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [records, setRecords] = useState<EmployeeMonthlyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, recordsRes] = await Promise.all([
          api.get<{ summary: UserSummary }>("/api/user/summary"),
          api.get<{ records: EmployeeMonthlyRecord[] }>("/api/user/records"),
        ]);
        setSummary(summaryRes.data.summary);
        setRecords(recordsRes.data.records);
      } catch (error) {
        console.error("Error al cargar datos del colaborador:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format today's date
  const getGreetingDate = () => {
    return new Intl.DateTimeFormat("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  };

  // Get user's first name
  const getFirstName = () => {
    const fullName = summary?.employeeName || user?.employee?.fullName;
    if (!fullName) return user?.username || "";
    return fullName.trim().split(" ")[0];
  };

  // Prepare chart data (needs chronological order: oldest to newest)
  const chartData = [...records]
    .reverse()
    .map((rec) => ({
      periodo: formatDate(rec.periodDate),
      "Saldo Acumulado": rec.finalBalance,
      "Ahorrado": rec.totalContributions,
      "Rendimientos": rec.yields,
    }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-slate-200" />
          <Skeleton className="h-4 w-72 bg-slate-200" />
        </div>

        {/* KPIs Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28 bg-slate-200 rounded-2xl" />
          <Skeleton className="h-28 bg-slate-200 rounded-2xl" />
          <Skeleton className="h-28 bg-slate-200 rounded-2xl" />
          <Skeleton className="h-28 bg-slate-200 rounded-2xl" />
        </div>

        {/* Chart Skeleton */}
        <Skeleton className="h-96 bg-slate-200 rounded-2xl" />

        {/* Table Skeleton */}
        <Skeleton className="h-60 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  // Define chart parameters
  const chartSeries = [
    {
      key: "Saldo Acumulado",
      name: "Saldo Final",
      color: "#FF5A00", // Naranja Vibrante
    },
    {
      key: "Ahorrado",
      name: "Aportaciones",
      color: "#283A7F", // Azul Marino
    },
  ];

  return (
    <div className="space-y-6">
      {/* Greetings Header */}
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-955 md:text-3xl">
            Hola, {getFirstName()} 👋
          </h2>
          <p className="text-sm text-slate-500">
            Aquí está el balance actual de tus fondos de ahorro.
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-1.5">
          <div className="inline-flex items-center gap-2 rounded-xl bg-white/80 border border-slate-300 px-4 py-2 text-xs text-slate-600">
            <Calendar className="h-4 w-4 text-indigo-650" />
            <span className="capitalize">{getGreetingDate()}</span>
          </div>
          {summary?.lastUpdated && (
            <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-1.5 text-[11px] text-emerald-700 font-medium">
              <RefreshCw className="h-3 w-3" />
              Datos actualizados al {formatDateTime(summary.lastUpdated)}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Mi Saldo Total"
          value={summary?.currentBalance ?? 0}
          icon={Wallet}
          formatter={formatCurrency}
          subtitle="Saldo acumulado a la fecha"
          accentColor="orange"
          className="stagger-1 animate-fade-in-up"
        />
        <KPICard
          title="Mis Aportaciones"
          value={summary?.totalContributions ?? 0}
          icon={PiggyBank}
          formatter={formatCurrency}
          subtitle="Total acumulado sin rendimientos"
          accentColor="navy"
          className="stagger-2 animate-fade-in-up"
        />
        <KPICard
          title="Rendimientos Generados"
          value={summary?.totalYields ?? 0}
          icon={TrendingUp}
          formatter={formatCurrency}
          subtitle="Ganancias distribuidas por intereses"
          accentColor="green"
          className="stagger-3 animate-fade-in-up"
        />
        <KPICard
          title="Saldo de Préstamo"
          value={summary?.loanBalance ?? 0}
          icon={Percent}
          formatter={formatCurrency}
          subtitle="Adeudo pendiente de amortizar"
          accentColor="rose"
          className="stagger-4 animate-fade-in-up"
        />
      </div>

      {/* Graph Area */}
      <Card className="glass-card shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-md font-bold text-slate-955">
              Evolución de Fondos
            </CardTitle>
            <p className="text-xs text-slate-500">
              Histórico mensual de tus saldos y aportaciones acumuladas.
            </p>
          </div>
          
          {/* Chart selector controls */}
          <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setChartType("area")}
              className={`h-7 px-3 rounded-md text-xs transition-premium ${
                chartType === "area"
                  ? "bg-white text-indigo-655 font-bold shadow-sm"
                  : "text-slate-500 hover:text-slate-950"
              }`}
            >
              <AreaIcon className="mr-1 h-3.5 w-3.5" />
              Área
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setChartType("bar")}
              className={`h-7 px-3 rounded-md text-xs transition-premium ${
                chartType === "bar"
                  ? "bg-white text-indigo-655 font-bold shadow-sm"
                  : "text-slate-500 hover:text-slate-955"
              }`}
            >
              <BarChart3 className="mr-1 h-3.5 w-3.5" />
              Barras
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {chartType === "area" ? (
            <AreaChart data={chartData} xKey="periodo" series={chartSeries} height={320} />
          ) : (
            <BarChart data={chartData} xKey="periodo" series={chartSeries} height={320} />
          )}
        </CardContent>
      </Card>

      {/* History table */}
      <Card className="glass-card shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-bold text-slate-955">
            Desglose de Movimientos
          </CardTitle>
          <p className="text-xs text-slate-500">
            Listado completo de abonos, rendimientos e historial financiero mes con mes.
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-slate-200 overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-slate-600 font-semibold py-3">Periodo</TableHead>
                  <TableHead className="text-slate-600 font-semibold py-3">Ahorro Mensual</TableHead>
                  <TableHead className="text-slate-600 font-semibold py-3">Ahorro Acumulado</TableHead>
                  <TableHead className="text-slate-600 font-semibold py-3">Rendimientos</TableHead>
                  <TableHead className="text-slate-600 font-semibold py-3">Retiros</TableHead>
                  <TableHead className="text-slate-600 font-semibold py-3">Saldo Préstamo</TableHead>
                  <TableHead className="text-right text-slate-600 font-semibold py-3">Saldo Final</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-200">
                {records.length > 0 ? (
                  records.map((rec) => (
                    <TableRow
                      key={rec.id}
                      className="border-b border-slate-200 hover:bg-slate-50/50 transition-premium"
                    >
                      <TableCell className="py-3 text-sm font-semibold text-slate-950 capitalize">
                        {formatDate(rec.periodDate)}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-slate-700">
                        {formatCurrency(rec.employeeContribution)}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-slate-700">
                        {formatCurrency(rec.totalContributions)}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-emerald-700 font-bold">
                        {rec.yields > 0 ? (
                          <span className="flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                            {formatCurrency(rec.yields)}
                          </span>
                        ) : (
                          "$0.00 MXN"
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-rose-700 font-semibold">
                        {rec.withdrawals > 0 ? (
                          <span className="flex items-center gap-1">
                            <ArrowDownRight className="h-3 w-3 text-rose-600" />
                            {formatCurrency(rec.withdrawals)}
                          </span>
                        ) : (
                          "$0.00 MXN"
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-slate-600">
                        {formatCurrency(rec.loanBalance)}
                      </TableCell>
                      <TableCell className="py-3 text-sm font-bold text-right text-slate-950">
                        {formatCurrency(rec.finalBalance)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <td
                      colSpan={7}
                      className="h-28 text-center text-slate-500 text-sm"
                    >
                      No se encontraron registros de nómina.
                    </td>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
