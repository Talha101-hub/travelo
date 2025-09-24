import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, Save, X } from "lucide-react";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";

interface DriverTempDetails {
  id: string;
  driverId: string;
  driverName: string;
  carNumber: string;
  driverMeal: number;
  roomRent: number;
  furtherExpense: number;
  totalExpense: number;
  month: string;
  year: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export default function DriverTempDetails() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<DriverTempDetails | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const queryClient = useQueryClient();

  const { data: tempDetails = [], isLoading } = useQuery<DriverTempDetails[]>({
    queryKey: ["driver-temp-details", { search: searchTerm }],
    queryFn: async () => {
      const res = await api.get("/driver-temp-details", { params: { search: searchTerm } });
      return res.data.data || [];
    },
    staleTime: 15_000,
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      const res = await api.get("/drivers");
      return res.data.data || [];
    },
  });

  // Socket.io for real-time updates
  useState(() => {
    const socket = getSocket();
    
    const handleTempDetailsUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["driver-temp-details"] });
    };

    socket.on("tempDetailsUpdated", handleTempDetailsUpdate);
    socket.on("tempDetailsCreated", handleTempDetailsUpdate);
    socket.on("tempDetailsDeleted", handleTempDetailsUpdate);

    return () => {
      socket.off("tempDetailsUpdated", handleTempDetailsUpdate);
      socket.off("tempDetailsCreated", handleTempDetailsUpdate);
      socket.off("tempDetailsDeleted", handleTempDetailsUpdate);
    };
  });

  const filteredDetails = tempDetails.filter(detail =>
    detail.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    detail.carNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    detail.month.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedDetail(null);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleEdit = (detail: DriverTempDetails) => {
    setSelectedDetail(detail);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleDelete = (detail: DriverTempDetails) => {
    setSelectedDetail(detail);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDetail) return;
    
    try {
      await api.delete(`/driver-temp-details/${selectedDetail.id}`);
      queryClient.invalidateQueries({ queryKey: ["driver-temp-details"] });
      setIsDeleteDialogOpen(false);
      setSelectedDetail(null);
    } catch (error) {
      console.error("Error deleting temp details:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading driver temporary details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Driver Temporary Details</h1>
          <p className="text-muted-foreground">Manage driver temporary expenses and allowances</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Temp Details</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by driver name, car number, or month..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredDetails.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No temporary details found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm ? "Try adjusting your search terms" : "Add your first temporary details"}
                </p>
              </div>
            ) : (
              filteredDetails.map((detail) => (
                <div key={detail.id} className="p-4 rounded-lg border border-border hover:bg-accent/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">{detail.driverName}</p>
                        <p className="text-sm text-muted-foreground">Car: {detail.carNumber}</p>
                        <Badge className={getStatusColor(detail.status)}>
                          {detail.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Period</p>
                        <p className="font-medium">{detail.month} {detail.year}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Expenses</p>
                        <p className="text-sm">Meal: ${detail.driverMeal}</p>
                        <p className="text-sm">Room: ${detail.roomRent}</p>
                        <p className="text-sm">Other: ${detail.furtherExpense}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-semibold text-lg text-primary">${detail.totalExpense}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(detail)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(detail)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Add Temporary Details" : "Edit Temporary Details"}
            </DialogTitle>
          </DialogHeader>
          <DriverTempDetailsForm
            detail={selectedDetail}
            drivers={drivers}
            mode={formMode}
            onClose={() => setIsFormOpen(false)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["driver-temp-details"] });
              setIsFormOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Temporary Details</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete the temporary details for <strong>{selectedDetail?.driverName}</strong>?</p>
            <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Form Component
interface DriverTempDetailsFormProps {
  detail: DriverTempDetails | null;
  drivers: any[];
  mode: "create" | "edit";
  onClose: () => void;
  onSuccess: () => void;
}

function DriverTempDetailsForm({ detail, drivers, mode, onClose, onSuccess }: DriverTempDetailsFormProps) {
  const [formData, setFormData] = useState({
    driverId: detail?.driverId || "",
    driverMeal: detail?.driverMeal || 0,
    roomRent: detail?.roomRent || 0,
    furtherExpense: detail?.furtherExpense || 0,
    month: detail?.month || "",
    year: detail?.year || new Date().getFullYear(),
    status: detail?.status || "pending"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const totalExpense = formData.driverMeal + formData.roomRent + formData.furtherExpense;
      const payload = { ...formData, totalExpense };

      if (mode === "create") {
        await api.post("/driver-temp-details", payload);
      } else {
        await api.put(`/driver-temp-details/${detail?.id}`, payload);
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving temp details:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDriver = drivers.find(d => d.id === formData.driverId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="driverId">Driver *</Label>
          <select
            id="driverId"
            value={formData.driverId}
            onChange={(e) => handleChange("driverId", e.target.value)}
            className="w-full p-2 border border-input rounded-md"
            required
          >
            <option value="">Select a driver</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name} - {driver.carNumber}
              </option>
            ))}
          </select>
          {selectedDriver && (
            <p className="text-sm text-muted-foreground">
              Selected: {selectedDriver.name} ({selectedDriver.carNumber})
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="month">Month *</Label>
          <select
            id="month"
            value={formData.month}
            onChange={(e) => handleChange("month", e.target.value)}
            className="w-full p-2 border border-input rounded-md"
            required
          >
            <option value="">Select month</option>
            {[
              "January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"
            ].map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year *</Label>
          <Input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => handleChange("year", parseInt(e.target.value))}
            min="2020"
            max="2030"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="w-full p-2 border border-input rounded-md"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="driverMeal">Driver Meal ($)</Label>
          <Input
            id="driverMeal"
            type="number"
            value={formData.driverMeal}
            onChange={(e) => handleChange("driverMeal", parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="roomRent">Room Rent ($)</Label>
          <Input
            id="roomRent"
            type="number"
            value={formData.roomRent}
            onChange={(e) => handleChange("roomRent", parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="furtherExpense">Further Expense ($)</Label>
          <Input
            id="furtherExpense"
            type="number"
            value={formData.furtherExpense}
            onChange={(e) => handleChange("furtherExpense", parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Expense:</span>
          <span className="text-lg font-bold text-primary">
            ${(formData.driverMeal + formData.roomRent + formData.furtherExpense).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Update"}
        </Button>
      </div>
    </form>
  );
}
