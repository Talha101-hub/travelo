import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "destructive";
}

export default function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  variant = "default" 
}: MetricCardProps) {
  const variantStyles = {
    default: "border-l-primary bg-gradient-to-r from-primary/5 to-primary/10",
    success: "border-l-success bg-gradient-to-r from-success/5 to-success/10",
    warning: "border-l-warning bg-gradient-to-r from-warning/5 to-warning/10",
    destructive: "border-l-destructive bg-gradient-to-r from-destructive/5 to-destructive/10"
  };

  const iconColors = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive"
  };

  return (
    <Card className={cn(
      "border-l-4 shadow-card hover:shadow-elegant transition-shadow duration-200",
      variantStyles[variant]
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {change && (
              <p className="text-sm text-muted-foreground">{change}</p>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-lg bg-background/50",
            iconColors[variant]
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}