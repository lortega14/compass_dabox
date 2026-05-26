"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { EmployeeTable } from "@/components/dashboard/employee-table";
import { EmployeeHistoryDrawer } from "@/components/dashboard/employee-history-drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileSpreadsheet, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Employee {
  id: string;
  fullName: string;
  payrollCode: string;
  payrollType: string;
  isActive: boolean;
  currentBalance?: number;
}

export default function AdminUsersPage() {
  // Protect route to ADMIN only
  useAuth("ADMIN");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchEmployees = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      // Fetch up to 1000 employees for full client-side search/filter/pagination
      const response = await api.get<{ employees: Employee[] }>(
        "/api/admin/employees?limit=1000"
      );
      setEmployees(response.data.employees);
    } catch (error) {
      console.error("Error al obtener lista de colaboradores:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleRowClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDrawerOpen(true);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchEmployees(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-955 md:text-3xl">
            Gestión de Colaboradores
          </h2>
          <p className="text-sm text-slate-500">
            Administra cuentas, consulta saldos individuales y examina historiales detallados.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="border-slate-300 bg-white/50 text-slate-700 hover:bg-slate-100 hover:text-slate-955 rounded-xl gap-1.5 h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Sincronizar
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="glass-card shadow-xl overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-bold text-slate-955 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-650" />
            Lista de Ahorradores
          </CardTitle>
          <p className="text-xs text-slate-500">
            Haz clic en cualquier fila para abrir el panel de historial detallado por periodos.
          </p>
        </CardHeader>
        <CardContent>
          <EmployeeTable
            employees={employees}
            onRowClick={handleRowClick}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Slide-in details Drawer */}
      <EmployeeHistoryDrawer
        employeeId={selectedEmployee?.id || null}
        employeeName={selectedEmployee?.fullName || null}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
