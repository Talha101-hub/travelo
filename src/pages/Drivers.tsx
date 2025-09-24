import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Eye, ExternalLink, History, MapPin, Calendar, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import DriverForm from "@/components/forms/DriverForm";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Driver {
  id: string;
  name: string;
  carNumber: string;
  carModel: string;
  akamaNumber: string;
  salary: number;
  vendorIds: string[];
  vendors?: Array<{ id: string; name: string; contactPerson: string }>;
  completedTrips?: number;
  status: "active" | "inactive";
}

export default function Drivers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTripHistoryOpen, setIsTripHistoryOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const highlightedDriverRef = useRef<HTMLDivElement>(null);

  const { data: drivers = [], isLoading } = useQuery<Driver[]>({
    queryKey: ["drivers", { search: searchTerm }],
    queryFn: async () => {
      const res = await api.get("/drivers", { params: { search: searchTerm } });
      // Map backend response to frontend interface
      return res.data.data.map((d: any) => ({
        id: d._id,
        name: d.name,
        carNumber: d.carNumber,
        carModel: d.carModel,
        akamaNumber: d.akamaNumber,
        salary: d.driverSalary,
        vendorIds: d.vendorIds?.map((v: any) => v._id || v) || [],
        vendors: d.activeVendors || [], // Use activeVendors instead of all vendors
        completedTrips: d.completedTrips || 0,
        status: d.status,
      }));
    },
    staleTime: 15_000,
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const res = await api.get("/vendors");
      return res.data.data || [];
    },
  });

  // Query for driver trip history
  const { data: tripHistory, isLoading: isTripHistoryLoading } = useQuery({
    queryKey: ["driver-trip-history", selectedDriver?.id],
    queryFn: async () => {
      if (!selectedDriver?.id) return null;
      const res = await api.get(`/drivers/${selectedDriver.id}/trips`);
      return res.data.data;
    },
    enabled: !!selectedDriver?.id && isTripHistoryOpen,
  });

  useEffect(() => {
    const socket = getSocket();
    
    // Ensure socket is connected before subscribing
    if (socket.connected) {
      socket.emit('subscribe:drivers');
      console.log('Subscribed to drivers channel');
    } else {
      socket.on('connect', () => {
        socket.emit('subscribe:drivers');
        console.log('Subscribed to drivers channel after connect');
      });
    }
    
    const handleCreated = (driver: any) => {
      queryClient.setQueryData<Driver[] | undefined>(["drivers", { search: searchTerm }], (old) => {
        if (!old) return old;
        const mapped = { 
          id: driver._id, 
          name: driver.name, 
          carNumber: driver.carNumber, 
          carModel: driver.carModel, 
          akamaNumber: driver.akamaNumber, 
          salary: driver.driverSalary, 
          status: driver.status 
        } as Driver;
        return [mapped, ...old];
      });
    };
    const handleUpdated = (driver: any) => {
      console.log('Driver updated via socket:', driver);
      queryClient.setQueryData<Driver[] | undefined>(["drivers", { search: searchTerm }], (old) => old?.map(d => d.id === driver._id ? { 
        ...d, 
        name: driver.name,
        carNumber: driver.carNumber,
        carModel: driver.carModel,
        akamaNumber: driver.akamaNumber,
        salary: driver.driverSalary,
        status: driver.status,
        vendorIds: driver.vendorIds?.map((v: any) => v._id || v) || [],
        vendors: driver.vendorIds || [],
        completedTrips: driver.completedTrips || 0,
        id: driver._id 
      } : d));
    };
    const handleDeleted = ({ id }: any) => {
      queryClient.setQueryData<Driver[] | undefined>(["drivers", { search: searchTerm }], (old) => old?.filter(d => d.id !== id));
    };
    socket.on("driver:created", handleCreated);
    socket.on("driver:updated", handleUpdated);
    socket.on("driver:deleted", handleDeleted);
    // Re-subscribe every 30 seconds to ensure connection stays active
    const reSubscribeInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('subscribe:drivers');
        console.log('Re-subscribed to drivers channel');
      }
    }, 30000);

    return () => {
      clearInterval(reSubscribeInterval);
      socket.emit('unsubscribe:drivers');
      socket.off("driver:created", handleCreated);
      socket.off("driver:updated", handleUpdated);
      socket.off("driver:deleted", handleDeleted);
    };
  }, [queryClient, searchTerm]);

  // Handle highlight parameter from URL
  useEffect(() => {
    const highlightIds = searchParams.get('highlight');
    if (highlightIds && drivers.length > 0) {
      const ids = highlightIds.split(',');
      const highlightedDriver = drivers.find(driver => ids.includes(driver.id));
      if (highlightedDriver) {
        // Scroll to the highlighted driver
        setTimeout(() => {
          if (highlightedDriverRef.current) {
            highlightedDriverRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }
        }, 100);
        
        // Open trip history for the highlighted driver
        setSelectedDriver(highlightedDriver);
        setIsTripHistoryOpen(true);
        
        // Clear the highlight parameter from URL after a delay
        setTimeout(() => {
          setSearchParams(prev => {
            prev.delete('highlight');
            return prev;
          });
        }, 2000); // Keep highlight for 2 seconds
      }
    }
  }, [drivers, searchParams, setSearchParams]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/drivers/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedDriver(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete driver");
    }
  });

  const filteredDrivers = useMemo(() => drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.carNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ), [drivers, searchTerm]);

  const handleAddDriver = () => {
    setFormMode("create");
    setSelectedDriver(null);
    setIsFormOpen(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setFormMode("edit");
    setSelectedDriver(driver);
    setIsFormOpen(true);
  };

  const handleDeleteDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsDeleteDialogOpen(true);
  };

  const handleVendorClick = (vendorId: string) => {
    navigate(`/vendors?highlight=${vendorId}`);
  };

  const handleViewTripHistory = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsTripHistoryOpen(true);
  };

  const handleCloseTripHistory = () => {
    setIsTripHistoryOpen(false);
    setSelectedDriver(null);
  };

  // Check if a driver is highlighted
  const isDriverHighlighted = (driverId: string) => {
    const highlightIds = searchParams.get('highlight');
    if (highlightIds) {
      const ids = highlightIds.split(',');
      return ids.includes(driverId);
    }
    return false;
  };

  const confirmDelete = () => {
    if (selectedDriver) {
      deleteMutation.mutate(selectedDriver.id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Drivers Management</h1>
          <p className="text-muted-foreground">Manage your drivers and their permanent details</p>
        </div>
        <Button 
          className="gradient-primary text-primary-foreground"
          onClick={handleAddDriver}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Driver
        </Button>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Driver's Permanent Details</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredDrivers.map((driver) => (
              <div 
                key={driver.id} 
                ref={isDriverHighlighted(driver.id) ? highlightedDriverRef : null}
                className={`p-4 rounded-lg border transition-colors ${
                  isDriverHighlighted(driver.id) 
                    ? 'border-primary bg-primary/5 shadow-lg' 
                    : 'border-border hover:bg-accent/30'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{driver.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {driver.id}</p>
                      <Badge variant={driver.status === "active" ? "secondary" : "outline"} 
                             className={driver.status === "active" ? "bg-success/10 text-success" : ""}>
                        {driver.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Car Details</p>
                      <p className="font-medium">{driver.carNumber}</p>
                      <p className="text-sm text-muted-foreground">{driver.carModel}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Akama Number</p>
                      <p className="font-medium">{driver.akamaNumber}</p>
                      <p className="text-sm text-success font-semibold">${driver.salary}/month</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Active Vendors</p>
                      {driver.vendors && driver.vendors.length > 0 ? (
                        <div className="space-y-1">
                          {driver.vendors.map((vendor) => (
                            <Button
                              key={vendor.id}
                              variant="link"
                              size="sm"
                              className="p-0 h-auto text-primary hover:text-primary/80 text-xs"
                              onClick={() => handleVendorClick(vendor.id)}
                            >
                              <span className="flex items-center gap-1">
                                {vendor.name}
                                <ExternalLink className="h-3 w-3" />
                              </span>
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No active vendors</p>
                      )}
                      {driver.completedTrips !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          {driver.completedTrips} trips completed
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewTripHistory(driver)}
                      title="View Trip History"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditDriver(driver)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteDriver(driver)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Driver Form Modal */}
      <DriverForm
        driver={selectedDriver}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        mode={formMode}
        vendors={vendors}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Driver"
        description={`Are you sure you want to delete ${selectedDriver?.name}? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />

      {/* Trip History Modal */}
      <Dialog open={isTripHistoryOpen} onOpenChange={setIsTripHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Trip History - {selectedDriver?.name}
            </DialogTitle>
          </DialogHeader>
          
          {isTripHistoryLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading trip history...</div>
            </div>
          ) : tripHistory ? (
            <div className="space-y-6">
              {/* Trip Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Trips</p>
                  <p className="text-2xl font-bold text-primary">{tripHistory.totalTrips}</p>
                </div>
                <div className="text-center p-4 bg-success/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-success">{tripHistory.completedTrips}</p>
                </div>
                <div className="text-center p-4 bg-warning/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Ongoing</p>
                  <p className="text-2xl font-bold text-warning">{tripHistory.ongoingTrips}</p>
                </div>
                <div className="text-center p-4 bg-muted/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-muted-foreground">{tripHistory.pendingTrips}</p>
                </div>
              </div>

              {/* Trip List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Trips</h3>
                {tripHistory.trips.length > 0 ? (
                  <div className="space-y-3">
                    {tripHistory.trips.map((trip: any) => (
                      <Card key={trip.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{trip.startingPlace} → {trip.destination}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(trip.tripDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                ${trip.budget?.toLocaleString()}
                              </div>
                            </div>
                            {trip.vendors && trip.vendors.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Vendors:</p>
                                <div className="flex flex-wrap gap-1">
                                  {trip.vendors.map((vendor: any) => (
                                    <Badge key={vendor.id} variant="outline" className="text-xs">
                                      {vendor.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <Badge 
                            className={
                              trip.status === 'complete' ? 'bg-success/10 text-success' :
                              trip.status === 'ongoing' ? 'bg-warning/10 text-warning' :
                              'bg-muted/10 text-muted-foreground'
                            }
                          >
                            {trip.status}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No trips found for this driver.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Failed to load trip history.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}