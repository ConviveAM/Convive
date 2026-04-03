import { redirect } from "next/navigation";

import { GastosTicketsScreen } from "../../../../../components/gastos/gastos-tickets-screen";
import { createClient } from "../../../../../utils/supabase/server";

type GastosTicketsPageProps = {
  params: Promise<{
    houseId: string;
  }>;
};

export default async function GastosTicketsPage({ params }: GastosTicketsPageProps) {
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

  return <GastosTicketsScreen houseCode={house.public_code} />;
}

