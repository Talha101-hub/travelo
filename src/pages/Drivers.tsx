import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import DriverForm from "@/components/forms/DriverForm";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

interface Driver {
  id: string;
  name: string;
  carNumber: string;
  carModel: string;
  akamaNumber: string;
  salary: number;
  status: "active" | "inactive";
}

export default function Drivers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const queryClient = useQueryClient();

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
        status: d.status,
      }));
    },
    staleTime: 15_000,
  });

  useEffect(() => {
    const socket = getSocket();
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
      queryClient.setQueryData<Driver[] | undefined>(["drivers", { search: searchTerm }], (old) => old?.map(d => d.id === driver._id ? { 
        ...d, 
        name: driver.name,
        carNumber: driver.carNumber,
        carModel: driver.carModel,
        akamaNumber: driver.akamaNumber,
        salary: driver.driverSalary,
        status: driver.status,
        id: driver._id 
      } : d));
    };
    const handleDeleted = ({ id }: any) => {
      queryClient.setQueryData<Driver[] | undefined>(["drivers", { search: searchTerm }], (old) => old?.filter(d => d.id !== id));
    };
    socket.on("driver:created", handleCreated);
    socket.on("driver:updated", handleUpdated);
    socket.on("driver:deleted", handleDeleted);
    return () => {
      socket.off("driver:created", handleCreated);
      socket.off("driver:updated", handleUpdated);
      socket.off("driver:deleted", handleDeleted);
    };
  }, [queryClient, searchTerm]);

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
              <div key={driver.id} className="p-4 rounded-lg border border-border hover:bg-accent/30 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
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
                  </div>
                  <div className="flex space-x-2">
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
    </div>
  );
}