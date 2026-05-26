"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../../stores/auth-store";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "../ui/sheet";
import { Button } from "../ui/button";
import { Sidebar } from "./sidebar";
import { Menu, Bell, Shield, User } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  // Derive breadcrumbs/page title
  const getPageTitle = () => {
    if (pathname.includes("/admin/dashboard")) return "Dashboard Administrador";
    if (pathname.includes("/admin/upload")) return "Cargar Historial de Ahorros";
    if (pathname.includes("/admin/users")) return "Gestión de Colaboradores";
    if (pathname.includes("/dashboard")) return "Mi Resumen de Ahorros";
    return "Compass DABox";
  };

  const getBreadcrumb = () => {
    const parts = pathname.split("/").filter(Boolean);
    return parts.map((part, index) => {
      const isLast = index === parts.length - 1;
      const label = part === "admin" 
        ? "Admin" 
        : part === "dashboard" 
          ? "Dashboard" 
          : part === "upload" 
            ? "Cargar Excel" 
            : part === "users" 
              ? "Colaboradores" 
              : part;
      return (
        <span key={part} className="flex items-center">
          {index > 0 && <span className="mx-2 text-slate-400">/</span>}
          <span className={isLast ? "text-slate-950 font-bold" : "text-slate-500"}>
            {label}
          </span>
        </span>
      );
    });
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#283A7F]/15 bg-background/80 px-6 backdrop-blur-md">
      {/* Mobile Nav Trigger & Breadcrumb */}
      <div className="flex items-center gap-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-10 w-10 text-indigo-650 hover:bg-indigo-600/10 hover:text-indigo-650"
              />
            }
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 border-r border-slate-300 w-[280px] bg-background">
            <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
            <Sidebar onItemClick={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="hidden sm:flex flex-col">
          <div className="flex items-center text-xs">{getBreadcrumb()}</div>
          <h1 className="text-lg font-bold text-slate-950 hidden md:block">
            {getPageTitle()}
          </h1>
        </div>
        
        {/* Mobile Page Title */}
        <h1 className="text-md font-bold text-slate-955 sm:hidden">
          {getPageTitle()}
        </h1>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications Mock */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-slate-500 hover:bg-slate-100 hover:text-slate-950"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-650 ring-2 ring-background"></span>
        </Button>

        {/* User Info Bar */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-300">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-955">
              {user?.employee?.fullName || user?.username}
            </span>
            <span className="text-[10px] text-slate-500 font-medium capitalize">
              {user?.role.toLowerCase()}
            </span>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-indigo-600/30 text-indigo-650 shadow-sm">
            {user?.role === "ADMIN" ? (
              <Shield className="h-4.5 w-4.5" />
            ) : (
              <User className="h-4.5 w-4.5" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
