import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";

export default function AdminLayout() {
  const [admin, setAdmin] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if admin is already logged in
  const { data: adminResponse, isLoading: queryLoading } = useQuery({
    queryKey: ["/api/admin/me"],
    retry: false,
  });

  useEffect(() => {
    if (!queryLoading) {
      if (adminResponse?.admin) {
        setAdmin(adminResponse.admin);
      }
      setIsLoading(false);
    }
  }, [adminResponse, queryLoading]);

  const handleLogin = (adminUser: any) => {
    setAdmin(adminUser);
  };

  const handleLogout = () => {
    setAdmin(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard admin={admin} onLogout={handleLogout} />;
}