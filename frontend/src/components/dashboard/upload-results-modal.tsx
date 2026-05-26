"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  CheckCircle2,
  Copy,
  Download,
  Search,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { ExcelCredential } from "../../types";

interface UploadResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    recordsProcessed: number;
    newUsersCreated: number;
  };
  credentials: ExcelCredential[];
}

export function UploadResultsModal({
  isOpen,
  onClose,
  stats,
  credentials = [],
}: UploadResultsModalProps) {
  const [search, setSearch] = useState("");

  const filteredCredentials = credentials.filter((cred) =>
    cred.username.toLowerCase().includes(search.toLowerCase())
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copiado: ${text}`);
  };

  const handleExportCSV = () => {
    if (credentials.length === 0) {
      toast.error("No hay credenciales para exportar.");
      return;
    }

    const headers = ["Usuario (Nómina)", "Contraseña Temporal"];
    const rows = credentials.map((c) => [c.username, c.tempPassword || ""]);
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `credenciales_nuevos_usuarios_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("¡CSV exportado correctamente!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel w-full sm:max-w-2xl border-indigo-600/20 text-slate-955 max-h-[85vh] flex flex-col p-6 rounded-2xl bg-background">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-700 border border-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-955">
                Carga Completada con Éxito
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                El archivo de nómina ha sido procesado correctamente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Upload Stats summary */}
        <div className="grid grid-cols-2 gap-4 my-4 p-4 rounded-xl bg-slate-100/50 border border-slate-200">
          <div className="text-center py-2 border-r border-slate-200">
            <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">
              Registros Procesados
            </span>
            <p className="text-2xl font-bold text-slate-950 mt-1">
              {stats.recordsProcessed}
            </p>
          </div>
          <div className="text-center py-2">
            <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">
              Nuevos Usuarios Creados
            </span>
            <p className="text-2xl font-bold text-indigo-650 mt-1">
              {stats.newUsersCreated}
            </p>
          </div>
        </div>

        {/* Temporary Credentials list */}
        {credentials.length > 0 && (
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-955">
                Credenciales de Nuevos Empleados ({credentials.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="h-8 border-indigo-600/20 hover:bg-indigo-600/10 text-indigo-650 gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Exportar CSV
              </Button>
            </div>

            {/* Search filter */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <Input
                placeholder="Buscar por usuario (nómina)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 border-slate-300 bg-white text-slate-950 placeholder-slate-400 focus-visible:ring-indigo-600/30"
              />
            </div>

            {/* List container */}
            <div className="flex-1 min-h-0 overflow-auto border border-slate-200 rounded-xl bg-white/50 max-h-[220px]">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-650">
                    <th className="px-4 py-2">Usuario (Nómina)</th>
                    <th className="px-4 py-2">Contraseña Temporal</th>
                    <th className="px-4 py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCredentials.length > 0 ? (
                    filteredCredentials.map((cred, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/50 transition-premium"
                      >
                        <td className="px-4 py-2.5 font-mono text-xs font-bold text-slate-950">
                          {cred.username}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs font-semibold text-indigo-650">
                          {cred.tempPassword || "N/A"}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="inline-flex gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                copyToClipboard(
                                  `Usuario: ${cred.username} / Pass: ${
                                    cred.tempPassword || ""
                                  }`
                                )
                              }
                              className="h-7 w-7 text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-8 text-center text-xs text-slate-500"
                      >
                        No se encontraron credenciales.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <p className="text-[10px] text-slate-550 italic leading-relaxed">
              * Nota: Descarga o copia las credenciales ahora. Por motivos de seguridad, las contraseñas temporales se cifran y no se podrán recuperar posteriormente.
            </p>
          </div>
        )}

        <DialogFooter className="mt-6 pt-4 border-t border-slate-200">
          <Button
            onClick={onClose}
            className="w-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl"
          >
            Entendido, Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
