"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server";

export async function createHouseAction(formData: {
  name: string;
  people: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión antes de crear un piso." };
  }

  const { data, error } = await supabase.rpc("create_house", {
    p_name: formData.name,
    p_max_members: Number(formData.people),
  });

  if (error) {
    return { error: error.message };
  }

  redirect(`/dashboard/${data}`);
}

export async function joinHouseAction(formData: { code: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión antes de unirte a un piso." };
  }

  const { data, error } = await supabase.rpc("join_house_by_code", {
    p_code: formData.code,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(`/dashboard/${data}`);
}

export async function createHouseFromFormAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const result = await createHouseAction({
    name: String(formData.get("name") ?? "").trim(),
    people: String(formData.get("people") ?? "").trim(),
  });

  if (result?.error) {
    redirect(`/dashboard/profile/${user.id}?error=${encodeURIComponent(result.error)}`);
  }
}

export async function joinHouseFromFormAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const result = await joinHouseAction({
    code: String(formData.get("code") ?? "").trim(),
  });

  if (result?.error) {
    redirect(`/dashboard/profile/${user.id}?error=${encodeURIComponent(result.error)}`);
  }
}
