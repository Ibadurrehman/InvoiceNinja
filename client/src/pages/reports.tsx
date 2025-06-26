import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type TimePeriod = "thisMonth" | "lastMonth" | "thisYear";

interface DashboardStats {
  totalIncome: number;
}

export default function Reports() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("thisMonth");

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const timePeriods = [
    { key: "thisMonth" as TimePeriod, label: "This Month" },
    { key: "lastMonth" as TimePeriod, label: "Last Month" },
    { key: "thisYear" as TimePeriod, label: "This Year" },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Reports</h2>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {/* Time Period Selector */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {timePeriods.map((period) => (
          <button
            key={period.key}
            onClick={() => setTimePeriod(period.key)}
            className={cn(
              "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors",
              timePeriod === period.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(stats?.totalIncome || 0)}
            </p>
            <p className="text-green-500 text-xs">+18% vs last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground text-sm">Invoices Sent</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">24</p>
            <p className="text-green-500 text-xs">+3 vs last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Monthly Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">December 2024</span>
              <span className="font-semibold">{formatCurrency(12450)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">November 2024</span>
              <span className="font-semibold">{formatCurrency(8750)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">October 2024</span>
              <span className="font-semibold">{formatCurrency(11230)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Placeholder */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Revenue Trend</h3>
          <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Chart will render here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
