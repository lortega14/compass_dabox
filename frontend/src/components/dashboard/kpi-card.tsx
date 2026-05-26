"use client";

import React from "react";
import { Card, CardContent } from "../ui/card";
import { AnimatedCounter } from "../charts/animated-counter";
import { cn } from "../../lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  subtitle?: string;
  formatter?: (val: number) => string;
  className?: string;
  accentColor?: "orange" | "navy" | "green" | "rose";
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
}

export function KPICard({
  title,
  value,
  icon: Icon,
  subtitle,
  formatter = (val) => String(val),
  className,
  accentColor = "orange",
  trend,
}: KPICardProps) {
  const getAccentStyles = () => {
    switch (accentColor) {
      case "navy":
        return {
          border: "border-t-4 border-t-slate-900 border-l border-r border-b border-slate-200/60",
          iconBg: "bg-slate-900/10 text-slate-900 border border-slate-900/20",
        };
      case "green":
        return {
          border: "border-t-4 border-t-emerald-600 border-l border-r border-b border-slate-200/60",
          iconBg: "bg-emerald-650/10 text-emerald-700 border border-emerald-600/25",
        };
      case "rose":
        return {
          border: "border-t-4 border-t-rose-600 border-l border-r border-b border-slate-200/60",
          iconBg: "bg-rose-600/10 text-rose-700 border border-rose-600/25",
        };
      case "orange":
      default:
        return {
          border: "border-t-4 border-t-indigo-600 border-l border-r border-b border-slate-200/60",
          iconBg: "bg-indigo-600/10 text-indigo-650 border border-indigo-600/20",
        };
    }
  };

  const accentStyles = getAccentStyles();

  return (
    <Card
      className={cn(
        "glass-card overflow-hidden hover:border-indigo-600/30 transition-premium hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-600/5",
        accentStyles.border,
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", accentStyles.iconBg)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-xl font-bold tracking-tight text-slate-955 sm:text-2xl md:text-3xl">
            <AnimatedCounter value={value} formatter={formatter} />
          </h3>

          {trend && (
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span
                className={cn(
                  "font-semibold rounded px-1.5 py-0.5",
                  trend.isPositive
                    ? "bg-emerald-500/10 text-emerald-700"
                    : "bg-rose-500/10 text-rose-700"
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
              {trend.label && (
                <span className="text-slate-500">{trend.label}</span>
              )}
            </div>
          )}

          {!trend && subtitle && (
            <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
