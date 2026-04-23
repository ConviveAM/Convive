import { createClient } from "../shared/supabase-server";
import {
  loadHouseCleaningDashboardWithClient,
  loadHouseInvoiceHistoryWithClient,
  loadHousePendingPaymentConfirmationsWithClient,
  loadHousePurchaseTicketsHistoryWithClient,
  loadHouseSharedExpensesHistoryWithClient,
} from "../shared/dashboard-core";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function loadCalendarScreenData(
  supabase: SupabaseServerClient,
  houseCode: string
) {
  const [
    ticketsHistory,
    sharedExpensesHistory,
    invoicesHistory,
    cleaningDashboard,
    pendingPaymentConfirmations,
  ] = await Promise.all([
    loadHousePurchaseTicketsHistoryWithClient(supabase, houseCode, 200, 0),
    loadHouseSharedExpensesHistoryWithClient(supabase, houseCode, 200, 0),
    loadHouseInvoiceHistoryWithClient(supabase, houseCode, 200, 0),
    loadHouseCleaningDashboardWithClient(supabase, houseCode, 200),
    loadHousePendingPaymentConfirmationsWithClient(supabase, houseCode),
  ]);

  return {
    tickets: ticketsHistory,
    sharedExpenses: sharedExpensesHistory,
    invoices: invoicesHistory,
    cleaningTasks: cleaningDashboard.zones.flatMap((zone) => zone.tasks),
    pendingPayments: pendingPaymentConfirmations,
  };
}
