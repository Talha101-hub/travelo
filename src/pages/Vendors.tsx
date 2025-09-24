import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Phone, Mail, DollarSign, Users, MapPin, ExternalLink, History, Calendar, Car, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import VendorForm from "@/components/forms/VendorForm";
import VendorPaymentForm from "@/components/forms/VendorPaymentForm";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  payments: number;
  paymentAsked: number;
  status: "active" | "pending" | "paid";
  outstandingBalance?: number;
  completedTrips?: number;
  ongoingTrips?: number;
  linkedDrivers?: number;
}

export default function Vendors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTripHistoryOpen, setIsTripHistoryOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const highlightedVendorRef = useRef<HTMLDivElement>(null);

  const { data: vendors = [], isLoading } = useQuery<Vendor[]>({
    queryKey: ["vendors", { search: searchTerm }],
    queryFn: async () => {
      const res = await api.get("/vendors", { params: { search: searchTerm } });
      return res.data.data.map((v: any) => ({
        id: v._id,
        name: v.name,
        email: v.email,
        phone: v.phone,
        payments: v.payments,
        paymentAsked: v.paymentAsked,
        status: v.status,
        outstandingBalance: v.outstandingBalance,
        completedTrips: v.completedTrips || 0,
        ongoingTrips: v.ongoingTrips || 0,
        linkedDrivers: v.linkedDrivers || 0,
      }));
    },
    staleTime: 15_000,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const res = await api.get("/trips");
      return res.data.data.map((trip: any) => ({
        id: trip._id,
        _id: trip._id,
        status: trip.status,
        vendors: trip.vendors || []
      })) || [];
    },
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      const res = await api.get("/drivers");
      return res.data.data.map((driver: any) => ({
        id: driver._id,
        _id: driver._id,
        vendorIds: driver.vendorIds || []
      })) || [];
    },
  });

  // Query for vendor trip history
  const { data: vendorTripHistory, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["vendor-trip-history", selectedVendor?.id],
    queryFn: async () => {
      if (!selectedVendor?.id) return null;
      const res = await api.get(`/vendors/${selectedVendor.id}/trips`);
      return res.data.data;
    },
    enabled: !!selectedVendor?.id && isTripHistoryOpen,
  });

  useEffect(() => {
    const socket = getSocket();
    const handleCreated = (vendor: any) => {
      queryClient.setQueryData<Vendor[] | undefined>(["vendors", { search: searchTerm }], (old) => {
        if (!old) return old;
        const mapped = { 
          id: vendor._id, 
          name: vendor.name, 
          email: vendor.email, 
          phone: vendor.phone, 
          payments: vendor.payments, 
          paymentAsked: vendor.paymentAsked, 
          status: vendor.status,
          outstandingBalance: vendor.outstandingBalance
        } as Vendor;
        return [mapped, ...old];
      });
    };
    const handleUpdated = (vendor: any) => {
      queryClient.setQueryData<Vendor[] | undefined>(["vendors", { search: searchTerm }], (old) => old?.map(v => v.id === vendor._id ? { 
        ...v, 
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        payments: vendor.payments,
        paymentAsked: vendor.paymentAsked,
        status: vendor.status,
        outstandingBalance: vendor.outstandingBalance,
        id: vendor._id 
      } : v));
    };
    const handleDeleted = ({ id }: any) => {
      queryClient.setQueryData<Vendor[] | undefined>(["vendors", { search: searchTerm }], (old) => old?.filter(v => v.id !== id));
    };
    socket.on("vendor:created", handleCreated);
    socket.on("vendor:updated", handleUpdated);
    socket.on("vendor:deleted", handleDeleted);
    return () => {
      socket.off("vendor:created", handleCreated);
      socket.off("vendor:updated", handleUpdated);
      socket.off("vendor:deleted", handleDeleted);
    };
  }, [queryClient, searchTerm]);

  // Handle highlight parameter from URL
  useEffect(() => {
    const highlightIds = searchParams.get('highlight');
    if (highlightIds && vendors.length > 0) {
      const ids = highlightIds.split(',');
      const highlightedVendor = vendors.find(vendor => ids.includes(vendor.id));
      if (highlightedVendor) {
        // Scroll to the highlighted vendor
        setTimeout(() => {
          if (highlightedVendorRef.current) {
            highlightedVendorRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }
        }, 100);
        
        // Clear the highlight parameter from URL after a delay
        setTimeout(() => {
          setSearchParams(prev => {
            prev.delete('highlight');
            return prev;
          });
        }, 2000); // Keep highlight for 2 seconds
      }
    }
  }, [vendors, searchParams, setSearchParams]);

  // Check if a vendor is highlighted
  const isVendorHighlighted = (vendorId: string) => {
    const highlightIds = searchParams.get('highlight');
    if (highlightIds) {
      const ids = highlightIds.split(',');
      return ids.includes(vendorId);
    }
    return false;
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/vendors/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedVendor(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete vendor");
    }
  });

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddVendor = () => {
    setFormMode("create");
    setSelectedVendor(null);
    setIsFormOpen(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setFormMode("edit");
    setSelectedVendor(vendor);
    setIsFormOpen(true);
  };

  const handleUpdatePayment = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsPaymentFormOpen(true);
  };

  const handleDeleteVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsDeleteDialogOpen(true);
  };

  const handleTripClick = (tripId: string) => {
    navigate(`/trips?highlight=${tripId}`);
  };

  const handleDriverClick = (driverId: string) => {
    navigate(`/drivers?highlight=${driverId}`);
  };

  const handleViewTripHistory = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsTripHistoryOpen(true);
  };

  const handleCloseTripHistory = () => {
    setIsTripHistoryOpen(false);
    setSelectedVendor(null);
  };

  const confirmDelete = () => {
    if (selectedVendor) {
      deleteMutation.mutate(selectedVendor.id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-success/10 text-success">Paid</Badge>;
      case "active":
        return <Badge className="bg-primary/10 text-primary">Active</Badge>;
      case "pending":
        return <Badge className="bg-warning/10 text-warning">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Vendors Management</h1>
          <p className="text-muted-foreground">Manage your vendor partnerships and payments</p>
        </div>
        <Button 
          className="gradient-primary text-primary-foreground"
          onClick={handleAddVendor}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Vendor Directory</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {filteredVendors.map((vendor) => (
              <Card 
                key={vendor.id} 
                ref={isVendorHighlighted(vendor.id) ? highlightedVendorRef : null}
                className={`transition-shadow ${
                  isVendorHighlighted(vendor.id) 
                    ? 'border-primary bg-primary/5 shadow-lg' 
                    : 'border-border hover:shadow-card'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-foreground">{vendor.name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {vendor.id}</p>
                      {getStatusBadge(vendor.status)}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditVendor(vendor)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleUpdatePayment(vendor)}
                        className="text-primary hover:text-primary"
                      >
                        <DollarSign className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewTripHistory(vendor)}
                        className="text-blue-600 hover:text-blue-700"
                        title="View Trip History"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteVendor(vendor)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">Contact Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{vendor.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{vendor.phone}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">Payment Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                          <p className="text-xs text-muted-foreground">Payments Made</p>
                          <p className="text-lg font-semibold text-success">${vendor.payments.toLocaleString()}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="text-xs text-muted-foreground">Payment Asked</p>
                          <p className="text-lg font-semibold text-primary">${vendor.paymentAsked.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-muted">
                        <p className="text-xs text-muted-foreground">Outstanding</p>
                        <p className="text-sm font-medium text-foreground">
                          ${(vendor.outstandingBalance || (vendor.paymentAsked - vendor.payments)).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">Statistics</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Completed Trips
                          </span>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-primary hover:text-primary/80"
                            onClick={() => {
                              if (vendor.completedTrips && vendor.completedTrips > 0) {
                                const completedTripIds = trips
                                  .filter((trip: any) => 
                                    trip.vendors?.some((v: any) => v._id === vendor.id || v.id === vendor.id) && 
                                    trip.status === 'complete'
                                  )
                                  .map((trip: any) => trip._id || trip.id);
                                navigate(`/trips?highlight=${completedTripIds.join(',')}`);
                              }
                            }}
                          >
                            <span className="flex items-center gap-1">
                              {vendor.completedTrips || 0}
                              <ExternalLink className="h-3 w-3" />
                            </span>
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Ongoing Trips
                          </span>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-primary hover:text-primary/80"
                            onClick={() => {
                              if (vendor.ongoingTrips && vendor.ongoingTrips > 0) {
                                const ongoingTripIds = trips
                                  .filter((trip: any) => 
                                    trip.vendors?.some((v: any) => v._id === vendor.id || v.id === vendor.id) && 
                                    trip.status === 'ongoing'
                                  )
                                  .map((trip: any) => trip._id || trip.id);
                                navigate(`/trips?highlight=${ongoingTripIds.join(',')}`);
                              }
                            }}
                          >
                            <span className="flex items-center gap-1">
                              {vendor.ongoingTrips || 0}
                              <ExternalLink className="h-3 w-3" />
                            </span>
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Linked Drivers
                          </span>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-primary hover:text-primary/80"
                            onClick={() => {
                              if (vendor.linkedDrivers && vendor.linkedDrivers > 0) {
                                const linkedDriverIds = drivers
                                  .filter((driver: any) => 
                                    driver.vendorIds?.some((vid: any) => vid === vendor.id || vid._id === vendor.id)
                                  )
                                  .map((driver: any) => driver._id || driver.id);
                                navigate(`/drivers?highlight=${linkedDriverIds.join(',')}`);
                              }
                            }}
                          >
                            <span className="flex items-center gap-1">
                              {vendor.linkedDrivers || 0}
                              <ExternalLink className="h-3 w-3" />
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vendor Form Modal */}
      <VendorForm
        vendor={selectedVendor}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        mode={formMode}
      />

      {/* Payment Update Modal */}
      <VendorPaymentForm
        vendor={selectedVendor}
        isOpen={isPaymentFormOpen}
        onClose={() => setIsPaymentFormOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Vendor"
        description={`Are you sure you want to delete ${selectedVendor?.name}? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />

      {/* Vendor Trip History Modal */}
      <Dialog open={isTripHistoryOpen} onOpenChange={setIsTripHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Trip History - {selectedVendor?.name}
            </DialogTitle>
          </DialogHeader>
          
          {isHistoryLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading trip history...</div>
            </div>
          ) : vendorTripHistory ? (
            <div className="space-y-6">
              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">{vendorTripHistory.statistics.totalTrips}</div>
                  <div className="text-sm text-muted-foreground">Total Trips</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-green-600">{vendorTripHistory.statistics.completedTrips}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-yellow-600">{vendorTripHistory.statistics.ongoingTrips}</div>
                  <div className="text-sm text-muted-foreground">Ongoing</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-blue-600">${vendorTripHistory.statistics.totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </div>
              </div>

              {/* Trips by Driver */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Trips by Driver ({vendorTripHistory.statistics.driverCount} drivers)
                </h3>
                <div className="space-y-4">
                  {vendorTripHistory.tripsByDriver.map((driverGroup: any) => (
                    <Card key={driverGroup.driver._id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{driverGroup.driver.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Car: {driverGroup.driver.carNumber} | Akama: {driverGroup.driver.akamaNumber}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {driverGroup.trips.length} trips
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {driverGroup.trips.map((trip: any) => (
                          <div key={trip._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{trip.startingPlace} → {trip.destination}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(trip.tripDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge 
                                className={
                                  trip.status === 'complete' ? 'bg-green-100 text-green-800' :
                                  trip.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }
                              >
                                {trip.status}
                              </Badge>
                              <div className="text-right">
                                <p className="font-semibold">${trip.budget.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Budget</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* All Trips List */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  All Trips ({vendorTripHistory.trips.length})
                </h3>
                <div className="space-y-2">
                  {vendorTripHistory.trips.map((trip: any) => (
                    <div key={trip._id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{trip.startingPlace} → {trip.destination}</p>
                          <p className="text-sm text-muted-foreground">
                            Driver: {trip.driver?.name || 'N/A'} | 
                            Car: {trip.carNumber} | 
                            Date: {new Date(trip.tripDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          className={
                            trip.status === 'complete' ? 'bg-green-100 text-green-800' :
                            trip.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {trip.status}
                        </Badge>
                        <div className="text-right">
                          <p className="font-semibold">${trip.budget.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No trip history available
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}