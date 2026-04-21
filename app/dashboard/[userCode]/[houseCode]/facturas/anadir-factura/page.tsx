import { FacturasAddScreen } from "../../../../../../components/facturas/facturas-add-screen";
import { MiniDoorLink } from "../../../../../../components/ui/mini-door-link";
import {
  getAccessibleHouseContext,
  loadAddInvoiceFormOptionsWithClient,
} from "../../../../../../lib/dashboard";

type FacturasAddPageProps = {
  params: Promise<{
    userCode: string;
    houseCode: string;
  }>;
};

export default async function FacturasAddPage({ params }: FacturasAddPageProps) {
  const { userCode, houseCode } = await params;
  const routeContext = await getAccessibleHouseContext(userCode, houseCode);
  const formOptions = await loadAddInvoiceFormOptionsWithClient(
    routeContext.supabase,
    routeContext.house.public_code
  );

  return (
    <>
      <MiniDoorLink
        menuHref={`${routeContext.dashboardPath}/menu`}
        dashboardPath={routeContext.dashboardPath}
        currentScreen="facturas"
      />
      <FacturasAddScreen
        houseCode={routeContext.house.public_code}
        dashboardPath={routeContext.dashboardPath}
        formOptions={formOptions}
      />
    </>
  );
}
