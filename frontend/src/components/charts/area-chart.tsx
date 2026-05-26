"use client";

import React, { useEffect, useState } from "react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "../../lib/format";
import { Skeleton } from "../ui/skeleton";

interface AreaChartProps {
  data: any[];
  xKey: string;
  series: {
    key: string;
    name: string;
    color: string;
  }[];
  height?: number;
}

export function AreaChart({ data, xKey, series, height = 350 }: AreaChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMounted) {
    return <Skeleton className="w-full bg-slate-200 rounded-xl" style={{ height }} />;
  }

  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center rounded-xl border border-slate-200 bg-white/50 text-slate-500 text-sm"
        style={{ height }}
      >
        Sin datos disponibles
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-250 bg-white/95 p-4 shadow-xl backdrop-blur-md">
          <p className="mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-6 justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}:
                </span>
                <span className="font-bold text-slate-950">
                  {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
        >
          <defs>
            {series.map((item, idx) => (
              <linearGradient
                key={item.key}
                id={`grad-${item.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={item.color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={item.color} stopOpacity={0.0} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 18, 38, 0.05)" vertical={false} />
          
          <XAxis
            dataKey={xKey}
            stroke="#7E84A3"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={8}
          />
          
          <YAxis
            stroke="#7E84A3"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value.toLocaleString("es-MX")}`}
            dx={-8}
            hide={isMobile}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{
              fontSize: "12px",
              paddingBottom: "10px",
            }}
          />

          {series.map((item, idx) => (
            <Area
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.name}
              stroke={item.color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#grad-${item.key})`}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
