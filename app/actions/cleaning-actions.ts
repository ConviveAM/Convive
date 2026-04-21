"use server";

import { revalidatePath } from "next/cache";

import {
  getAuthenticatedProfileContext,
  loadHouseCleaningTaskHistoryWithClient,
} from "../../lib/dashboard";
import type { CleaningTask } from "../../lib/dashboard-types";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type CreateCleaningTaskInput = {
  houseCode: string;
  dashboardPath: string;
  title: string;
  dueDate: string;
  assignedProfileId: string;
  zoneId: string | null;
  customZoneName: string | null;
  notes: string | null;
};

type RotateCleaningTasksInput = {
  houseCode: string;
  dashboardPath: string;
  taskAId: string;
  taskBId: string;
  note: string | null;
};

type CompleteCleaningTaskInput = {
  houseCode: string;
  dashboardPath: string;
  taskId: string;
};

type LoadCleaningHistoryInput = {
  houseCode: string;
  zoneId: string | null;
  zoneName: string | null;
};

function toActionError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Ha ocurrido un error inesperado.";
}

function revalidateCleaningPaths(dashboardPath: string) {
  const paths = [dashboardPath, `${dashboardPath}/limpieza`];

  for (const path of paths) {
    revalidatePath(path);
  }
}

export async function createCleaningTaskAction(
  input: CreateCleaningTaskInput
): Promise<ActionResult<{ taskId: string }>> {
  try {
    const { supabase } = await getAuthenticatedProfileContext();

    const { data, error } = await supabase.rpc("create_cleaning_task", {
      p_house_public_code: input.houseCode,
      p_title: input.title.trim(),
      p_due_date: input.dueDate,
      p_assigned_profile_id: input.assignedProfileId,
      p_zone_id: input.zoneId,
      p_custom_zone_name: input.customZoneName?.trim()
        ? input.customZoneName.trim()
        : null,
      p_notes: input.notes?.trim() ? input.notes.trim() : null,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateCleaningPaths(input.dashboardPath);

    return {
      success: true,
      data: {
        taskId:
          typeof data?.task_id === "string"
            ? data.task_id
            : String(data?.task_id ?? data?.id ?? ""),
      },
    };
  } catch (error) {
    return { success: false, error: toActionError(error) };
  }
}

export async function rotateCleaningTasksAction(
  input: RotateCleaningTasksInput
): Promise<ActionResult<{ taskAId: string; taskBId: string }>> {
  try {
    const { supabase } = await getAuthenticatedProfileContext();

    const { error } = await supabase.rpc("rotate_cleaning_tasks", {
      p_house_public_code: input.houseCode,
      p_task_a_id: input.taskAId,
      p_task_b_id: input.taskBId,
      p_note: input.note?.trim() ? input.note.trim() : null,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateCleaningPaths(input.dashboardPath);

    return {
      success: true,
      data: {
        taskAId: input.taskAId,
        taskBId: input.taskBId,
      },
    };
  } catch (error) {
    return { success: false, error: toActionError(error) };
  }
}

export async function completeCleaningTaskAction(
  input: CompleteCleaningTaskInput
): Promise<ActionResult<{ taskId: string }>> {
  try {
    const { supabase } = await getAuthenticatedProfileContext();

    const { error } = await supabase.rpc("complete_cleaning_task", {
      p_house_public_code: input.houseCode,
      p_task_id: input.taskId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateCleaningPaths(input.dashboardPath);

    return {
      success: true,
      data: {
        taskId: input.taskId,
      },
    };
  } catch (error) {
    return { success: false, error: toActionError(error) };
  }
}

export async function loadCleaningTaskHistoryAction(
  input: LoadCleaningHistoryInput
): Promise<ActionResult<CleaningTask[]>> {
  try {
    const { supabase } = await getAuthenticatedProfileContext();
    const tasks = await loadHouseCleaningTaskHistoryWithClient(
      supabase,
      input.houseCode,
      100,
      0,
      input.zoneId,
      input.zoneName
    );

    return { success: true, data: tasks };
  } catch (error) {
    return { success: false, error: toActionError(error) };
  }
}
