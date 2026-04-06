import { redirect } from "next/navigation";

import { FacturasAlquilerScreen } from "../../../../../components/facturas/facturas-alquiler-screen";
import { createClient } from "../../../../../utils/supabase/server";

type FacturasAlquilerPageProps = {
  params: Promise<{
    houseId: string;
  }>;
};

export default async function FacturasAlquilerPage({ params }: FacturasAlquilerPageProps) {
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

  return <FacturasAlquilerScreen houseCode={house.public_code} />;
}

