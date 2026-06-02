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
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserX,
  UserCheck,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
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
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Sort states cycle: 'asc' -> 'desc' -> null (original state)
  const [sortBy, setSortBy] = useState<"fullName" | "payrollCode" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  // Sorting handler with 3-state cycle (A-Z -> Z-A -> Original)
  const handleSort = (column: "fullName" | "payrollCode") => {
    if (sortBy === column) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortBy(null);
        setSortOrder(null);
      }
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Filter logic
  const filtered = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.payrollCode.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && emp.isActive) ||
      (statusFilter === "INACTIVE" && !emp.isActive);

    const matchesType =
      typeFilter === "ALL" ||
      emp.payrollType.toUpperCase() === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Sort logic on filtered list (if sorting is active)
  const sorted = [...filtered].sort((a, b) => {
    if (!sortBy || !sortOrder) return 0; // Return original database order

    if (sortBy === "payrollCode") {
      const aNum = Number(a.payrollCode);
      const bNum = Number(b.payrollCode);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
      }
      return sortOrder === "asc"
        ? a.payrollCode.localeCompare(b.payrollCode, undefined, { numeric: true })
        : b.payrollCode.localeCompare(a.payrollCode, undefined, { numeric: true });
    }

    if (sortBy === "fullName") {
      return sortOrder === "asc"
        ? a.fullName.localeCompare(b.fullName)
        : b.fullName.localeCompare(a.fullName);
    }

    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = sorted.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset page to 1
  };

  // Check if any filter or sorting is active to display the clear button
  const hasActiveFilters =
    search !== "" ||
    statusFilter !== "ALL" ||
    typeFilter !== "ALL" ||
    sortBy !== null;

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setSortBy(null);
    setSortOrder(null);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters reset */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-grow max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Search className="h-4 w-4" />
          </span>
          <Input
            placeholder="Buscar por nombre o número de nómina..."
            value={search}
            onChange={handleSearchChange}
            className="pl-9 border-slate-300 bg-white text-slate-955 placeholder-slate-400 focus-visible:ring-indigo-600/30"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-xs text-indigo-650 hover:text-indigo-855 hover:bg-indigo-600/10 rounded-xl px-3 py-1 h-9 gap-1.5 transition-premium"
          >
            <RefreshCw className="h-3.5 w-3.5 animate-premium-spin" />
            Restablecer Filtros y Orden
          </Button>
        )}
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white/50 overflow-x-auto shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow className="border-b border-slate-200 hover:bg-slate-50/50">
              
              {/* Nombre header (Sortable 3-states) */}
              <TableHead
                className="text-slate-600 font-semibold py-3.5 cursor-pointer hover:text-slate-955 transition-premium select-none"
                onClick={() => handleSort("fullName")}
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortBy === "fullName" ? "text-indigo-650 font-bold" : ""}>
                    Nombre
                  </span>
                  {sortBy === "fullName" ? (
                    sortOrder === "asc" ? (
                      <ArrowUp className="h-3.5 w-3.5 text-indigo-650" />
                    ) : (
                      <ArrowDown className="h-3.5 w-3.5 text-indigo-650" />
                    )
                  ) : (
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 opacity-60" />
                  )}
                </div>
              </TableHead>
              
              {/* ID Nómina header (Sortable 3-states) */}
              <TableHead
                className="text-slate-600 font-semibold py-3.5 cursor-pointer hover:text-slate-955 transition-premium select-none"
                onClick={() => handleSort("payrollCode")}
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortBy === "payrollCode" ? "text-indigo-650 font-bold" : ""}>
                    ID Nómina
                  </span>
                  {sortBy === "payrollCode" ? (
                    sortOrder === "asc" ? (
                      <ArrowUp className="h-3.5 w-3.5 text-indigo-650" />
                    ) : (
                      <ArrowDown className="h-3.5 w-3.5 text-indigo-650" />
                    )
                  ) : (
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 opacity-60" />
                  )}
                </div>
              </TableHead>
              
              {/* Frecuencia de ingreso header (Filterable dropdown) */}
              <TableHead className="py-2">
                <Select
                  value={typeFilter}
                  onValueChange={(val: string | null) => {
                    if (val) {
                      setTypeFilter(val);
                      setCurrentPage(1);
                    }
                  }}
                >
                  <SelectTrigger 
                    className="border-none bg-transparent hover:bg-slate-200/50 p-1 pl-2 text-xs font-semibold text-slate-600 hover:text-slate-955 gap-1 focus:ring-0 cursor-pointer"
                    size="sm"
                  >
                    <SelectValue>
                      {typeFilter === "ALL" ? (
                        "Frecuencia de ingreso"
                      ) : typeFilter === "SEM" ? (
                        <span className="text-indigo-650 font-bold">Sem</span>
                      ) : (
                        <span className="text-indigo-650 font-bold">Qna</span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 bg-white text-slate-955 min-w-[160px]">
                    <SelectItem value="ALL">Sin filtro</SelectItem>
                    <SelectItem value="SEM">Semanales (Sem)</SelectItem>
                    <SelectItem value="QNA">Quincenales (Qna)</SelectItem>
                  </SelectContent>
                </Select>
              </TableHead>
              
              <TableHead className="text-slate-600 font-semibold py-3.5">Saldo Actual</TableHead>
              
              {/* Status header (Filterable dropdown) */}
              <TableHead className="py-2">
                <Select
                  value={statusFilter}
                  onValueChange={(val: string | null) => {
                    if (val) {
                      setStatusFilter(val);
                      setCurrentPage(1);
                    }
                  }}
                >
                  <SelectTrigger 
                    className="border-none bg-transparent hover:bg-slate-200/50 p-1 pl-2 text-xs font-semibold text-slate-600 hover:text-slate-955 gap-1 focus:ring-0 cursor-pointer"
                    size="sm"
                  >
                    <SelectValue>
                      {statusFilter === "ALL" ? (
                        "Status"
                      ) : statusFilter === "ACTIVE" ? (
                        <span className="text-indigo-650 font-bold">Activo</span>
                      ) : (
                        <span className="text-indigo-650 font-bold">Inactivo</span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 bg-white text-slate-955 min-w-[140px]">
                    <SelectItem value="ALL">Sin filtro</SelectItem>
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </TableHead>
              
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
                  <TableCell className="py-3 text-slate-955 font-bold">
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
        <div className="flex flex-col gap-3 sm:flex-row items-center justify-between text-sm py-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs text-slate-500">
              Mostrando del {startIndex + 1} al{" "}
              {Math.min(startIndex + itemsPerPage, filtered.length)} de{" "}
              {filtered.length} colaboradores
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Mostrar:</span>
              <Select
                value={String(itemsPerPage)}
                onValueChange={(val: string | null) => {
                  if (val) {
                    setItemsPerPage(Number(val));
                    setCurrentPage(1);
                  }
                }}
              >
                <SelectTrigger className="h-7 w-[70px] border-slate-300 bg-white text-slate-955 py-0 px-2 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-200 bg-white text-slate-955 min-w-[70px]">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1 || isLoading}
              onClick={() => handlePageChange(currentPage - 1)}
              className="h-8 w-8 border-slate-300 bg-white/50 hover:bg-slate-100 text-slate-600 hover:text-slate-955"
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
