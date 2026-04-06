import { redirect } from "next/navigation";

import { FacturasSuscripcionesScreen } from "../../../../../components/facturas/facturas-suscripciones-screen";
import { createClient } from "../../../../../utils/supabase/server";

type FacturasSuscripcionesPageProps = {
  params: Promise<{
    houseId: string;
  }>;
};

export default async function FacturasSuscripcionesPage({ params }: FacturasSuscripcionesPageProps) {
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

  return <FacturasSuscripcionesScreen houseCode={house.public_code} />;
}

