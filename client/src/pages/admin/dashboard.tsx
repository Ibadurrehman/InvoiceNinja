import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CreditCard,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  BarChart3,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface AdminDashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  totalCustomers: number;
  activeCustomers: number;
  customerGrowth: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  averageInvoiceValue: number;
  collectionRate: number;
  recentTransactions: Array<{
    id: number;
    amount: string;
    paymentDate: string;
    client: { name: string };
    invoiceNumber: string;
    status: string;
  }>;
  topCustomers: Array<{
    id: number;
    name: string;
    email: string;
    totalSpent: number;
    invoiceCount: number;
    lastPayment: string;
  }>;
  monthlyTrend: Array<{
    month: string;
    revenue: number;
    invoices: number;
  }>;
}

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState("30d");

  const { data: stats, isLoading } = useQuery<AdminDashboardStats>({
    queryKey: ["/api/admin/dashboard/stats", timeRange],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats?.totalRevenue || 0),
      change: stats?.revenueGrowth || 0,
      icon: DollarSign,
      description: "This month",
    },
    {
      title: "Active Customers",
      value: stats?.activeCustomers?.toString() || "0",
      change: stats?.customerGrowth || 0,
      icon: Users,
      description: "Total customers: " + (stats?.totalCustomers || 0),
    },
    {
      title: "Pending Invoices",
      value: stats?.pendingInvoices?.toString() || "0",
      change: -((stats?.pendingInvoices || 0) / (stats?.totalInvoices || 1)) * 100,
      icon: FileText,
      description: `${stats?.paidInvoices || 0} paid, ${stats?.overdueInvoices || 0} overdue`,
    },
    {
      title: "Collection Rate",
      value: `${stats?.collectionRate || 0}%`,
      change: 2.1,
      icon: TrendingUp,
      description: "Average invoice: " + formatCurrency(stats?.averageInvoiceValue || 0),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your business performance and key metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          const isPositive = kpi.change > 0;
          const gradients = [
            "bg-gradient-to-br from-blue-500 to-blue-600",
            "bg-gradient-to-br from-emerald-500 to-emerald-600", 
            "bg-gradient-to-br from-amber-500 to-orange-500",
            "bg-gradient-to-br from-purple-500 to-purple-600"
          ];
          return (
            <Card key={kpi.title} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <div className={`absolute inset-0 ${gradients[index]} opacity-5`}></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {kpi.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${gradients[index]} shadow-lg`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{kpi.value}</div>
                  <div className="flex items-center text-xs">
                    {isPositive ? (
                      <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                    )}
                    <span className={`font-medium ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
                      {Math.abs(kpi.change).toFixed(1)}%
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 ml-1">{kpi.description}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="customers">Top Customers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Activity */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-b border-emerald-200/20">
                <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg mr-3">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">Latest transactions and invoice updates</CardDescription>
              </CardHeader>
              <CardContent className="bg-gradient-to-b from-emerald-50/20 to-transparent dark:from-emerald-900/10">
                <div className="space-y-4">
                  {stats?.recentTransactions?.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                          Payment received from {transaction.client.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.invoiceNumber} • {formatDate(transaction.paymentDate)}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        {transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Invoice Status */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-b border-blue-200/20">
                <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  Invoice Status
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">Current invoice distribution</CardDescription>
              </CardHeader>
              <CardContent className="bg-gradient-to-b from-blue-50/20 to-transparent dark:from-blue-900/10">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Paid
                      </span>
                      <span>{stats?.paidInvoices || 0}</span>
                    </div>
                    <Progress 
                      value={((stats?.paidInvoices || 0) / (stats?.totalInvoices || 1)) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                        Pending
                      </span>
                      <span>{stats?.pendingInvoices || 0}</span>
                    </div>
                    <Progress 
                      value={((stats?.pendingInvoices || 0) / (stats?.totalInvoices || 1)) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                        Overdue
                      </span>
                      <span>{stats?.overdueInvoices || 0}</span>
                    </div>
                    <Progress 
                      value={((stats?.overdueInvoices || 0) / (stats?.totalInvoices || 1)) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-b border-purple-200/20">
              <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mr-3">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                Recent Transactions
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">Latest payment transactions across all customers</CardDescription>
            </CardHeader>
            <CardContent className="bg-gradient-to-b from-purple-50/20 to-transparent dark:from-purple-900/10">
              <div className="space-y-4">
                {stats?.recentTransactions?.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {transaction.client.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{transaction.client.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.invoiceNumber} • {formatDate(transaction.paymentDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={transaction.status === 'paid' ? 'default' : 'secondary'}>
                        {transaction.status}
                      </Badge>
                      <span className="font-medium">{transaction.amount}</span>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-green-600/10 border-b border-emerald-200/20">
              <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg mr-3">
                  <Users className="h-4 w-4 text-white" />
                </div>
                Top Customers
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">Your highest-value customers by total spending</CardDescription>
            </CardHeader>
            <CardContent className="bg-gradient-to-b from-emerald-50/20 to-transparent dark:from-emerald-900/10">
              <div className="space-y-4">
                {stats?.topCustomers?.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(customer.totalSpent)}</p>
                      <p className="text-sm text-muted-foreground">
                        {customer.invoiceCount} invoices
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 border-b border-indigo-200/20">
                <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg mr-3">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  Revenue Trend
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">Monthly revenue over time</CardDescription>
              </CardHeader>
              <CardContent className="bg-gradient-to-b from-indigo-50/20 to-transparent dark:from-indigo-900/10">
                <div className="h-64 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-200/30 dark:border-indigo-700/30 flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center">
                    <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full mx-auto mb-4 shadow-lg">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">Chart visualization area</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                      Advanced analytics dashboard ready for chart integration
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-b border-orange-200/20">
                <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg mr-3">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  Performance Metrics
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">Key business indicators</CardDescription>
              </CardHeader>
              <CardContent className="bg-gradient-to-b from-orange-50/20 to-transparent dark:from-orange-900/10">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Payment Time</span>
                    <span className="font-medium">18 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Customer Retention</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Invoice-to-Cash Cycle</span>
                    <span className="font-medium">25 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Bad Debt Rate</span>
                    <span className="font-medium text-red-600">2.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}