type HouseDashboardPageProps = {
  params: Promise<{
    houseId: string;
  }>;
};

export default async function HouseDashboardPage({
  params,
}: HouseDashboardPageProps) {
  const { houseId } = await params;

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Dashboard del piso</h1>
      <p>ID del piso: {houseId}</p>
    </main>
  );
}
