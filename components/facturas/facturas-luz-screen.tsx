"use client";

import type { Invoice } from "../../lib/dashboard-types";
import { FacturasHistoryScreen } from "./facturas-history-screen";

type FacturasLuzScreenProps = {
  houseCode: string;
  dashboardPath: string;
  invoices?: Invoice[];
  canMarkInvoicesPaid?: boolean;
};

export function FacturasLuzScreen(props: FacturasLuzScreenProps) {
  return (
    <FacturasHistoryScreen
      {...props}
      title="Facturas luz"
      categorySlug="luz"
    />
  );
}
