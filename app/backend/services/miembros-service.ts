import { createClient } from "../endpoints/shared/supabase-server";
import { loadAddInvoiceFormOptionsWithClient } from "../endpoints/shared/dashboard-core";

export type MiembroEscenario = {
  profile_id: string;
  nombre: string;
  apellidos: string;
  tamano_habitacion: string | null;
  fecha_entrada: string | null;
  fecha_salida: string | null;
};

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    nombre: parts[0] ?? fullName.trim(),
    apellidos: parts.slice(1).join(" "),
  };
}

export async function getMiembrosByPiso(houseCode: string): Promise<MiembroEscenario[]> {
  const supabase = await createClient();
  const formOptions = await loadAddInvoiceFormOptionsWithClient(supabase, houseCode);

  const members = formOptions.members.map((member) => {
    const split = splitName(member.display_name);
    return {
      profile_id: member.profile_id,
      nombre: split.nombre,
      apellidos: split.apellidos,
      tamano_habitacion: null,
      fecha_entrada: null,
      fecha_salida: null,
    } satisfies MiembroEscenario;
  });

  // Intentamos enriquecer con datos de house_members si la tabla está disponible.
  try {
    const { data: houseData } = await supabase
      .from("houses")
      .select("id")
      .eq("public_code", houseCode)
      .maybeSingle();

    const houseId = houseData?.id as string | undefined;
    if (!houseId || members.length === 0) {
      return members;
    }

    const { data: houseMembers, error: houseMembersError } = await supabase
      .from("house_members")
      .select("profile_id, room_size, stay_start_date, stay_end_date")
      .eq("house_id", houseId);

    if (houseMembersError || !houseMembers) {
      return members;
    }

    const byProfileId = new Map(
      houseMembers.map((row) => [
        String(row.profile_id),
        {
          tamano_habitacion:
            typeof row.room_size === "string" ? row.room_size : null,
          fecha_entrada:
            typeof row.stay_start_date === "string" ? row.stay_start_date : null,
          fecha_salida:
            typeof row.stay_end_date === "string" ? row.stay_end_date : null,
        },
      ])
    );

    return members.map((member) => ({
      ...member,
      tamano_habitacion:
        byProfileId.get(member.profile_id)?.tamano_habitacion ?? null,
      fecha_entrada: byProfileId.get(member.profile_id)?.fecha_entrada ?? null,
      fecha_salida: byProfileId.get(member.profile_id)?.fecha_salida ?? null,
    }));
  } catch {
    return members;
  }
}

