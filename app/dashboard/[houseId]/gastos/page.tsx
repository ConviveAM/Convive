import { redirect } from "next/navigation";

import { GastosScreen } from "../../../../components/gastos/gastos-screen";
import { createClient } from "../../../../utils/supabase/server";

type GastosPageProps = {
  params: Promise<{
    houseId: string;
  }>;
};

export default async function GastosPage({ params }: GastosPageProps) {
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

  return <GastosScreen houseCode={house.public_code} />;
}

