"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../stores/auth-store";
import { useAuth } from "../../../hooks/use-auth";
import { toast } from "sonner";
import { Lock, Check, AlertCircle } from "lucide-react";

export default function SetupPasswordPage() {
  // Protect route: require user to be authenticated, wait until checks pass
  const { user, isLoading } = useAuth();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const changePassword = useAuthStore((state) => state.changePassword);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-650 border-t-transparent"></div>
          <p className="text-sm text-slate-500">Verificando estado...</p>
        </div>
      </div>
    );
  }

  // Password validation checks
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isMatch = password === confirmPassword && password.length > 0;

  const isFormValid = hasMinLength && hasNumber && hasSpecial && isMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error("Por favor, cumple con todos los requisitos de seguridad.");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(password);
      toast.success("¡Tu contraseña ha sido actualizada con éxito!");
      
      // Redirect to correct dashboard based on role
      if (user?.role === "ADMIN") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/dashboard");
      }
    } catch (error: any) {
      console.error("Error al cambiar contraseña:", error);
      const message = error.response?.data?.message || "No se pudo actualizar la contraseña. Intenta de nuevo.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/5 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-slate-900/5 blur-3xl"></div>

      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Headings */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 h-12 w-12 flex items-center justify-center">
            <img 
              src="/symbol-color.svg" 
              alt="DABox Symbol" 
              className="h-12 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-955">
            Actualizar Contraseña
          </h1>
          <p className="mt-2 text-sm text-slate-500 px-4">
            Por motivos de seguridad, debes cambiar tu contraseña temporal antes de continuar.
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 transition-premium hover:border-indigo-600/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600" htmlFor="password">
                Nueva Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white/80 py-2.5 pl-10 pr-4 text-slate-950 placeholder-slate-400 outline-none transition-premium focus:border-indigo-600/50 focus:ring-1 focus:ring-indigo-600/50"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600" htmlFor="confirmPassword">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white/80 py-2.5 pl-10 pr-4 text-slate-950 placeholder-slate-400 outline-none transition-premium focus:border-indigo-600/50 focus:ring-1 focus:ring-indigo-600/50"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Validation Checklist */}
            <div className="rounded-lg bg-slate-100/50 p-4 border border-slate-200 space-y-2">
              <p className="text-xs font-bold text-slate-700 mb-3">Requisitos de Seguridad:</p>
              
              <div className="flex items-center gap-2 text-xs">
                {hasMinLength ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
                )}
                <span className={hasMinLength ? "text-emerald-700 font-medium" : "text-slate-500"}>
                  Mínimo 8 caracteres
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {hasNumber ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
                )}
                <span className={hasNumber ? "text-emerald-700 font-medium" : "text-slate-500"}>
                  Al menos un número
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {hasSpecial ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
                )}
                <span className={hasSpecial ? "text-emerald-700 font-medium" : "text-slate-500"}>
                  Al menos un carácter especial (@, $, !, %, etc.)
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {isMatch ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
                )}
                <span className={isMatch ? "text-emerald-700 font-medium" : "text-slate-500"}>
                  Las contraseñas coinciden
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="relative flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-premium hover:from-indigo-500 hover:to-indigo-650 hover:shadow-indigo-600/40 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-white disabled:pointer-events-none disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Guardando contraseña...
                </>
              ) : (
                "Establecer Contraseña"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
