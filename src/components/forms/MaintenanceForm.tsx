import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { X, Wrench, Calendar, DollarSign } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

interface MaintenanceFormData {
  carNumber: string;
  carModel: string;
  maintenanceDate: string;
  cost: number;
  description: string;
  status: "completed" | "scheduled" | "in-progress";
}

interface MaintenanceFormProps {
  maintenance?: any;
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
}

export default function MaintenanceForm({ maintenance, isOpen, onClose, mode }: MaintenanceFormProps) {
  const [formData, setFormData] = useState<MaintenanceFormData>({
    carNumber: "",
    carModel: "",
    maintenanceDate: "",
    cost: 0,
    description: "",
    status: "scheduled"
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (mode === "edit" && maintenance) {
      setFormData({
        carNumber: maintenance.carNumber || "",
        carModel: maintenance.carModel || "",
        maintenanceDate: maintenance.maintenanceDate ? new Date(maintenance.maintenanceDate).toISOString().split('T')[0] : "",
        cost: maintenance.cost || 0,
        description: maintenance.description || "",
        status: maintenance.status || "scheduled"
      });
    } else {
      setFormData({
        carNumber: "",
        carModel: "",
        maintenanceDate: "",
        cost: 0,
        description: "",
        status: "scheduled"
      });
    }
  }, [mode, maintenance]);

  const createMutation = useMutation({
    mutationFn: async (data: MaintenanceFormData) => {
      const res = await api.post("/maintenance", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast.success("Maintenance record created successfully");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create maintenance record");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: MaintenanceFormData) => {
      const res = await api.put(`/maintenance/${maintenance.id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast.success("Maintenance record updated successfully");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update maintenance record");
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

  const handleChange = (field: keyof MaintenanceFormData, value: string | number) => {
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
            <Wrench className="h-5 w-5" />
            <span>{mode === "create" ? "Add Maintenance Record" : "Edit Maintenance Record"}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vehicle Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="carModel">Car Model *</Label>
                  <Input
                    id="carModel"
                    value={formData.carModel}
                    onChange={(e) => handleChange("carModel", e.target.value)}
                    placeholder="Toyota Hiace"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Maintenance Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Maintenance Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maintenanceDate">Maintenance Date *</Label>
                  <Input
                    id="maintenanceDate"
                    type="date"
                    value={formData.maintenanceDate}
                    onChange={(e) => handleChange("maintenanceDate", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost (SAR) *</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={formData.cost}
                    onChange={(e) => handleChange("cost", parseFloat(e.target.value) || 0)}
                    placeholder="500"
                    min="0"
                    step="0.01"
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
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Description</h3>
              
              <div className="space-y-2">
                <Label htmlFor="description">Maintenance Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe the maintenance work performed or scheduled..."
                  rows={4}
                  required
                />
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
                  : mode === "create" ? "Create Record" : "Update Record"
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
