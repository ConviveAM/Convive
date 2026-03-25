import Link from "next/link";

import { createClient } from "../../../utils/supabase/server";

type HouseDashboardPageProps = {
  params: Promise<{
    houseId: string;
  }>;
};

export default async function HouseDashboardPage({
  params,
}: HouseDashboardPageProps) {
  const { houseId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main style={{ padding: "2rem" }}>
        <h1>No hay sesion activa</h1>
      </main>
    );
  }

  const { data: house, error: houseError } = await supabase
    .from("houses")
    .select("id, name, public_code, created_by")
    .eq("public_code", houseId)
    .single();

  if (houseError || !house) {
    return (
      <main style={{ padding: "2rem" }}>
        <h1>Piso no encontrado</h1>
        <pre>{JSON.stringify(houseError, null, 2)}</pre>
      </main>
    );
  }

  const { data: members, error: membersError } = await supabase
    .from("house_members")
    .select(`
      id,
      role,
      profile_id,
      profiles (
        id,
        email,
        full_name
      )
    `)
    .eq("house_id", house.id)
    .eq("is_active", true);

  return (
    <main style={{ padding: "2rem" }}>
      <Link href={`/dashboard/profile/${user.id}`}>Volver a mi perfil</Link>
      <h1>Dashboard del piso</h1>
      <p>
        <strong>Nombre:</strong> {house.name}
      </p>
      <p>
        <strong>Codigo del piso:</strong> {house.public_code}
      </p>

      <h2 style={{ marginTop: "2rem" }}>Miembros del piso</h2>

      {membersError ? (
        <pre>{JSON.stringify(membersError, null, 2)}</pre>
      ) : !members?.length ? (
        <p>No hay miembros en este piso todavia.</p>
      ) : (
        <ul>
          {members.map((member) => {
            const profile = Array.isArray(member.profiles)
              ? member.profiles[0]
              : member.profiles;

            return (
              <li key={member.id}>
                {profile?.full_name?.trim()
                  ? profile.full_name
                  : profile?.email ?? member.profile_id}
                {" - "}
                {member.role}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
