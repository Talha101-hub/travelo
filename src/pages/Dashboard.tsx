import DashboardOverview from "@/components/dashboard/DashboardOverview";

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your transport operations</p>
      </div>
      <DashboardOverview />
    </div>
  );
}