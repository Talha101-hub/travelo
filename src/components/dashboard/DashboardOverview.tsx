import { Car, Users, MapPin, DollarSign, Clock, CheckCircle } from "lucide-react";
import MetricCard from "./MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function DashboardOverview() {
  // Fetch dashboard data
  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await api.get("/reports/dashboard");
      return res.data.data;
    },
    staleTime: 30_000,
  });

  // Fetch recent trips
  const { data: recentTrips = [] } = useQuery({
    queryKey: ["recentTrips"],
    queryFn: async () => {
      const res = await api.get("/trips");
      return res.data.data.slice(0, 5).map((t: any) => ({
        id: t._id,
        route: `${t.startingPlace} → ${t.destination}`,
        driver: t.driver?.name || "Unknown",
        status: t.status,
        amount: `$${t.budget}`
      }));
    },
    staleTime: 15_000,
  });

  const metrics = [
    {
      title: "Total Drivers",
      value: dashboardData?.stats?.totalDrivers?.toString() || "0",
      change: "Active drivers",
      icon: Users,
      variant: "default" as const
    },
    {
      title: "Active Trips",
      value: dashboardData?.stats?.ongoingTrips?.toString() || "0",
      change: "Currently ongoing",
      icon: MapPin,
      variant: "warning" as const
    },
    {
      title: "Total Revenue",
      value: `$${dashboardData?.stats?.totalRevenue?.toLocaleString() || "0"}`,
      change: "This month",
      icon: DollarSign,
      variant: "success" as const
    },
    {
      title: "Cars in Fleet",
      value: dashboardData?.stats?.totalTrips?.toString() || "0",
      change: "Total trips",
      icon: Car,
      variant: "default" as const
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-success/10 text-success">Completed</Badge>;
      case "ongoing":
        return <Badge variant="secondary" className="bg-warning/10 text-warning">Ongoing</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Recent Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Recent Trips</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTrips.length > 0 ? recentTrips.map((trip) => (
                <div key={trip.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{trip.route}</p>
                    <p className="text-sm text-muted-foreground">{trip.driver} • {trip.id}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-semibold text-foreground">{trip.amount}</p>
                    {getStatusBadge(trip.status)}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recent trips found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Quick Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-primary/5">
                <span className="text-muted-foreground">Trips This Week</span>
                <span className="font-semibold text-primary">15</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-success/5">
                <span className="text-muted-foreground">Revenue This Week</span>
                <span className="font-semibold text-success">$12,450</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-warning/5">
                <span className="text-muted-foreground">Pending Payments</span>
                <span className="font-semibold text-warning">$3,200</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-accent">
                <span className="text-muted-foreground">Available Drivers</span>
                <span className="font-semibold text-foreground">16</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}