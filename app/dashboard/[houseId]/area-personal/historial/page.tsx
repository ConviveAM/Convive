import { redirect } from "next/navigation";

import { AreaPersonalHistoryScreen } from "../../../../../components/area-personal/history-screen";
import { createClient } from "../../../../../utils/supabase/server";

type AreaPersonalHistoryPageProps = {
  params: Promise<{
    houseId: string;
  }>;
};

export default async function AreaPersonalHistoryPage({ params }: AreaPersonalHistoryPageProps) {
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

  return <AreaPersonalHistoryScreen houseCode={house.public_code} />;
}
