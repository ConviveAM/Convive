"use client";

import type { Invoice } from "../../lib/dashboard-types";
import { FacturasHistoryScreen } from "./facturas-history-screen";

type FacturasAlquilerScreenProps = {
  houseCode: string;
  dashboardPath: string;
  invoices?: Invoice[];
  canMarkInvoicesPaid?: boolean;
};

export function FacturasAlquilerScreen(props: FacturasAlquilerScreenProps) {
  return (
    <FacturasHistoryScreen
      {...props}
      title="Facturas alquiler"
      categorySlug="alquiler"
    />
  );
}
