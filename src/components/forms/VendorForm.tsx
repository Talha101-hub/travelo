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

interface VendorFormData {
  name: string;
  email: string;
  phone: string;
  payments: number;
  paymentAsked: number;
  status: "active" | "pending" | "paid";
  address?: string;
  contactPerson?: string;
}

interface VendorFormProps {
  vendor?: any;
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
}

export default function VendorForm({ vendor, isOpen, onClose, mode }: VendorFormProps) {
  const [formData, setFormData] = useState<VendorFormData>({
    name: "",
    email: "",
    phone: "",
    payments: 0,
    paymentAsked: 0,
    status: "active",
    address: "",
    contactPerson: ""
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (mode === "edit" && vendor) {
      setFormData({
        name: vendor.name || "",
        email: vendor.email || "",
        phone: vendor.phone || "",
        payments: vendor.payments || 0,
        paymentAsked: vendor.paymentAsked || 0,
        status: vendor.status || "active",
        address: vendor.address || "",
        contactPerson: vendor.contactPerson || ""
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        payments: 0,
        paymentAsked: 0,
        status: "active",
        address: "",
        contactPerson: ""
      });
    }
  }, [mode, vendor]);

  const createMutation = useMutation({
    mutationFn: async (data: VendorFormData) => {
      const res = await api.post("/vendors", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor created successfully");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create vendor");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: VendorFormData) => {
      const res = await api.put(`/vendors/${vendor.id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor updated successfully");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update vendor");
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

  const handleChange = (field: keyof VendorFormData, value: string | number) => {
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
            {mode === "create" ? "Add New Vendor" : "Edit Vendor"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Vendor Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Enter vendor name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="vendor@example.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+966501234567"
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payments">Payments Made</Label>
                  <Input
                    id="payments"
                    type="number"
                    value={formData.payments}
                    onChange={(e) => handleChange("payments", parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentAsked">Payment Asked *</Label>
                  <Input
                    id="paymentAsked"
                    type="number"
                    value={formData.paymentAsked}
                    onChange={(e) => handleChange("paymentAsked", parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="Enter vendor address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => handleChange("contactPerson", e.target.value)}
                    placeholder="Enter contact person name"
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
                  : mode === "create" ? "Create Vendor" : "Update Vendor"
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
