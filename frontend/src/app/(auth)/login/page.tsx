"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../stores/auth-store";
import { toast } from "sonner";
import { User, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Por favor, ingresa usuario y contraseña.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { mustChangePassword, role } = await login(username, password);
      toast.success("¡Sesión iniciada con éxito!");

      if (mustChangePassword) {
        router.push("/setup-password");
      } else if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Error de login:", error);
      const backendError = error.response?.data?.error;
      const backendMessage = error.response?.data?.message;
      const networkError = error.message;
      
      const message = backendError || backendMessage || `Error de conexión: ${networkError}`;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Background glow effects - soft orange and navy tints */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/5 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-slate-900/5 blur-3xl"></div>

      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Logo and Headings */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 h-16 w-auto flex items-center justify-center">
            <img 
              src="/logo-complete-color.svg" 
              alt="DABox Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>
          <p className="mt-1 text-sm font-semibold tracking-wider text-slate-500 uppercase">
            Caja de Ahorro y Préstamos
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-card p-8 transition-premium hover:border-indigo-600/20">
          <h2 className="mb-6 text-xl font-bold text-slate-950">
            Iniciar Sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600" htmlFor="username">
                Usuario (ID de Nómina)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="username"
                  type="text"
                  required
                  placeholder="Ejem. 12345"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white/80 py-2.5 pl-10 pr-4 text-slate-950 placeholder-slate-400 outline-none transition-premium focus:border-indigo-600/50 focus:ring-1 focus:ring-indigo-600/50"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white/80 py-2.5 pl-10 pr-10 text-slate-950 placeholder-slate-400 outline-none transition-premium focus:border-indigo-600/50 focus:ring-1 focus:ring-indigo-600/50"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-premium hover:from-indigo-500 hover:to-indigo-650 hover:shadow-indigo-600/40 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-white disabled:pointer-events-none disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Iniciando sesión...
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-500">
          ¿Problemas para acceder? Contacta al administrador de Recursos Humanos.
        </div>
      </div>
    </div>
  );
}
