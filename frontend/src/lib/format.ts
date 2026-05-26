export function formatCurrency(value: number | string | undefined | null): string {
  const val = typeof value === "string" ? parseFloat(value) : value;
  if (val === undefined || val === null || isNaN(val)) {
    return "$0.00 MXN";
  }
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val) + " MXN";
}

export function formatDate(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  
  // Use UTC components to prevent local timezone offsets from shifting the date
  return new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(d);
}

export function formatDateTime(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
