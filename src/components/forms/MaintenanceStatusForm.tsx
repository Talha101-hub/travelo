import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Wrench, Clock, CheckCircle, Play } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

interface MaintenanceStatusFormProps {
  maintenance: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function MaintenanceStatusForm({ maintenance, isOpen, onClose }: MaintenanceStatusFormProps) {
  const [status, setStatus] = useState<string>("scheduled");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (maintenance) {
      setStatus(maintenance.status || "scheduled");
    }
  }, [maintenance]);

  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const res = await api.patch(`/maintenance/${maintenance.id}/status`, {
        status: newStatus
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast.success("Maintenance status updated successfully");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update maintenance status");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    statusMutation.mutate(status);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-4 w-4" />;
      case "in-progress":
        return <Play className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "text-yellow-600";
      case "in-progress":
        return "text-blue-600";
      case "completed":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  if (!isOpen || !maintenance) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Wrench className="h-5 w-5" />
            <span>Update Maintenance Status</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Maintenance Info */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold">{maintenance.carNumber} - {maintenance.carModel}</h3>
              <p className="text-sm text-muted-foreground">
                Date: {new Date(maintenance.maintenanceDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Cost: ${maintenance.cost.toLocaleString()}
              </p>
            </div>

            {/* Current Status */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Current Status</p>
              <p className={`text-lg font-semibold flex items-center space-x-2 ${getStatusColor(maintenance.status)}`}>
                {getStatusIcon(maintenance.status)}
                <span className="capitalize">{maintenance.status.replace('-', ' ')}</span>
              </p>
            </div>

            {/* Status Update Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">New Status *</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Scheduled</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="in-progress">
                      <div className="flex items-center space-x-2">
                        <Play className="h-4 w-4" />
                        <span>In Progress</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="completed">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Completed</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={statusMutation.isPending || status === maintenance.status}
                >
                  {statusMutation.isPending ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
