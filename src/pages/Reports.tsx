import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Car, 
  Wrench, 
  Calendar as CalendarIcon,
  Download,
  Filter
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";

interface ReportData {
  totalTrips: number;
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  totalDrivers: number;
  totalVendors: number;
  totalMaintenance: number;
  maintenanceCost: number;
  completedTrips: number;
  pendingTrips: number;
  ongoingTrips: number;
}

interface DashboardData {
  totalTrips: number;
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  totalDrivers: number;
  totalVendors: number;
  totalMaintenance: number;
  maintenanceCost: number;
  completedTrips: number;
  pendingTrips: number;
  ongoingTrips: number;
  recentTrips: any[];
}

export default function Reports() {
  const [period, setPeriod] = useState("monthly");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      const res = await api.get("/reports/dashboard");
      return res.data.data;
    },
    staleTime: 30_000,
  });

  const { data: reportData, isLoading: isReportLoading } = useQuery<ReportData>({
    queryKey: ["reports", { period, dateRange }],
    queryFn: async () => {
      const params: any = { period };
      if (dateRange.from) {
        params.startDate = dateRange.from.toISOString().split('T')[0];
      }
      if (dateRange.to) {
        params.endDate = dateRange.to.toISOString().split('T')[0];
      }
      
      const res = await api.get("/reports", { params });
      return res.data.data;
    },
    staleTime: 30_000,
  });

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    if (value !== "custom") {
      setDateRange({ from: undefined, to: undefined });
    }
  };

  const exportReport = () => {
    if (!data) {
      console.log("No data to export");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;

    // Helper function to add text
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont("helvetica", "bold");
      } else {
        doc.setFont("helvetica", "normal");
      }
      doc.text(text, margin, yPosition);
      yPosition += fontSize * 0.4;
    };

    // Helper function to add line
    const addLine = () => {
      yPosition += 5;
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
    };

    // Header
    addText("Haramain Transport Management System", 20, true);
    addText("Reports & Analytics", 16, true);
    addText(`Generated on: ${new Date().toLocaleDateString()}`, 10);
    addText(`Period: ${period.charAt(0).toUpperCase() + period.slice(1)}`, 10);
    addLine();

    // Key Metrics
    addText("KEY METRICS", 14, true);
    addText(`Total Revenue: $${data.totalRevenue?.toLocaleString() || 0}`, 12);
    addText(`Total Trips: ${data.totalTrips || 0}`, 12);
    addText(`Total Expenses: $${data.totalExpense?.toLocaleString() || 0}`, 12);
    addText(`Net Profit: $${data.netProfit?.toLocaleString() || 0}`, 12);
    addLine();

    // Trip Statistics
    addText("TRIP STATISTICS", 14, true);
    addText(`Completed Trips: ${data.completedTrips || 0}`, 12);
    addText(`Ongoing Trips: ${data.ongoingTrips || 0}`, 12);
    addText(`Pending Trips: ${data.pendingTrips || 0}`, 12);
    addLine();

    // Resource Statistics
    addText("RESOURCE STATISTICS", 14, true);
    addText(`Active Drivers: ${data.totalDrivers || 0}`, 12);
    addText(`Vendor Partners: ${data.totalVendors || 0}`, 12);
    addText(`Maintenance Records: ${data.totalMaintenance || 0}`, 12);
    addText(`Maintenance Cost: $${data.maintenanceCost?.toLocaleString() || 0}`, 12);

    // Save the PDF
    const fileName = `haramain-report-${period}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  if (isDashboardLoading || isReportLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  // Debug: Log the received data
  console.log('Report Data:', reportData);
  console.log('Dashboard Data:', dashboardData);

  // Extract data from the nested API response structure
  const data = reportData ? {
    totalTrips: reportData.trips?.totalTrips || 0,
    totalRevenue: reportData.revenue?.totalRevenue || 0,
    totalExpense: (reportData.expenses?.driverExpenses?.totalTempExpenses || 0) + (reportData.expenses?.maintenanceExpenses?.totalMaintenanceCost || 0),
    netProfit: (reportData.revenue?.totalRevenue || 0) - ((reportData.expenses?.driverExpenses?.totalTempExpenses || 0) + (reportData.expenses?.maintenanceExpenses?.totalMaintenanceCost || 0)),
    totalDrivers: reportData.drivers?.totalDrivers || 0,
    totalVendors: reportData.vendors?.totalVendors || 0,
    totalMaintenance: reportData.maintenance?.totalMaintenance || 0,
    maintenanceCost: reportData.maintenance?.totalCost || 0,
    completedTrips: reportData.trips?.completedTrips || 0,
    pendingTrips: reportData.trips?.pendingTrips || 0,
    ongoingTrips: reportData.trips?.ongoingTrips || 0,
  } : dashboardData ? {
    totalTrips: dashboardData.stats?.totalTrips || 0,
    totalRevenue: dashboardData.stats?.totalRevenue || 0,
    totalExpense: 0, // Dashboard doesn't provide expense data
    netProfit: dashboardData.stats?.totalRevenue || 0,
    totalDrivers: dashboardData.stats?.totalDrivers || 0,
    totalVendors: 0, // Dashboard doesn't provide vendor count
    totalMaintenance: 0, // Dashboard doesn't provide maintenance count
    maintenanceCost: 0,
    completedTrips: 0, // Dashboard doesn't provide trip status breakdown
    pendingTrips: 0,
    ongoingTrips: dashboardData.stats?.ongoingTrips || 0,
  } : {} as ReportData;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into your transport operations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Report Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Period</label>
              <Select value={period} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="quarterly">This Quarter</SelectItem>
                  <SelectItem value="yearly">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {period === "custom" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-64 justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={(range) => {
                        setDateRange({
                          from: range?.from,
                          to: range?.to,
                        });
                        if (range?.from && range?.to) {
                          setIsCalendarOpen(false);
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-primary">${data.totalRevenue?.toLocaleString() || 0}</p>
                <p className="text-xs text-success flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% from last period
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-warning bg-gradient-to-r from-warning/5 to-warning/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Trips</p>
                <p className="text-2xl font-bold text-warning">{data.totalTrips || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.completedTrips || 0} completed
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-destructive bg-gradient-to-r from-destructive/5 to-destructive/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-destructive">${data.totalExpense?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ${data.maintenanceCost?.toLocaleString() || 0} maintenance
                </p>
              </div>
              <Wrench className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-success bg-gradient-to-r from-success/5 to-success/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className="text-2xl font-bold text-success">${data.netProfit?.toLocaleString() || 0}</p>
                <p className="text-xs text-success flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.2% margin
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trip Statistics */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Trip Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Completed Trips</span>
                <Badge className="bg-success/10 text-success">
                  {data.completedTrips || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Ongoing Trips</span>
                <Badge className="bg-warning/10 text-warning">
                  {data.ongoingTrips || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending Trips</span>
                <Badge className="bg-muted text-muted-foreground">
                  {data.pendingTrips || 0}
                </Badge>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Trips</span>
                  <span className="text-lg font-bold">{data.totalTrips || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resource Statistics */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Resource Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Drivers</span>
                <Badge className="bg-primary/10 text-primary">
                  {data.totalDrivers || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Vendor Partners</span>
                <Badge className="bg-warning/10 text-warning">
                  {data.totalVendors || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Maintenance Records</span>
                <Badge className="bg-destructive/10 text-destructive">
                  {data.totalMaintenance || 0}
                </Badge>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Maintenance Cost</span>
                  <span className="text-lg font-bold text-destructive">
                    ${data.maintenanceCost?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Financial Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-primary">${data.totalRevenue?.toLocaleString() || 0}</p>
            </div>
            <div className="text-center p-4 bg-destructive/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-destructive">${data.totalExpense?.toLocaleString() || 0}</p>
            </div>
            <div className="text-center p-4 bg-success/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className="text-2xl font-bold text-success">${data.netProfit?.toLocaleString() || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
