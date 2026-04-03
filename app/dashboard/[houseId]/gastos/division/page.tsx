import { redirect } from "next/navigation";

import { GastosDivisionScreen } from "../../../../../components/gastos/gastos-division-screen";
import { createClient } from "../../../../../utils/supabase/server";

type GastosDivisionPageProps = {
  params: Promise<{
    houseId: string;
  }>;
};

export default async function GastosDivisionPage({ params }: GastosDivisionPageProps) {
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

  return <GastosDivisionScreen houseCode={house.public_code} />;
}

