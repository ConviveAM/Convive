import { redirect } from "next/navigation";

import { getDefaultDashboardPath } from "../../../backend/endpoints/home/queries";

export default async function LegacyProfileDashboardPage() {
  redirect(await getDefaultDashboardPath());
}
