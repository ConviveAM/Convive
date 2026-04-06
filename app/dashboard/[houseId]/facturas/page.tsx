import { redirect } from "next/navigation";

import { FacturasScreen } from "../../../../components/facturas/facturas-screen";
import { createClient } from "../../../../utils/supabase/server";

type FacturasPageProps = {
  params: Promise<{
    houseId: string;
  }>;
};

export default async function FacturasPage({ params }: FacturasPageProps) {
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

  return <FacturasScreen houseCode={house.public_code} />;
}

