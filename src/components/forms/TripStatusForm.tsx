import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Clock, CheckCircle, Play } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

interface TripStatusFormProps {
  trip: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function TripStatusForm({ trip, isOpen, onClose }: TripStatusFormProps) {
  const [status, setStatus] = useState<string>("pending");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (trip) {
      setStatus(trip.status || "pending");
    }
  }, [trip]);

  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const res = await api.patch(`/trips/${trip.id}/status`, {
        status: newStatus
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Trip status updated successfully");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update trip status");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    statusMutation.mutate(status);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "ongoing":
        return <Play className="h-4 w-4" />;
      case "complete":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600";
      case "ongoing":
        return "text-blue-600";
      case "complete":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  if (!isOpen || !trip) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            {getStatusIcon(status)}
            <span>Update Trip Status</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Trip Info */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold">{trip.startingPlace} → {trip.destination}</h3>
              <p className="text-sm text-muted-foreground">
                Driver: {trip.driverName} | Car: {trip.carNumber}
              </p>
              <p className="text-sm text-muted-foreground">
                Date: {new Date(trip.tripDate).toLocaleDateString()}
              </p>
            </div>

            {/* Current Status */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Current Status</p>
              <p className={`text-lg font-semibold flex items-center space-x-2 ${getStatusColor(trip.status)}`}>
                {getStatusIcon(trip.status)}
                <span className="capitalize">{trip.status}</span>
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
                    <SelectItem value="pending">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Pending</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ongoing">
                      <div className="flex items-center space-x-2">
                        <Play className="h-4 w-4" />
                        <span>Ongoing</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="complete">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Complete</span>
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
                  disabled={statusMutation.isPending || status === trip.status}
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
