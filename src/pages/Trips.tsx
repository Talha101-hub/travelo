import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MapPin, Calendar, User, Car, Search, Edit, Trash2, Settings, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import TripForm from "@/components/forms/TripForm";
import TripStatusForm from "@/components/forms/TripStatusForm";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

interface Trip {
  id: string;
  startingPlace: string;
  destination: string;
  budget: number;
  tripDate: string;
  driver: string;
  driverName: string;
  driverId?: string;
  vendors: Array<{ id: string; name: string; contactPerson: string }>;
  carNumber: string;
  status: "pending" | "ongoing" | "complete";
}

export default function Trips() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStatusFormOpen, setIsStatusFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const highlightedTripRef = useRef<HTMLDivElement>(null);
  const { data: trips = [] } = useQuery<Trip[]>({
    queryKey: ["trips", { search: searchTerm }],
    queryFn: async () => {
      const res = await api.get("/trips", { params: { search: searchTerm } });
      return res.data.data.map((t: any) => ({
        id: t._id,
        startingPlace: t.startingPlace,
        destination: t.destination,
        budget: t.budget,
        tripDate: t.tripDate,
        driver: t.driver?.name || "-",
        driverName: t.driver?.name || "-",
        driverId: t.driver?._id,
        vendors: t.vendors || [],
        carNumber: t.carNumber || "-",
        status: t.status,
      }));
    },
    staleTime: 15_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/trips/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Trip deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedTrip(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete trip");
    }
  });

  const handleAddTrip = () => {
    setFormMode("create");
    setSelectedTrip(null);
    setIsFormOpen(true);
  };

  const handleEditTrip = (trip: Trip) => {
    setFormMode("edit");
    setSelectedTrip(trip);
    setIsFormOpen(true);
  };

  const handleUpdateStatus = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsStatusFormOpen(true);
  };

  const handleDeleteTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsDeleteDialogOpen(true);
  };

  const handleDriverClick = (driverId: string) => {
    navigate(`/drivers?highlight=${driverId}`);
  };

  const handleVendorClick = (vendorId: string) => {
    navigate(`/vendors?highlight=${vendorId}`);
  };

  const confirmDelete = () => {
    if (selectedTrip) {
      deleteMutation.mutate(selectedTrip.id);
    }
  };

  useEffect(() => {
    const socket = getSocket();
    const upsert = (trip: any) => {
      const mapped: Trip = {
        id: trip._id,
        startingPlace: trip.startingPlace,
        destination: trip.destination,
        budget: trip.budget,
        tripDate: trip.tripDate,
        driver: trip.driver?.name || "-",
        driverName: trip.driver?.name || "-",
        vendors: trip.vendors || [],
        carNumber: trip.carNumber || "-",
        status: trip.status,
      };
      queryClient.setQueryData<Trip[] | undefined>(["trips"], (old) => {
        if (!old) return old;
        const idx = old.findIndex(t => t.id === mapped.id);
        if (idx === -1) return [mapped, ...old];
        const copy = [...old];
        copy[idx] = mapped;
        return copy;
      });
    };
    const remove = ({ id }: any) => {
      queryClient.setQueryData<Trip[] | undefined>(["trips"], (old) => old?.filter(t => t.id !== id));
    };
    socket.on("trip:created", upsert);
    socket.on("trip:updated", upsert);
    socket.on("trip:deleted", remove);
    return () => {
      socket.off("trip:created", upsert);
      socket.off("trip:updated", upsert);
      socket.off("trip:deleted", remove);
    };
  }, [queryClient]);

  // Handle highlight parameter from URL
  useEffect(() => {
    const highlightIds = searchParams.get('highlight');
    if (highlightIds && trips.length > 0) {
      const ids = highlightIds.split(',');
      const highlightedTrip = trips.find(trip => ids.includes(trip.id));
      if (highlightedTrip) {
        // Scroll to the highlighted trip
        setTimeout(() => {
          if (highlightedTripRef.current) {
            highlightedTripRef.current.scrollIntoView({ 
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
  }, [trips, searchParams, setSearchParams]);

  // Check if a trip is highlighted
  const isTripHighlighted = (tripId: string) => {
    const highlightIds = searchParams.get('highlight');
    if (highlightIds) {
      const ids = highlightIds.split(',');
      return ids.includes(tripId);
    }
    return false;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "complete":
        return <Badge className="bg-success/10 text-success">Complete</Badge>;
      case "ongoing":
        return <Badge className="bg-warning/10 text-warning">Ongoing</Badge>;
      case "pending":
        return <Badge className="bg-muted text-muted-foreground">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Trips Management</h1>
          <p className="text-muted-foreground">Manage and track all your transport trips</p>
        </div>
        <Button 
          className="gradient-primary text-primary-foreground"
          onClick={handleAddTrip}
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule Trip
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trips by route, driver, or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {trips.map((trip) => (
          <Card 
            key={trip.id} 
            ref={isTripHighlighted(trip.id) ? highlightedTripRef : null}
            className={`shadow-card transition-shadow ${
              isTripHighlighted(trip.id) 
                ? 'border-primary bg-primary/5 shadow-lg' 
                : 'hover:shadow-elegant'
            }`}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>{trip.startingPlace} → {trip.destination}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(trip.status)}
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditTrip(trip)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleUpdateStatus(trip)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteTrip(trip)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Trip Date</span>
                  </div>
                  <p className="font-medium">{new Date(trip.tripDate).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground">ID: {trip.id}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Driver & Vendor</span>
                  </div>
                  {trip.driverId ? (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-primary hover:text-primary/80 font-medium"
                      onClick={() => handleDriverClick(trip.driverId!)}
                    >
                      <span className="flex items-center gap-1">
                        {trip.driver}
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    </Button>
                  ) : (
                    <p className="font-medium text-muted-foreground">{trip.driver}</p>
                  )}
                  {trip.vendors && trip.vendors.length > 0 ? (
                    <div className="space-y-1">
                      {trip.vendors.map((vendor) => (
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
                    <p className="text-sm text-muted-foreground">No vendors assigned</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Car className="h-4 w-4" />
                    <span className="text-sm">Vehicle</span>
                  </div>
                  <p className="font-medium">{trip.carNumber}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="text-muted-foreground">
                    <span className="text-sm">Budget</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">${trip.budget}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trip Form Modal */}
      <TripForm
        trip={selectedTrip}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        mode={formMode}
      />

      {/* Trip Status Update Modal */}
      <TripStatusForm
        trip={selectedTrip}
        isOpen={isStatusFormOpen}
        onClose={() => setIsStatusFormOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Trip"
        description={`Are you sure you want to delete the trip from ${selectedTrip?.startingPlace} to ${selectedTrip?.destination}? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}