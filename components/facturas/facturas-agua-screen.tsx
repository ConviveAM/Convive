"use client";

import type { Invoice } from "../../lib/dashboard-types";
import { FacturasHistoryScreen } from "./facturas-history-screen";

type FacturasAguaScreenProps = {
  houseCode: string;
  dashboardPath: string;
  invoices?: Invoice[];
  canMarkInvoicesPaid?: boolean;
};

export function FacturasAguaScreen(props: FacturasAguaScreenProps) {
  return (
    <FacturasHistoryScreen
      {...props}
      title="Facturas agua"
      categorySlug="agua"
    />
  );
}
