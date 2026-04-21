"use client";

import type { Invoice } from "../../lib/dashboard-types";
import { FacturasHistoryScreen } from "./facturas-history-screen";

type FacturasSuscripcionesScreenProps = {
  houseCode: string;
  dashboardPath: string;
  invoices?: Invoice[];
  canMarkInvoicesPaid?: boolean;
};

export function FacturasSuscripcionesScreen(
  props: FacturasSuscripcionesScreenProps
) {
  return (
    <FacturasHistoryScreen
      {...props}
      title="Facturas suscripciones"
      categorySlug="suscripciones"
    />
  );
}
