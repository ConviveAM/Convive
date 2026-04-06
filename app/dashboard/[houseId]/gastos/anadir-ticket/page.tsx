import { redirect } from "next/navigation";

import { GastosAddTicketScreen } from "../../../../../components/gastos/gastos-add-ticket-screen";
import { createClient } from "../../../../../utils/supabase/server";

type GastosAddTicketPageProps = {
  params: Promise<{
    houseId: string;
  }>;
};

export default async function GastosAddTicketPage({ params }: GastosAddTicketPageProps) {
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

  return <GastosAddTicketScreen houseCode={house.public_code} />;
}

