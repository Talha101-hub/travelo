import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Wrench, Calendar, DollarSign, Car, Search, Edit, Trash2, Settings } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import MaintenanceForm from "@/components/forms/MaintenanceForm";
import MaintenanceStatusForm from "@/components/forms/MaintenanceStatusForm";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

interface Maintenance {
  id: string;
  carNumber: string;
  carModel: string;
  maintenanceDate: string;
  cost: number;
  description: string;
  status: "completed" | "scheduled" | "in-progress";
  maintenanceType?: string;
  serviceProvider?: string;
}

export default function Maintenance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStatusFormOpen, setIsStatusFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const queryClient = useQueryClient();

  const { data: maintenanceRecords = [], isLoading } = useQuery<Maintenance[]>({
    queryKey: ["maintenance", { search: searchTerm }],
    queryFn: async () => {
      const res = await api.get("/maintenance", { params: { search: searchTerm } });
      return res.data.data.map((m: any) => ({
        id: m._id,
        carNumber: m.carNumber,
        carModel: m.carModel,
        maintenanceDate: m.maintenanceDate,
        cost: m.cost,
        description: m.description,
        status: m.status,
        maintenanceType: m.maintenanceType,
        serviceProvider: m.serviceProvider,
      }));
    },
    staleTime: 15_000,
  });

  useEffect(() => {
    const socket = getSocket();
    const handleCreated = (maintenance: any) => {
      queryClient.setQueryData<Maintenance[] | undefined>(["maintenance", { search: searchTerm }], (old) => {
        if (!old) return old;
        const mapped = { 
          id: maintenance._id, 
          carNumber: maintenance.carNumber, 
          carModel: maintenance.carModel, 
          maintenanceDate: maintenance.maintenanceDate, 
          cost: maintenance.cost, 
          description: maintenance.description, 
          status: maintenance.status,
          maintenanceType: maintenance.maintenanceType,
          serviceProvider: maintenance.serviceProvider,
        } as Maintenance;
        return [mapped, ...old];
      });
    };
    const handleUpdated = (maintenance: any) => {
      queryClient.setQueryData<Maintenance[] | undefined>(["maintenance", { search: searchTerm }], (old) => old?.map(m => m.id === maintenance._id ? { 
        ...m, 
        carNumber: maintenance.carNumber,
        carModel: maintenance.carModel,
        maintenanceDate: maintenance.maintenanceDate,
        cost: maintenance.cost,
        description: maintenance.description,
        status: maintenance.status,
        maintenanceType: maintenance.maintenanceType,
        serviceProvider: maintenance.serviceProvider,
        id: maintenance._id 
      } : m));
    };
    const handleDeleted = ({ id }: any) => {
      queryClient.setQueryData<Maintenance[] | undefined>(["maintenance", { search: searchTerm }], (old) => old?.filter(m => m.id !== id));
    };
    socket.on("maintenance:created", handleCreated);
    socket.on("maintenance:updated", handleUpdated);
    socket.on("maintenance:deleted", handleDeleted);
    return () => {
      socket.off("maintenance:created", handleCreated);
      socket.off("maintenance:updated", handleUpdated);
      socket.off("maintenance:deleted", handleDeleted);
    };
  }, [queryClient, searchTerm]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success/10 text-success">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-warning/10 text-warning">In Progress</Badge>;
      case "scheduled":
        return <Badge className="bg-primary/10 text-primary">Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/maintenance/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast.success("Maintenance record deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedMaintenance(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete maintenance record");
    }
  });

  const handleAddMaintenance = () => {
    setFormMode("create");
    setSelectedMaintenance(null);
    setIsFormOpen(true);
  };

  const handleEditMaintenance = (maintenance: Maintenance) => {
    setFormMode("edit");
    setSelectedMaintenance(maintenance);
    setIsFormOpen(true);
  };

  const handleUpdateStatus = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance);
    setIsStatusFormOpen(true);
  };

  const handleDeleteMaintenance = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedMaintenance) {
      deleteMutation.mutate(selectedMaintenance.id);
    }
  };

  const totalCost = maintenanceRecords.reduce((sum, record) => sum + record.cost, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Car Maintenance</h1>
          <p className="text-muted-foreground">Track and manage vehicle maintenance schedules</p>
        </div>
        <Button 
          className="gradient-primary text-primary-foreground"
          onClick={handleAddMaintenance}
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule Maintenance
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Maintenance Records</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search maintenance records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="shadow-card border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Maintenance Cost</p>
                <p className="text-2xl font-bold text-primary">${totalCost}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-warning bg-gradient-to-r from-warning/5 to-warning/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled This Month</p>
                <p className="text-2xl font-bold text-warning">3</p>
              </div>
              <Calendar className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-success bg-gradient-to-r from-success/5 to-success/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cars Maintained</p>
                <p className="text-2xl font-bold text-success">18</p>
              </div>
              <Car className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Records */}
      <div className="grid gap-6">
        {maintenanceRecords.map((record) => (
          <Card key={record.id} className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center space-x-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  <span>{record.carNumber} - {record.carModel}</span>
                </CardTitle>
                {getStatusBadge(record.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Maintenance Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{new Date(record.maintenanceDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-success">${record.cost}</span>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-3">
                  <h4 className="font-medium text-foreground">Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {record.description}
                  </p>
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditMaintenance(record)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleUpdateStatus(record)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Status
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteMaintenance(record)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Maintenance Form Modal */}
      <MaintenanceForm
        maintenance={selectedMaintenance}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        mode={formMode}
      />

      {/* Maintenance Status Update Modal */}
      <MaintenanceStatusForm
        maintenance={selectedMaintenance}
        isOpen={isStatusFormOpen}
        onClose={() => setIsStatusFormOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Maintenance Record"
        description={`Are you sure you want to delete the maintenance record for ${selectedMaintenance?.carNumber}? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}