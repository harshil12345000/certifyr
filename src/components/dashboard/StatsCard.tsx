import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div className={cn("glass-card p-6 flex flex-col", className)}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-auto">
        <div className="text-2xl font-semibold">{value}</div>
        {(description || trend) && (
          <div className="mt-1 flex items-center">
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium mr-2",
                  trend.positive ? "text-green-600" : "text-red-600",
                )}
              >
                {trend.value}
              </span>
            )}
            {description && (
              <span className="text-xs text-muted-foreground">
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
