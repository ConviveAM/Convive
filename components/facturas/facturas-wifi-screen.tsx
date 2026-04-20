"use client";

import type { Invoice } from "../../lib/dashboard-types";
import { FacturasHistoryScreen } from "./facturas-history-screen";

type FacturasWifiScreenProps = {
  houseCode: string;
  dashboardPath: string;
  invoices?: Invoice[];
  canMarkInvoicesPaid?: boolean;
};

export function FacturasWifiScreen(props: FacturasWifiScreenProps) {
  return (
    <FacturasHistoryScreen
      {...props}
      title="Facturas wifi"
      categorySlug="wifi"
    />
  );
}
