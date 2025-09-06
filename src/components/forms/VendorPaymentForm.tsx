import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, DollarSign } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

interface VendorPaymentFormProps {
  vendor: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function VendorPaymentForm({ vendor, isOpen, onClose }: VendorPaymentFormProps) {
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (vendor) {
      setPaymentAmount(0);
    }
  }, [vendor]);

  const paymentMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await api.patch(`/vendors/${vendor.id}/payment`, {
        paymentAmount: amount
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Payment updated successfully");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update payment");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentAmount <= 0) {
      toast.error("Payment amount must be greater than 0");
      return;
    }

    paymentMutation.mutate(paymentAmount);
  };

  if (!isOpen || !vendor) return null;

  const outstandingBalance = vendor.outstandingBalance || (vendor.paymentAsked - vendor.payments);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Update Payment</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Vendor Info */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold">{vendor.name}</h3>
              <p className="text-sm text-muted-foreground">{vendor.email}</p>
            </div>

            {/* Current Payment Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
                <p className="text-xs text-muted-foreground">Payments Made</p>
                <p className="text-lg font-semibold text-success">${vendor.payments.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-xs text-muted-foreground">Payment Asked</p>
                <p className="text-lg font-semibold text-primary">${vendor.paymentAsked.toLocaleString()}</p>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Outstanding Balance</p>
              <p className="text-lg font-semibold text-foreground">${outstandingBalance.toLocaleString()}</p>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Payment Amount *</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  placeholder="Enter payment amount"
                  min="0.01"
                  step="0.01"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Maximum: ${outstandingBalance.toLocaleString()}
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={paymentMutation.isPending || paymentAmount <= 0}
                >
                  {paymentMutation.isPending ? "Updating..." : "Update Payment"}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
