import { redirect } from "next/navigation";

import { FacturasWifiScreen } from "../../../../../components/facturas/facturas-wifi-screen";
import { createClient } from "../../../../../utils/supabase/server";

type FacturasWifiPageProps = {
  params: Promise<{
    houseId: string;
  }>;
};

export default async function FacturasWifiPage({ params }: FacturasWifiPageProps) {
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

  return <FacturasWifiScreen houseCode={house.public_code} />;
}

