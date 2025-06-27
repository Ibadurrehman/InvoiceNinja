import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Users,
  FileText,
  BarChart3,
  Settings,
  CreditCard,
  Building,
  PieChart,
  UserCheck,
  Bell,
  Sun,
  Moon,
  Menu,
  LogOut,
  User,
  Shield,
  Activity,
  DollarSign,
  TrendingUp,
  Calendar,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: Home,
      description: "Overview and analytics",
    },
    {
      name: "Customer Management",
      href: "/admin/customers",
      icon: Users,
      description: "Manage customer accounts",
    },
    {
      name: "Billing & Invoices",
      href: "/admin/billing",
      icon: FileText,
      description: "Invoice management",
    },
    {
      name: "Payments",
      href: "/admin/payments",
      icon: CreditCard,
      description: "Payment tracking",
    },
    {
      name: "Reports & Analytics",
      href: "/admin/reports",
      icon: BarChart3,
      description: "Financial reports",
    },
    {
      name: "User Management",
      href: "/admin/users",
      icon: UserCheck,
      description: "Admin users & roles",
    },
    {
      name: "Company Settings",
      href: "/admin/settings",
      icon: Building,
      description: "Company configuration",
    },
    {
      name: "System Settings",
      href: "/admin/system",
      icon: Settings,
      description: "System configuration",
    },
  ];

  const quickStats = [
    {
      name: "Total Revenue",
      value: "₹4,04,865",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: DollarSign,
    },
    {
      name: "Active Customers",
      value: "247",
      change: "+4.2%",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      name: "Pending Invoices",
      value: "23",
      change: "-8.1%",
      changeType: "negative" as const,
      icon: FileText,
    },
    {
      name: "Monthly Growth",
      value: "15.3%",
      change: "+2.4%",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
  ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const Sidebar = () => (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">Admin Dashboard</h1>
            <p className="text-muted-foreground text-xs">BillTracker Pro</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t p-4">
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Quick Stats
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.name} className="rounded-lg bg-muted/50 p-2">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">{stat.value}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stat.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Navigation */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              </Sheet>

              <div className="hidden sm:block">
                <h1 className="text-xl font-semibold text-foreground">
                  {navigation.find((item) => item.href === location)?.name || "Dashboard"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {navigation.find((item) => item.href === location)?.description || "Admin panel overview"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-muted-foreground"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground relative"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full"></span>
              </Button>

              <Separator orientation="vertical" className="h-6" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/admin.png" alt="Admin" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Admin User</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        admin@billtracker.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Activity className="mr-2 h-4 w-4" />
                    <span>Activity Log</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}