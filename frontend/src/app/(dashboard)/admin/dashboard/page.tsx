"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { DashboardStats, UploadLog } from "@/types";
import { KPICard } from "@/components/dashboard/kpi-card";
import { AreaChart } from "@/components/charts/area-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  TrendingUp,
  PiggyBank,
  Landmark,
  Upload,
  UserCheck,
  FileText,
  Clock,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  // Protect route to ADMIN only
  const { user } = useAuth("ADMIN");

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [logs, setLogs] = useState<UploadLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [statsRes, logsRes] = await Promise.all([
        api.get<DashboardStats>("/api/admin/dashboard"),
        api.get<{ logs: UploadLog[] }>("/api/admin/upload-logs"),
      ]);
      setStats(statsRes.data);
      setLogs(logsRes.data.logs.slice(0, 5)); // show top 5 logs
    } catch (error) {
      console.error("Error al obtener datos administrativos:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData(true);
  };

  // Convert monthlyGrowth to Recharts format
  const chartData = (stats?.monthlyGrowth || []).map((item) => ({
    periodo: formatDate(item.period),
    "Fondo Total": item.total,
  }));

  const chartSeries = [
    {
      key: "Fondo Total",
      name: "Saldo Acumulado",
      color: "#FF5A00", // Naranja Vibrante
    },
  ];

  const getStatusBadge = (status: UploadLog["status"]) => {
    switch (status) {
      case "SUCCESS":
        return (
          <Badge className="bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20 text-emerald-400 font-medium rounded-lg">
            Éxito
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/20 text-rose-455 font-medium rounded-lg">
            Fallido
          </Badge>
        );
      case "PARTIAL":
      case "WARNING":
        return (
          <Badge className="bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/20 text-amber-400 font-medium rounded-lg">
            Advertencia
          </Badge>
        );
      default:
        return <Badge className="bg-slate-500/10 border-slate-500/20 text-slate-400 font-medium rounded-lg">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48 bg-slate-200" />
          <Skeleton className="h-9 w-28 bg-slate-200" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28 bg-slate-200 rounded-2xl" />
          <Skeleton className="h-28 bg-slate-200 rounded-2xl" />
          <Skeleton className="h-28 bg-slate-200 rounded-2xl" />
          <Skeleton className="h-28 bg-slate-200 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[360px] lg:col-span-2 bg-slate-200 rounded-2xl" />
          <Skeleton className="h-[360px] bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-955 md:text-3xl">
            Resumen General
          </h2>
          <p className="text-sm text-slate-500">
            Estadísticas consolidadas del fondo de ahorro y control administrativo.
          </p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          disabled={isRefreshing}
          onClick={handleRefresh}
          className="border-slate-300 bg-white/50 text-slate-700 hover:bg-slate-100 hover:text-slate-955 rounded-xl gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* KPI stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Fondo Total Administrado"
          value={stats?.totalBalance ?? 0}
          icon={Landmark}
          formatter={formatCurrency}
          subtitle="Suma total de aportaciones + rendimientos"
          accentColor="orange"
          className="stagger-1 animate-fade-in-up"
        />
        <KPICard
          title="Colaboradores Activos"
          value={stats?.employeeCount ?? 0}
          icon={Users}
          subtitle="Colaboradores registrados con ahorro activo"
          accentColor="navy"
          className="stagger-2 animate-fade-in-up"
        />
        <KPICard
          title="Total de Ahorros"
          value={stats?.totalContributions ?? 0}
          icon={PiggyBank}
          formatter={formatCurrency}
          subtitle="Aportaciones acumuladas totales"
          accentColor="navy"
          className="stagger-3 animate-fade-in-up"
        />
        <KPICard
          title="Rendimientos Acumulados"
          value={stats?.totalYields ?? 0}
          icon={TrendingUp}
          formatter={formatCurrency}
          subtitle="Suma total de rendimientos repartidos"
          accentColor="green"
          className="stagger-4 animate-fade-in-up"
        />
      </div>

      {/* Two columns layout: Chart and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Card */}
        <Card className="glass-card shadow-xl lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-md font-bold text-slate-955">
                Evolución del Fondo Global
              </CardTitle>
              <p className="text-xs text-slate-500">
                Incremento neto del capital acumulado mes con mes.
              </p>
            </div>

            <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChartType("area")}
                className={`h-7 px-3 rounded-md text-xs transition-premium ${
                  chartType === "area"
                    ? "bg-white text-indigo-650 font-bold shadow-sm"
                    : "text-slate-500 hover:text-slate-950"
                }`}
              >
                Área
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChartType("bar")}
                className={`h-7 px-3 rounded-md text-xs transition-premium ${
                  chartType === "bar"
                    ? "bg-white text-indigo-650 font-bold shadow-sm"
                    : "text-slate-500 hover:text-slate-955"
                }`}
              >
                Barras
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {chartType === "area" ? (
              <AreaChart data={chartData} xKey="periodo" series={chartSeries} height={290} />
            ) : (
              <BarChart data={chartData} xKey="periodo" series={chartSeries} height={290} />
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Shortcuts */}
        <Card className="glass-card shadow-xl flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-md font-bold text-slate-955">
              Acciones Administrativas
            </CardTitle>
            <p className="text-xs text-slate-500 font-medium">
              Accesos rápidos a las herramientas de control y nóminas.
            </p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center space-y-4">
            {/* Upload Link Card */}
            <Link
              href="/admin/upload"
              className="group flex items-center justify-between rounded-2xl border border-indigo-600/10 bg-indigo-650/5 hover:bg-indigo-650/10 p-4 transition-premium hover:border-indigo-600/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-650 border border-indigo-600/20">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-950">
                    Cargar Nómina Excel
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Procesar el ahorro del mes
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-650 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Users Link Card */}
            <Link
              href="/admin/users"
              className="group flex items-center justify-between rounded-2xl border border-slate-900/10 bg-slate-900/5 hover:bg-slate-900/10 p-4 transition-premium hover:border-slate-900/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/10 text-slate-900 border border-slate-900/20">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-955">
                    Colaboradores
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Ver saldos e historial
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-slate-900 group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Upload Logs Table */}
      <Card className="glass-card shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-bold text-slate-955">
            Registro Reciente de Cargas
          </CardTitle>
          <p className="text-xs text-slate-500">
            Bitácora de los últimos archivos cargados por el área de administración.
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-slate-200 overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-slate-600 font-semibold py-3">Archivo</TableHead>
                  <TableHead className="text-slate-600 font-semibold py-3">Periodo</TableHead>
                  <TableHead className="text-slate-600 font-semibold py-3">Fecha de Carga</TableHead>
                  <TableHead className="text-slate-600 font-semibold py-3">Estatus</TableHead>
                  <TableHead className="text-slate-600 font-semibold py-3">Filas Procesadas</TableHead>
                  <TableHead className="text-slate-600 font-semibold py-3">Nuevos Cuentas</TableHead>
                  <TableHead className="text-right text-slate-600 font-semibold py-3">Cargó</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-200">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <TableRow
                      key={log.id}
                      className="border-b border-slate-200 hover:bg-slate-50/50 transition-premium"
                    >
                      <TableCell className="py-3 text-xs font-semibold text-slate-950 max-w-[200px] truncate">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-indigo-650 shrink-0" />
                          <span>{log.filename}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-xs text-slate-600 capitalize">
                        {formatDate(log.periodDate)}
                      </TableCell>
                      <TableCell className="py-3 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatDateTime(log.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">{getStatusBadge(log.status)}</TableCell>
                      <TableCell className="py-3 text-xs text-slate-600 font-medium">
                        {log.recordsProcessed}
                      </TableCell>
                      <TableCell className="py-3 text-xs font-semibold text-indigo-650">
                        {log.newUsersCreated}
                      </TableCell>
                      <TableCell className="py-3 text-xs font-medium text-right text-slate-700">
                        {log.admin?.username || "Admin"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <td
                      colSpan={7}
                      className="h-28 text-center text-slate-500 text-sm"
                    >
                      No se han realizado cargas de archivos de nómina.
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
