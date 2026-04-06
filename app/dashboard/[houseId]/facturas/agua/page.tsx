import { redirect } from "next/navigation";

import { FacturasAguaScreen } from "../../../../../components/facturas/facturas-agua-screen";
import { createClient } from "../../../../../utils/supabase/server";

type FacturasAguaPageProps = {
  params: Promise<{
    houseId: string;
  }>;
};

export default async function FacturasAguaPage({ params }: FacturasAguaPageProps) {
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

  return <FacturasAguaScreen houseCode={house.public_code} />;
}

