import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "./theme-provider";
import { 
  Home, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Moon, 
  Sun, 
  Bell,
  File
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Invoices", href: "/invoices", icon: FileText },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen shadow-xl relative overflow-hidden">
      {/* Top Bar */}
      <header className="bg-primary text-primary-foreground p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center">
            <File className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">BillTracker Pro</h1>
            <p className="text-primary-foreground/70 text-xs">Mobile Billing</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 min-h-[calc(100vh-80px)]">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-background border-t border-border">
        <div className="flex justify-around py-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <button
                  className={cn(
                    "flex flex-col items-center p-2 text-xs font-medium transition-colors",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  {item.name}
                </button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
