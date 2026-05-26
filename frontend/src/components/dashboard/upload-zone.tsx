"use client";

import React, { useRef, useState } from "react";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { toast } from "sonner";
import { cn } from "../../lib/utils";

interface UploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadProgress?: number;
}

export function UploadZone({ onUpload, isUploading, uploadProgress = 0 }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isUploading) return;
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const validateAndSetFile = (file: File) => {
    const validExtensions = [".xlsx", ".xls"];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      toast.error("Por favor, selecciona un archivo de Excel válido (.xlsx o .xls)");
      return;
    }

    setSelectedFile(file);
    toast.success(`Archivo seleccionado: ${file.name}`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isUploading) return;
    setDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      toast.error("Selecciona un archivo antes de iniciar la carga.");
      return;
    }
    await onUpload(selectedFile);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300",
          dragOver
            ? "border-indigo-650 bg-indigo-600/5 shadow-inner"
            : "border-slate-300 bg-white/50 hover:border-indigo-600/30 hover:bg-white/80",
          selectedFile ? "border-emerald-500/40 bg-emerald-500/5" : "",
          isUploading ? "pointer-events-none opacity-50" : ""
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center animate-fade-in-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-700 border border-emerald-500/20 mb-4 shadow-lg shadow-emerald-500/5">
              <FileSpreadsheet className="h-8 w-8" />
            </div>
            <h4 className="text-md font-bold text-slate-950 mb-1 max-w-sm truncate">
              {selectedFile.name}
            </h4>
            <p className="text-xs text-slate-500 mb-2">
              {formatBytes(selectedFile.size)}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
              <CheckCircle2 className="h-4 w-4" />
              Listo para cargar
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-655 border border-indigo-600/20 mb-4 shadow-lg shadow-indigo-600/5">
              <Upload className="h-8 w-8" />
            </div>
            <h4 className="text-md font-bold text-slate-950 mb-1">
              Arrastra tu archivo Excel aquí
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mb-3">
              o haz clic para explorar en tu computadora (.xlsx, .xls)
            </p>
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 text-[10px] font-bold tracking-wide uppercase text-indigo-650">
              <AlertCircle className="h-3.5 w-3.5" />
              Formato de plantilla requerido
            </div>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="glass-card p-4 border-slate-200 space-y-2 animate-fade-in-up">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-indigo-650">Procesando y cargando archivo...</span>
            <span className="text-slate-550">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-1.5 bg-slate-200" />
        </div>
      )}

      {selectedFile && !isUploading && (
        <div className="flex items-center gap-3 justify-end animate-fade-in-up">
          <Button
            variant="ghost"
            onClick={handleClearFile}
            className="text-slate-500 hover:bg-slate-100 hover:text-slate-955 rounded-xl"
          >
            Quitar archivo
          </Button>
          <Button
            onClick={handleUploadSubmit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 px-6 animate-pulse"
          >
            Procesar Carga
          </Button>
        </div>
      )}
    </div>
  );
}
