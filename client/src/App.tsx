import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/admin-layout";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import Invoices from "@/pages/invoices";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/admin" component={() => <AdminLayout />} />
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route path="/clients" component={Clients} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="billtracker-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  return (
    <Switch>
      {/* Routes that don't need layout */}
      <Route path="/admin" component={() => <AdminLayout />} />
      <Route path="/login" component={Login} />
      
      {/* Routes that need authentication and layout */}
      <Route component={AuthenticatedApp} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location] = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Debug logging for authentication issues
  console.log("Auth state:", { isAuthenticated, user, location });

  // If not authenticated, show login page
  if (!isAuthenticated) {
    // Only show login if we're not already on the login page
    if (location !== "/login") {
      return <Login />;
    }
    return <Login />;
  }

  // Show authenticated app with layout
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/clients" component={Clients} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default App;
