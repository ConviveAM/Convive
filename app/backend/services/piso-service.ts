import { createClient } from "../endpoints/shared/supabase-server";

function readBudgetMonth(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value.slice(0, 7);
  }
  const now = new Date();
  return `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, "0")}`;
}

function toNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(String(value ?? 0));
  return Number.isFinite(parsed) ? parsed : 0;
}

export type PresupuestoMensual = {
  budget_month: string;
  budget_amount: number;
  can_edit: boolean;
};

export async function getPresupuestoMensualByPiso(
  houseCode: string
): Promise<PresupuestoMensual> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_house_monthly_budget", {
    p_house_public_code: houseCode,
  });

  if (error || !data || typeof data !== "object" || Array.isArray(data)) {
    return {
      budget_month: readBudgetMonth(null),
      budget_amount: 0,
      can_edit: false,
    };
  }

  return {
    budget_month: readBudgetMonth((data as { budget_month?: unknown }).budget_month),
    budget_amount: toNumber((data as { budget_amount?: unknown }).budget_amount),
    can_edit: (data as { can_edit?: unknown }).can_edit === true,
  };
}

