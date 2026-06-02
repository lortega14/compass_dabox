"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/auth-store";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  // Verify authentication state when landing on the 404 page
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await checkAuth();
      } catch (err) {
        console.error("Auth check failed on 404 page", err);
      } finally {
        setIsChecking(false);
      }
    };
    verifyAuth();
  }, [checkAuth]);

  const handleGoBack = () => {
    if (isAuthenticated && user) {
      if (user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Dynamic background glow effects */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/5 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-slate-900/5 blur-3xl"></div>

      <div className="relative w-full max-w-md animate-fade-in-up text-center">
        {/* Brand Symbol Container */}
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white border border-indigo-600/10 shadow-lg shadow-indigo-600/5 p-4 transition-premium hover:rotate-6">
          <img 
            src="/symbol-color.svg" 
            alt="DABox Symbol" 
            className="h-full w-full object-contain"
          />
        </div>

        {/* 404 & Text Content */}
        <div className="glass-card p-8 md:p-10 transition-premium hover:border-indigo-600/20">
          <h1 className="text-7xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 bg-clip-text text-transparent">
              404
            </span>
          </h1>
          <h2 className="mt-4 text-xl font-bold text-slate-950">
            Página No Encontrada
          </h2>
          <p className="mt-3 text-sm text-slate-500 leading-relaxed">
            Lo sentimos, el recurso que estás buscando no existe, ha sido movido o no tienes autorización para verlo.
          </p>

          {/* Action Button */}
          <div className="mt-8">
            <button
              onClick={handleGoBack}
              disabled={isChecking}
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-premium hover:from-indigo-500 hover:to-indigo-650 hover:shadow-indigo-600/40 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-white disabled:pointer-events-none disabled:opacity-60"
            >
              {isChecking ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  <span>Volver al Inicio</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="mt-8 text-xs text-slate-400 font-semibold tracking-wider uppercase">
          Compass DABox
        </div>
      </div>
    </div>
  );
}
