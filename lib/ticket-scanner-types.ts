export type TicketScannerType = "ticket" | "factura" | "desconocido";

export type TicketScannerCategory =
  | "luz"
  | "agua"
  | "wifi"
  | "gas"
  | "alquiler"
  | "otro";

export type TicketScannerItem = {
  nombre: string;
  precio: number;
};

export type TicketScannerData = {
  tipo: TicketScannerType;
  comercio?: string | null;
  fecha?: string | null;
  importe_total?: number | null;
  articulos?: TicketScannerItem[];
  categoria?: TicketScannerCategory | null;
  periodo?: string | null;
};

export const DOCUMENT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const SCANNER_ALLOWED_MEDIA_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export type ScannerAllowedMediaType = (typeof SCANNER_ALLOWED_MEDIA_TYPES)[number];
