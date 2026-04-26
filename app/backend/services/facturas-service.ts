import { createClient } from "../endpoints/shared/supabase-server";
import { loadHouseInvoiceHistoryWithClient } from "../endpoints/shared/dashboard-core";

export type FacturaEscenario = {
  tipo: string;
  categoria: string;
  importe_total: number;
  periodo: string | null;
  comercio: string | null;
  created_at: string | null;
};

function asNumber(value: number | string) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getFacturasActivasByPiso(
  houseCode: string
): Promise<FacturaEscenario[]> {
  const supabase = await createClient();
  const invoices = await loadHouseInvoiceHistoryWithClient(supabase, houseCode, 200, 0);

  return invoices.map((invoice) => ({
    tipo: "factura",
    categoria: invoice.category_slug || "otro",
    importe_total: asNumber(invoice.total_amount),
    periodo: invoice.invoice_date ?? null,
    comercio: invoice.title || null,
    created_at: invoice.invoice_date ?? null,
  }));
}

export async function getFacturasByCategoria(
  houseCode: string,
  categoria: "luz" | "agua" | "wifi"
): Promise<FacturaEscenario[]> {
  const facturas = await getFacturasActivasByPiso(houseCode);
  return facturas
    .filter((item) => item.categoria.toLowerCase() === categoria)
    .slice(0, 6);
}

