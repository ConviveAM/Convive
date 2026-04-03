import { redirect } from "next/navigation";

import { GastosSimplificarScreen } from "../../../../../components/gastos/gastos-simplificar-screen";
import { createClient } from "../../../../../utils/supabase/server";

type GastosSimplificarPageProps = {
  params: Promise<{
    houseId: string;
  }>;
};

export default async function GastosSimplificarPage({ params }: GastosSimplificarPageProps) {
  const { houseId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: house } = await supabase
    .from("houses")
    .select("public_code")
    .eq("public_code", houseId)
    .single();

  if (!house) {
    redirect("/dashboard");
  }

  return <GastosSimplificarScreen houseCode={house.public_code} />;
}

