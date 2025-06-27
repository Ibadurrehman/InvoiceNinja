import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";
import { AdminLayout } from "@/components/admin-layout";
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import Invoices from "@/pages/invoices";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminCustomers from "@/pages/admin/customers";
import AdminBilling from "@/pages/admin/billing";
import AdminUsers from "@/pages/admin/users";
import AdminSettings from "@/pages/admin/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Mobile Billing App Routes */}
      <Route path="/" component={Dashboard} />
      <Route path="/clients" component={Clients} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      
      {/* Admin Dashboard Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/customers" component={AdminCustomers} />
      <Route path="/admin/billing" component={AdminBilling} />
      <Route path="/admin/payments" component={AdminBilling} />
      <Route path="/admin/reports" component={Reports} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/system" component={AdminSettings} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function AppWrapper({ children }: { children: React.ReactNode }) {
  // Check if current path is admin route
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    return <AdminLayout>{children}</AdminLayout>;
  }
  
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="billtracker-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppWrapper>
            <Router />
          </AppWrapper>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
