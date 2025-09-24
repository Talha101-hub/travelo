import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Calendar, MapPin, DollarSign } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

interface TripFormData {
  startingPlace: string;
  destination: string;
  budget: number;
  tripDate: string;
  driver: string;
  vendors: string[];
  carNumber: string;
  status: "pending" | "ongoing" | "complete";
}

interface TripFormProps {
  trip?: any;
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
}

export default function TripForm({ trip, isOpen, onClose, mode }: TripFormProps) {
  const [formData, setFormData] = useState<TripFormData>({
    startingPlace: "",
    destination: "",
    budget: 0,
    tripDate: "",
    driver: "",
    vendors: [],
    carNumber: "",
    status: "pending"
  });

  const queryClient = useQueryClient();

  // Fetch drivers and vendors for dropdowns
  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      const res = await api.get("/drivers");
      return res.data.data;
    }
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const res = await api.get("/vendors");
      return res.data.data;
    }
  });

  useEffect(() => {
    if (mode === "edit" && trip) {
      setFormData({
        startingPlace: trip.startingPlace || "",
        destination: trip.destination || "",
        budget: trip.budget || 0,
        tripDate: trip.tripDate ? new Date(trip.tripDate).toISOString().split('T')[0] : "",
        driver: trip.driver?._id || trip.driver || "",
        vendors: trip.vendors?.map((v: any) => v._id || v) || [],
        carNumber: trip.carNumber || "",
        status: trip.status || "pending"
      });
    } else {
      setFormData({
        startingPlace: "",
        destination: "",
        budget: 0,
        tripDate: "",
        driver: "",
        vendors: [],
        carNumber: "",
        status: "pending"
      });
    }
  }, [mode, trip]);

  // Auto-fill car number when driver is selected
  const handleDriverChange = (driverId: string) => {
    setFormData(prev => ({ ...prev, driver: driverId }));
    
    // Find driver and auto-fill car number
    const selectedDriver = drivers.find((d: any) => d._id === driverId || d.id === driverId);
    if (selectedDriver) {
      setFormData(prev => ({ 
        ...prev, 
        carNumber: selectedDriver.carNumber || ""
      }));
    }
  };

  // Handle vendor selection
  const handleVendorToggle = (vendorId: string) => {
    setFormData(prev => ({
      ...prev,
      vendors: prev.vendors.includes(vendorId)
        ? prev.vendors.filter(id => id !== vendorId)
        : [...prev.vendors, vendorId]
    }));
  };

  const createMutation = useMutation({
    mutationFn: async (data: TripFormData) => {
      const res = await api.post("/trips", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Trip created successfully");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create trip");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: TripFormData) => {
      const res = await api.put(`/trips/${trip.id}`, data);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      // If trip is updated to complete status, also refresh drivers data
      if (variables.status === "complete") {
        queryClient.invalidateQueries({ queryKey: ["drivers"] });
      }
      toast.success("Trip updated successfully");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update trip");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "create") {
      createMutation.mutate(formData);
    } else {
      updateMutation.mutate(formData);
    }
  };

  const handleChange = (field: keyof TripFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>{mode === "create" ? "Add New Trip" : "Edit Trip"}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trip Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Trip Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startingPlace">Starting Place *</Label>
                  <Input
                    id="startingPlace"
                    value={formData.startingPlace}
                    onChange={(e) => handleChange("startingPlace", e.target.value)}
                    placeholder="Makkah"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination *</Label>
                  <Input
                    id="destination"
                    value={formData.destination}
                    onChange={(e) => handleChange("destination", e.target.value)}
                    placeholder="Madinah"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (SAR) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleChange("budget", parseFloat(e.target.value) || 0)}
                    placeholder="500"
                    min="0"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tripDate">Trip Date *</Label>
                  <Input
                    id="tripDate"
                    type="date"
                    value={formData.tripDate}
                    onChange={(e) => handleChange("tripDate", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Assignment Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Assignment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driver">Driver *</Label>
                  <Select value={formData.driver} onValueChange={handleDriverChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver: any) => (
                        <SelectItem key={driver._id} value={driver._id}>
                          {driver.name} - {driver.carNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Vendors *</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                    {vendors.map((vendor: any) => (
                      <div key={vendor._id || vendor.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`trip-vendor-${vendor._id || vendor.id}`}
                          checked={formData.vendors.includes(vendor._id || vendor.id)}
                          onChange={() => handleVendorToggle(vendor._id || vendor.id)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={`trip-vendor-${vendor._id || vendor.id}`} className="text-sm">
                          {vendor.name} - {vendor.contactPerson}
                        </label>
                      </div>
                    ))}
                  </div>
                  {formData.vendors.length === 0 && (
                    <p className="text-sm text-red-500">Please select at least one vendor</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="carNumber">Car Number *</Label>
                  <Input
                    id="carNumber"
                    value={formData.carNumber}
                    onChange={(e) => handleChange("carNumber", e.target.value.toUpperCase())}
                    placeholder="ABC-123"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending 
                  ? "Saving..." 
                  : mode === "create" ? "Create Trip" : "Update Trip"
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
