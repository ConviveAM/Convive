import { notFound, redirect } from "next/navigation";

import { ElectricalMenu } from "../../../../components/menu/electrical-menu";
import { createClient } from "../../../../utils/supabase/server";

const ALLOWED_SECTIONS = new Set([
  "area-personal",
  "gastos",
  "facturas",
  "area-grupal",
  "calendario",
  "limpieza",
  "herramientas",
  "ajustes",
  "notificaciones",
]);

type SectionPageProps = {
  params: Promise<{
    houseId: string;
    section: string;
  }>;
};

export default async function SectionPage({ params }: SectionPageProps) {
  const { houseId, section } = await params;

  if (!ALLOWED_SECTIONS.has(section)) {
    notFound();
  }

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
