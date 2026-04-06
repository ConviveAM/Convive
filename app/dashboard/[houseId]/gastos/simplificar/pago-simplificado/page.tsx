import { redirect } from "next/navigation";

import { GastosPagoSimplificadoScreen } from "../../../../../../components/gastos/gastos-pago-simplificado-screen";
import { createClient } from "../../../../../../utils/supabase/server";

type GastosPagoSimplificadoPageProps = {
  params: Promise<{
    houseId: string;
  }>;
};

export default async function GastosPagoSimplificadoPage({ params }: GastosPagoSimplificadoPageProps) {
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

  return <GastosPagoSimplificadoScreen houseCode={house.public_code} />;
}

