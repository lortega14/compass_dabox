"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../../stores/auth-store";
import { cn } from "../../lib/utils";
import {
  LayoutDashboard,
  Upload,
  Users,
  LogOut,
  Shield,
  User as UserIcon,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  className?: string;
  onItemClick?: () => void;
}

export function Sidebar({ className, onItemClick }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const isAdmin = user?.role === "ADMIN";

  const adminLinks = [
    {
      href: "/admin/dashboard",
      label: "Tablero General",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/upload",
      label: "Cargar Archivo",
      icon: Upload,
    },
    {
      href: "/admin/users",
      label: "Colaboradores",
      icon: Users,
    },
  ];

  const userLinks = [
    {
      href: "/dashboard",
      label: "Mi Resumen",
      icon: LayoutDashboard,
    },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  const handleLogout = async () => {
    if (onItemClick) onItemClick();
    await logout();
  };

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col border-r border-slate-950/20 bg-gradient-to-b from-[#0F1226] to-[#283A7F] p-6 shadow-xl",
        className
      )}
    >
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white border border-white/20">
          <Shield className="h-5.5 w-5.5" />
        </div>
        <div>
          <span className="font-sans text-lg font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
            Compass DABox
          </span>
          <p className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">
            {isAdmin ? "Portal Admin" : "Portal Empleado"}
          </p>
        </div>
      </div>

      <div className="my-6 border-t border-white/10" />

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onItemClick}
              className={cn(
                "group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-premium",
                isActive
                  ? "bg-indigo-600 text-white border border-indigo-500/20 shadow-md shadow-indigo-600/10"
                  : "text-slate-300 hover:bg-white/10 hover:text-white border border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("h-4.5 w-4.5", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                <span>{link.label}</span>
              </div>
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-300",
                  isActive ? "translate-x-0 opacity-100 text-white" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 text-slate-400"
                )}
              />
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="mt-auto space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/15 text-white">
            <UserIcon className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-sm font-bold text-white">
              {user?.employee?.fullName || user?.username}
            </span>
            <span className="truncate text-[11px] text-slate-400 font-medium capitalize">
              {user?.role === "ADMIN" ? "Administrador" : "Colaborador"}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-rose-400 transition-premium hover:bg-rose-500/10 hover:text-rose-300"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
