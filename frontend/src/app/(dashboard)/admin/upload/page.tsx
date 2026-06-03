"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { UploadZone } from "@/components/dashboard/upload-zone";
import { UploadResultsModal } from "@/components/dashboard/upload-results-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import { toast } from "sonner";
import { ExcelCredential } from "@/types";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function AdminUploadPage() {
  // Protect route to ADMIN only
  useAuth("ADMIN");

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    // Default to previous month (the report arrives the 1st of the next month)
    d.setMonth(d.getMonth() - 1);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [pickerYear, setPickerYear] = useState<number>(selectedDate.getFullYear());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Results modal state
  const [showResults, setShowResults] = useState(false);
  const [resultsStats, setResultsStats] = useState({ recordsProcessed: 0, newUsersCreated: 0 });
  const [resultsCredentials, setResultsCredentials] = useState<ExcelCredential[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleYearChange = (increment: number) => {
    setPickerYear((prev) => prev + increment);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedDate(new Date(pickerYear, monthIndex, 1));
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(10);
    setUploadErrors([]);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("file", file);
    
    // Set to local noon of the first of the month to avoid timezone drift in DB
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const periodDateStr = `${year}-${String(month + 1).padStart(2, "0")}-01T12:00:00`;
    formData.append("periodDate", periodDateStr);

    try {
      setUploadProgress(30);
      const response = await api.post("/api/admin/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 50) / progressEvent.total) + 30;
            setUploadProgress(percent);
          }
        },
      });

      setUploadProgress(90);
      
      const data = response.data;
      
      // Save stats and credentials
      setResultsStats({
        recordsProcessed: data.recordsProcessed ?? 0,
        newUsersCreated: data.newUsersCreated ?? 0,
      });
      setResultsCredentials(data.credentials ?? []);
      setUploadErrors(data.errors ?? []);
      setUploadSuccess(true);
      setUploadProgress(100);

      toast.success("¡Archivo procesado con éxito!");
      
      // Delay modal appearance slightly for better UX transition
      setTimeout(() => {
        setShowResults(true);
      }, 600);
      
    } catch (error: any) {
      console.error("Error al subir archivo:", error);
      const message = error.response?.data?.error || "Error al procesar el archivo. Revisa el formato e intenta nuevamente.";
      toast.error(message);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-955 md:text-3xl">
          Cargar Ahorros de Nómina
        </h2>
        <p className="text-sm text-slate-500">
          Sube la plantilla de Excel mensual con el reporte de aportaciones y rendimientos de los colaboradores.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Settings column */}
        <Card className="glass-card shadow-xl md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-955">
              1. Configurar Periodo
            </CardTitle>
            <p className="text-[11px] text-slate-500">
              Selecciona el mes al que corresponden los datos del Excel.
            </p>
            <p className="text-[10px] text-amber-600 font-medium mt-1">
              💡 Recuerda: el reporte llega el 1er día del mes siguiente, pero los datos pertenecen al mes anterior.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-600 font-semibold">Periodo Contable</label>
              
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left border-slate-355 bg-white text-slate-950 hover:bg-slate-100 rounded-xl py-5"
                      disabled={isUploading}
                    />
                  }
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-indigo-650" />
                  <span className="capitalize">
                    {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                  </span>
                </PopoverTrigger>
                <PopoverContent className="w-64 glass-panel border-slate-200 p-3 rounded-2xl">
                  {/* Year selector header */}
                  <div className="flex items-center justify-between mb-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleYearChange(-1)}
                      className="h-7 w-7 text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-bold text-slate-955">{pickerYear}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleYearChange(1)}
                      className="h-7 w-7 text-slate-500 hover:bg-slate-100 hover:text-slate-955"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Months grid */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {MONTHS.map((m, idx) => {
                      const isSelected = selectedDate.getMonth() === idx && selectedDate.getFullYear() === pickerYear;
                      return (
                        <Button
                          key={idx}
                          variant="ghost"
                          onClick={() => handleMonthSelect(idx)}
                          className={`h-9 text-xs rounded-xl ${
                            isSelected
                              ? "bg-indigo-600 text-white font-semibold"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                          }`}
                        >
                          {m.substring(0, 3)}
                        </Button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="rounded-xl bg-slate-100/50 p-4 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-wide">
                Estructura del Excel
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                El archivo debe contener una hoja llamada <strong className="text-slate-950 font-semibold">"Listado Empleados"</strong>. Los encabezados de las columnas deben coincidir exactamente con el formato establecido en la fila 3.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upload zone column */}
        <Card className="glass-card shadow-xl md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-955">
              2. Subir Plantilla Excel
            </CardTitle>
            <p className="text-[11px] text-slate-500">
              Arrastra o selecciona el archivo Excel de ahorros correspondientes al periodo.
            </p>
          </CardHeader>
          <CardContent>
            <UploadZone
              onUpload={handleUpload}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />

            {/* Show local errors / summary info */}
            {uploadSuccess && uploadErrors.length > 0 && (
              <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2.5 animate-fade-in-up">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  La carga se procesó con advertencias ({uploadErrors.length})
                </div>
                <div className="max-h-32 overflow-y-auto text-xs text-slate-600 space-y-1.5 divide-y divide-slate-200 pr-2">
                  {uploadErrors.map((err, idx) => (
                    <div key={idx} className="pt-1.5 first:pt-0">
                      {err}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploadSuccess && uploadErrors.length === 0 && (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs font-medium text-emerald-800 animate-fade-in-up">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>Archivo cargado y procesado exitosamente sin errores. Todos los registros y saldos han sido actualizados en la base de datos.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results details popup */}
      <UploadResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        stats={resultsStats}
        credentials={resultsCredentials}
      />
    </div>
  );
}
