import { FacturasAddScreen } from "../../../../../../components/facturas/facturas-add-screen";
import { getAccessibleHouseContext } from "../../../../../../lib/dashboard";

type FacturasAddPageProps = {
  params: Promise<{
    userCode: string;
    houseCode: string;
  }>;
};

export default async function FacturasAddPage({ params }: FacturasAddPageProps) {
  const { userCode, houseCode } = await params;
  const routeContext = await getAccessibleHouseContext(userCode, houseCode);

  return (
    <FacturasAddScreen
      houseCode={routeContext.house.public_code}
      dashboardPath={routeContext.dashboardPath}
    />
  );
}
