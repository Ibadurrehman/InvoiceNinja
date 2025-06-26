import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreateInvoiceModal } from "@/components/create-invoice-modal";
import { TrendingUp, Clock, Plus, UserPlus, BarChart3 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DashboardStats {
  totalIncome: number;
  dueAmount: number;
  recentTransactions: Array<{
    id: number;
    amount: string;
    paymentDate: string;
    client: {
      name: string;
    };
    invoiceNumber: string;
  }>;
}

export default function Dashboard() {
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted rounded-xl p-4 animate-pulse h-24" />
          <div className="bg-muted rounded-xl p-4 animate-pulse h-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-xs uppercase tracking-wide">Total Income</p>
                <p className="text-xl font-bold">
                  {formatCurrency(stats?.totalIncome || 0)}
                </p>
                <p className="text-emerald-200 text-xs">+12% this month</p>
              </div>
              <TrendingUp className="h-6 w-6 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs uppercase tracking-wide">Due Amount</p>
                <p className="text-xl font-bold">
                  {formatCurrency(stats?.dueAmount || 0)}
                </p>
                <p className="text-orange-200 text-xs">5 invoices</p>
              </div>
              <Clock className="h-6 w-6 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setShowCreateInvoice(true)}
            className="h-auto p-4 flex flex-col items-center space-y-2"
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm font-medium">New Invoice</span>
          </Button>
          <Button
            variant="secondary"
            className="h-auto p-4 flex flex-col items-center space-y-2"
          >
            <UserPlus className="h-6 w-6" />
            <span className="text-sm font-medium">Add Client</span>
          </Button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>

        <div className="space-y-3">
          {stats?.recentTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-muted-foreground">No transactions yet</p>
              </CardContent>
            </Card>
          ) : (
            stats?.recentTransactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.client.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {transaction.invoiceNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        +{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatDate(transaction.paymentDate)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Monthly Overview Chart Placeholder */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Monthly Overview</h2>
        <Card>
          <CardContent className="p-4">
            <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Chart will render here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateInvoiceModal
        open={showCreateInvoice}
        onOpenChange={setShowCreateInvoice}
      />
    </div>
  );
}
