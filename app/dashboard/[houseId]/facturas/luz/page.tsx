import { redirect } from "next/navigation";

import { FacturasLuzScreen } from "../../../../../components/facturas/facturas-luz-screen";
import { createClient } from "../../../../../utils/supabase/server";

type FacturasLuzPageProps = {
  params: Promise<{
    houseId: string;
  }>;
};

export default async function FacturasLuzPage({ params }: FacturasLuzPageProps) {
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

  return <FacturasLuzScreen houseCode={house.public_code} />;
}

