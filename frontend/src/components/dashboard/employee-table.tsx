"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Search, ChevronLeft, ChevronRight, Eye, UserX, UserCheck } from "lucide-react";
import { formatCurrency } from "../../lib/format";
import { Skeleton } from "../ui/skeleton";

interface EmployeeWithBalance {
  id: string;
  fullName: string;
  payrollCode: string;
  payrollType: string;
  isActive: boolean;
  currentBalance?: number;
}

interface EmployeeTableProps {
  employees: EmployeeWithBalance[];
  onRowClick: (employee: EmployeeWithBalance) => void;
  isLoading: boolean;
}

export function EmployeeTable({
  employees = [],
  onRowClick,
  isLoading,
}: EmployeeTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter logic
  const filtered = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.payrollCode.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && emp.isActive) ||
      (statusFilter === "INACTIVE" && !emp.isActive);

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset page to 1
  };

  const handleStatusFilterChange = (val: string | null) => {
    if (val) {
      setStatusFilter(val);
      setCurrentPage(1); // Reset page to 1
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Search className="h-4 w-4" />
          </span>
          <Input
            placeholder="Buscar por nombre o número de nómina..."
            value={search}
            onChange={handleSearchChange}
            className="pl-9 border-slate-300 bg-white text-slate-950 placeholder-slate-400 focus-visible:ring-indigo-600/30"
          />
        </div>

        <div className="w-full sm:w-[180px]">
          <Select
            value={statusFilter}
            onValueChange={handleStatusFilterChange}
          >
            <SelectTrigger className="border-slate-300 bg-white text-slate-950">
              <SelectValue placeholder="Filtrar por Estatus" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 bg-white text-slate-955">
              <SelectItem value="ALL">Todos los Estatus</SelectItem>
              <SelectItem value="ACTIVE">Activos</SelectItem>
              <SelectItem value="INACTIVE">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white/50 overflow-x-auto shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow className="border-b border-slate-200 hover:bg-slate-50/50">
              <TableHead className="text-slate-600 font-semibold py-3.5">Nombre</TableHead>
              <TableHead className="text-slate-600 font-semibold py-3.5">ID Nómina</TableHead>
              <TableHead className="text-slate-600 font-semibold py-3.5">Clave (Tipo)</TableHead>
              <TableHead className="text-slate-600 font-semibold py-3.5">Saldo Actual</TableHead>
              <TableHead className="text-slate-600 font-semibold py-3.5">Status</TableHead>
              <TableHead className="text-right text-slate-600 font-semibold py-3.5">Detalle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-200">
            {isLoading ? (
              Array.from({ length: itemsPerPage }).map((_, idx) => (
                <TableRow key={idx} className="border-none">
                  <TableCell className="py-4"><Skeleton className="h-4 w-40 bg-slate-200" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-20 bg-slate-200" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-28 bg-slate-200" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-24 bg-slate-200" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-5 w-16 bg-slate-200" /></TableCell>
                  <TableCell className="py-4 text-right"><Skeleton className="h-8 w-16 bg-slate-200 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : paginated.length > 0 ? (
              paginated.map((emp) => (
                <TableRow
                  key={emp.id}
                  onClick={() => onRowClick(emp)}
                  className="cursor-pointer border-b border-slate-200 hover:bg-indigo-600/5 transition-premium group"
                >
                  <TableCell className="py-3 text-slate-950 font-bold">
                    {emp.fullName}
                  </TableCell>
                  <TableCell className="py-3 font-mono text-xs font-semibold text-slate-500">
                    {emp.payrollCode}
                  </TableCell>
                  <TableCell className="py-3 text-xs text-slate-500 capitalize">
                    {emp.payrollType.toLowerCase()}
                  </TableCell>
                  <TableCell className="py-3 font-bold text-slate-955">
                    {formatCurrency(emp.currentBalance ?? 0)}
                  </TableCell>
                  <TableCell className="py-3">
                    {emp.isActive ? (
                      <Badge className="bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20 text-emerald-700 gap-1 rounded-lg px-2.5 py-0.5 font-bold text-xs">
                        <UserCheck className="h-3 w-3" />
                        Activo
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/20 text-rose-700 gap-1 rounded-lg px-2.5 py-0.5 font-bold text-xs">
                        <UserX className="h-3 w-3" />
                        Inactivo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(emp);
                      }}
                      className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-650 group-hover:text-indigo-650"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-36 text-center text-slate-500 text-sm"
                >
                  No se encontraron colaboradores.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {filtered.length > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row items-center justify-between text-sm py-2">
          <span className="text-xs text-slate-500">
            Mostrando del {startIndex + 1} al{" "}
            {Math.min(startIndex + itemsPerPage, filtered.length)} de{" "}
            {filtered.length} colaboradores
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1 || isLoading}
              onClick={() => handlePageChange(currentPage - 1)}
              className="h-8 w-8 border-slate-300 bg-white/50 hover:bg-slate-100 text-slate-600 hover:text-slate-950"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-xs text-slate-500">
              Pág. {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages || isLoading}
              onClick={() => handlePageChange(currentPage + 1)}
              className="h-8 w-8 border-slate-300 bg-white/50 hover:bg-slate-100 text-slate-600 hover:text-slate-955"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
