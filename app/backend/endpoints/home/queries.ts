import {
  getDefaultDashboardPath,
  loadHouseMemberCountWithClient,
  loadPersonalAreaDashboardWithClient,
} from "../shared/dashboard-core";

type HomeActivityItem = {
  id: string;
  label: string;
};

type HomeNextPayment = {
  amount: number | string;
  currency: string;
  title: string;
  daysUntil: number;
};

export type HomeDashboardData = {
  memberCount: number;
  monthlyPayments: {
    verifiedCount: number;
    totalCount: number;
    slotCount: number;
  };
  nextPayment: HomeNextPayment | null;
  debtSummary: {
    totalAmount: number | string;
    pendingCount: number;
  };
  recentActivity: HomeActivityItem[];
};

function toNumber(value: number | string | null | undefined) {
  const numericValue =
    typeof value === "number" ? value : Number(String(value ?? 0));

  return Number.isFinite(numericValue) ? numericValue : 0;
}

function parseDateKey(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
  if (!match) {
    return null;
  }

  const parsed = new Date(`${match[1]}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getTodayStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isSameMonth(date: Date, monthStart: Date) {
  return (
    date.getFullYear() === monthStart.getFullYear() &&
    date.getMonth() === monthStart.getMonth()
  );
}

function isCompletedStatus(status: string | null | undefined) {
  const normalizedStatus = status?.trim().toLowerCase() ?? "";

  return [
    "paid",
    "pagada",
    "pagado",
    "completed",
    "complete",
    "completed_self",
    "settled",
    "liquidada",
    "liquidado",
    "closed",
    "done",
    "archived",
  ].includes(normalizedStatus);
}

function formatCurrency(amount: number | string, currency = "EUR") {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(toNumber(amount)) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(toNumber(amount));
}

function buildActivityLabel(input: {
  title: string;
  subtitle: string;
  amount: number | string;
  currency: string;
}) {
  const parts = [input.title.trim(), input.subtitle.trim()].filter(Boolean);
  const label = parts.join(" - ").trim();

  if (!toNumber(input.amount)) {
    return label || "Movimiento reciente";
  }

  return `${label || "Movimiento reciente"} - ${formatCurrency(
    input.amount,
    input.currency
  )}`;
}

export async function loadHomeDashboardWithClient(
  supabase: Parameters<typeof loadHouseMemberCountWithClient>[0],
  houseCode: string,
  currentProfileId: string
) {
  const [memberCount, personalDashboard] = await Promise.all([
    loadHouseMemberCountWithClient(supabase, houseCode),
    loadPersonalAreaDashboardWithClient(supabase, houseCode, currentProfileId, 100),
  ]);

  const today = getTodayStart();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthHistory = personalDashboard.history.filter((item) => {
    const itemDate = parseDateKey(item.item_date);
    return itemDate ? isSameMonth(itemDate, monthStart) : false;
  });
  const verifiedCount = monthHistory.filter((item) =>
    isCompletedStatus(item.status)
  ).length;
  const totalCount = monthHistory.length;
  const upcomingDebtEvents = personalDashboard.calendar_events
    .filter((event) => event.event_type === "deuda")
    .map((event) => {
      const eventDate = parseDateKey(event.event_date);
      return eventDate
        ? {
            event,
            eventDate,
          }
        : null;
    })
    .filter(
      (
        value
      ): value is {
        event: (typeof personalDashboard.calendar_events)[number];
        eventDate: Date;
      } => Boolean(value)
    )
    .filter(({ eventDate }) => eventDate >= today)
    .sort((first, second) => first.eventDate.getTime() - second.eventDate.getTime());
  const nextPayment = upcomingDebtEvents[0]
    ? {
        amount: upcomingDebtEvents[0].event.amount,
        currency: upcomingDebtEvents[0].event.currency,
        title: upcomingDebtEvents[0].event.title,
        daysUntil: Math.round(
          (upcomingDebtEvents[0].eventDate.getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      }
    : null;

  return {
    memberCount,
    monthlyPayments: {
      verifiedCount,
      totalCount,
      slotCount: totalCount > 0 ? Math.min(Math.max(totalCount, 4), 8) : 6,
    },
    nextPayment,
    debtSummary: {
      totalAmount: personalDashboard.summary.my_debts_total,
      pendingCount: personalDashboard.summary.my_debts_count,
    },
    recentActivity: personalDashboard.history.slice(0, 2).map((item) => ({
      id: `${item.item_type}-${item.item_id}`,
      label: buildActivityLabel({
        title: item.title,
        subtitle: item.subtitle,
        amount: item.amount,
        currency: item.currency,
      }),
    })),
  } satisfies HomeDashboardData;
}

export { getDefaultDashboardPath, loadHouseMemberCountWithClient };
