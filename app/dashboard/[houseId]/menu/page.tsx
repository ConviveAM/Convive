import { redirect } from "next/navigation";

import { ElectricalMenu } from "../../../../components/menu/electrical-menu";
import { createClient } from "../../../../utils/supabase/server";

type MenuPageProps = {
  params: Promise<{
    houseId: string;
  }>;
};

export default async function MenuPage({ params }: MenuPageProps) {
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

  return <ElectricalMenu houseCode={house.public_code} />;
}
