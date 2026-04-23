"use server";

import { getAuthenticatedProfileContext } from "../auth/queries";
import type { ActionResult } from "../shared/action-result";
import { toActionError } from "../shared/action-result";
import { revalidatePaths } from "../shared/revalidate";

type CreatePendingInvoiceExpenseInput = {
  houseCode: string;
  dashboardPath: string;
  title: string;
  invoiceDate: string;
  totalAmount: number;
  participantProfileIds: string[];
  invoiceCategoryId: string | null;
  customCategoryName: string | null;
  notes: string | null;
  paidByProfileId: string | null;
  invoiceFilePath: string | null;
};

type AdminMarkInvoicePaidInput = {
  houseCode: string;
  dashboardPath: string;
  expenseId: string;
};

function revalidateInvoicePaths(dashboardPath: string) {
  revalidatePaths([
    dashboardPath,
    `${dashboardPath}/facturas`,
    `${dashboardPath}/facturas/anadir-factura`,
    `${dashboardPath}/facturas/alquiler`,
    `${dashboardPath}/facturas/suscripciones`,
    `${dashboardPath}/facturas/wifi`,
    `${dashboardPath}/facturas/agua`,
    `${dashboardPath}/facturas/luz`,
  ]);
}

export async function createPendingInvoiceExpenseAction(
  input: CreatePendingInvoiceExpenseInput
): Promise<ActionResult<{ expenseId: string }>> {
  try {
    const { supabase } = await getAuthenticatedProfileContext();

    const { data, error } = await supabase.rpc("create_pending_invoice_expense", {
      p_house_public_code: input.houseCode,
      p_title: input.title.trim(),
      p_invoice_date: input.invoiceDate,
      p_total_amount: input.totalAmount,
      p_participant_profile_ids: input.participantProfileIds,
      p_invoice_category_id: input.invoiceCategoryId,
      p_custom_category_name: input.customCategoryName?.trim()
        ? input.customCategoryName.trim()
        : null,
      p_notes: input.notes?.trim() ? input.notes.trim() : null,
      p_paid_by_profile_id: input.paidByProfileId,
      p_invoice_file_path: input.invoiceFilePath,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateInvoicePaths(input.dashboardPath);

    return {
      success: true,
      data: {
        expenseId:
          typeof data?.expense_id === "string"
            ? data.expense_id
            : String(data?.expense_id ?? ""),
      },
    };
  } catch (error) {
    return { success: false, error: toActionError(error) };
  }
}

export async function adminMarkInvoicePaidAction(
  input: AdminMarkInvoicePaidInput
): Promise<ActionResult<{ expenseId: string; status: string }>> {
  try {
    const { supabase } = await getAuthenticatedProfileContext();

    const { data, error } = await supabase.rpc("admin_mark_invoice_paid", {
      p_house_public_code: input.houseCode,
      p_expense_id: input.expenseId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateInvoicePaths(input.dashboardPath);

    return {
      success: true,
      data: {
        expenseId:
          typeof data?.expense_id === "string"
            ? data.expense_id
            : input.expenseId,
        status: typeof data?.status === "string" ? data.status : "paid",
      },
    };
  } catch (error) {
    return { success: false, error: toActionError(error) };
  }
}
