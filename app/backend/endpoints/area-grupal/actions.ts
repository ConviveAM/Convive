"use server";

import type { ActionResult } from "../shared/action-result";
import { toActionError } from "../shared/action-result";
import { revalidatePaths } from "../shared/revalidate";
import { getAuthenticatedProfileContext } from "../auth/queries";

function revalidateAreaGrupalPaths(dashboardPath: string) {
  revalidatePaths([dashboardPath, `${dashboardPath}/area-grupal`]);
}

export async function addShoppingListItemAction(input: {
  houseCode: string;
  dashboardPath: string;
  text: string;
}): Promise<ActionResult<{ itemId: string }>> {
  try {
    const { supabase } = await getAuthenticatedProfileContext();
    const { data, error } = await supabase.rpc("add_house_shopping_list_item", {
      p_house_public_code: input.houseCode,
      p_text: input.text.trim(),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateAreaGrupalPaths(input.dashboardPath);

    return {
      success: true,
      data: {
        itemId:
          data && typeof data === "object" && !Array.isArray(data)
            ? String((data as { item_id?: unknown }).item_id ?? "")
            : "",
      },
    };
  } catch (error) {
    return { success: false, error: toActionError(error) };
  }
}

export async function toggleShoppingListItemAction(input: {
  houseCode: string;
  dashboardPath: string;
  itemId: string;
}): Promise<ActionResult<{ itemId: string; isChecked: boolean }>> {
  try {
    const { supabase } = await getAuthenticatedProfileContext();
    const { data, error } = await supabase.rpc("toggle_house_shopping_list_item", {
      p_house_public_code: input.houseCode,
      p_item_id: input.itemId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateAreaGrupalPaths(input.dashboardPath);

    return {
      success: true,
      data: {
        itemId: input.itemId,
        isChecked:
          data && typeof data === "object" && !Array.isArray(data)
            ? Boolean((data as { is_checked?: unknown }).is_checked)
            : false,
      },
    };
  } catch (error) {
    return { success: false, error: toActionError(error) };
  }
}

export async function deleteShoppingListItemAction(input: {
  houseCode: string;
  dashboardPath: string;
  itemId: string;
}): Promise<ActionResult<{ itemId: string }>> {
  try {
    const { supabase } = await getAuthenticatedProfileContext();
    const { error } = await supabase.rpc("delete_house_shopping_list_item", {
      p_house_public_code: input.houseCode,
      p_item_id: input.itemId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateAreaGrupalPaths(input.dashboardPath);
    return { success: true, data: { itemId: input.itemId } };
  } catch (error) {
    return { success: false, error: toActionError(error) };
  }
}

export async function clearShoppingListAction(input: {
  houseCode: string;
  dashboardPath: string;
}): Promise<ActionResult<{ cleared: true }>> {
  try {
    const { supabase } = await getAuthenticatedProfileContext();
    const { error } = await supabase.rpc("clear_house_shopping_list", {
      p_house_public_code: input.houseCode,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateAreaGrupalPaths(input.dashboardPath);
    return { success: true, data: { cleared: true } };
  } catch (error) {
    return { success: false, error: toActionError(error) };
  }
}

export async function updateMonthlyBudgetAction(input: {
  houseCode: string;
  dashboardPath: string;
  amount: number;
}): Promise<ActionResult<{ amount: number }>> {
  try {
    const { supabase } = await getAuthenticatedProfileContext();
    const { error } = await supabase.rpc("set_house_monthly_budget", {
      p_house_public_code: input.houseCode,
      p_amount: input.amount,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateAreaGrupalPaths(input.dashboardPath);
    return { success: true, data: { amount: input.amount } };
  } catch (error) {
    return { success: false, error: toActionError(error) };
  }
}
