import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Phone, Mail, DollarSign } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import VendorForm from "@/components/forms/VendorForm";
import VendorPaymentForm from "@/components/forms/VendorPaymentForm";
import ConfirmDialog from "@/components/ui/confirm-dialog";
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
}

export default function Vendors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const queryClient = useQueryClient();

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
      }));
    },
    staleTime: 15_000,
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
              <Card key={vendor.id} className="border border-border hover:shadow-card transition-shadow">
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
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteVendor(vendor)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  );
}