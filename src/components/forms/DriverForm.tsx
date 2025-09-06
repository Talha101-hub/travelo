import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

interface DriverFormData {
  name: string;
  carNumber: string;
  carModel: string;
  akamaNumber: string;
  driverSalary: number;
  driverMeal: number;
  roomRent: number;
  furtherExpense: number;
  status: "active" | "inactive";
}

interface DriverFormProps {
  driver?: any;
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
}

export default function DriverForm({ driver, isOpen, onClose, mode }: DriverFormProps) {
  const [formData, setFormData] = useState<DriverFormData>({
    name: "",
    carNumber: "",
    carModel: "",
    akamaNumber: "",
    driverSalary: 0,
    driverMeal: 0,
    roomRent: 0,
    furtherExpense: 0,
    status: "active"
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (mode === "edit" && driver) {
      setFormData({
        name: driver.name || "",
        carNumber: driver.carNumber || "",
        carModel: driver.carModel || "",
        akamaNumber: driver.akamaNumber || "",
        driverSalary: driver.salary || 0,
        driverMeal: driver.driverMeal || 0,
        roomRent: driver.roomRent || 0,
        furtherExpense: driver.furtherExpense || 0,
        status: driver.status || "active"
      });
    } else {
      setFormData({
        name: "",
        carNumber: "",
        carModel: "",
        akamaNumber: "",
        driverSalary: 0,
        roomRent: 0,
        furtherExpense: 0,
        status: "active"
      });
    }
  }, [mode, driver]);

  const createMutation = useMutation({
    mutationFn: async (data: DriverFormData) => {
      const res = await api.post("/drivers", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver created successfully");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create driver");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: DriverFormData) => {
      const res = await api.put(`/drivers/${driver.id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver updated successfully");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update driver");
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

  const handleChange = (field: keyof DriverFormData, value: string | number) => {
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
          <CardTitle>
            {mode === "create" ? "Add New Driver" : "Edit Driver"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Permanent Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Permanent Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Driver Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Enter driver name"
                    required
                  />
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
                  <Label htmlFor="carModel">Car Model *</Label>
                  <Input
                    id="carModel"
                    value={formData.carModel}
                    onChange={(e) => handleChange("carModel", e.target.value)}
                    placeholder="Toyota Hiace"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="akamaNumber">Akama Number *</Label>
                  <Input
                    id="akamaNumber"
                    value={formData.akamaNumber}
                    onChange={(e) => handleChange("akamaNumber", e.target.value)}
                    placeholder="1234567890"
                    maxLength={10}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="driverSalary">Monthly Salary *</Label>
                  <Input
                    id="driverSalary"
                    type="number"
                    value={formData.driverSalary}
                    onChange={(e) => handleChange("driverSalary", parseFloat(e.target.value) || 0)}
                    placeholder="3000"
                    min="0"
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Temporary Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Temporary Expenses</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driverMeal">Meal Expenses</Label>
                  <Input
                    id="driverMeal"
                    type="number"
                    value={formData.driverMeal}
                    onChange={(e) => handleChange("driverMeal", parseFloat(e.target.value) || 0)}
                    placeholder="200"
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="roomRent">Room Rent</Label>
                  <Input
                    id="roomRent"
                    type="number"
                    value={formData.roomRent}
                    onChange={(e) => handleChange("roomRent", parseFloat(e.target.value) || 0)}
                    placeholder="500"
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="furtherExpense">Further Expenses</Label>
                  <Input
                    id="furtherExpense"
                    type="number"
                    value={formData.furtherExpense}
                    onChange={(e) => handleChange("furtherExpense", parseFloat(e.target.value) || 0)}
                    placeholder="100"
                    min="0"
                  />
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
                  : mode === "create" ? "Create Driver" : "Update Driver"
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
