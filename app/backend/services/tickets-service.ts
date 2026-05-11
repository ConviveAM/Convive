import { createClient } from "../endpoints/shared/supabase-server";
import { loadOpenHousePurchaseTicketsWithClient } from "../endpoints/shared/dashboard-core";

function asNumber(value: number | string) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isCurrentMonth(dateText: string) {
  const date = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

export async function getGastosMesActual(houseCode: string): Promise<number> {
  const supabase = await createClient();
  const tickets = await loadOpenHousePurchaseTicketsWithClient(supabase, houseCode, 500);

  return tickets
    .filter((ticket) => isCurrentMonth(ticket.purchase_date))
    .reduce((acc, ticket) => acc + asNumber(ticket.total_amount), 0);
}

