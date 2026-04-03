import { redirect } from "next/navigation";

import { AreaPersonalScreen } from "../../../../components/area-personal/area-personal-screen";
import { createClient } from "../../../../utils/supabase/server";

type AreaPersonalPageProps = {
  params: Promise<{
    houseId: string;
  }>;
};

export default async function AreaPersonalPage({ params }: AreaPersonalPageProps) {
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

  return <AreaPersonalScreen houseCode={house.public_code} />;
}
