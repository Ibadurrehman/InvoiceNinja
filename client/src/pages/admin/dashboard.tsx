import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Building, Users, Activity, LogOut, Edit, Trash2, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface AdminDashboardProps {
  admin: any;
  onLogout: () => void;
}

interface Company {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  userCount: number;
}

export default function AdminDashboard({ admin, onLogout }: AdminDashboardProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [newCompany, setNewCompany] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    adminFirstName: "",
    adminLastName: "",
    adminPassword: "",
  });
  const [editCompanyData, setEditCompanyData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch companies
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["/api/admin/companies"],
  });

  // Fetch stats
  const { data: stats = {} } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (companyData: any) => {
      const response = await apiRequest("POST", "/api/admin/companies", companyData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setIsCreateModalOpen(false);
      setNewCompany({
        name: "",
        email: "",
        phone: "",
        address: "",
        adminFirstName: "",
        adminLastName: "",
        adminPassword: "",
      });
      toast({
        title: "Success",
        description: "Company created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create company",
        variant: "destructive",
      });
    },
  });

  // Edit company mutation
  const editCompanyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof editCompanyData }) => {
      const response = await apiRequest("PUT", `/api/admin/companies/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies"] });
      setIsEditModalOpen(false);
      setEditingCompany(null);
      toast({
        title: "Success",
        description: "Company updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update company",
        variant: "destructive",
      });
    },
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/companies/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete company",
        variant: "destructive",
      });
    },
  });

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    createCompanyMutation.mutate(newCompany);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setEditCompanyData({
      name: company.name,
      email: company.email,
      phone: company.phone || "",
      address: company.address || "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCompany) {
      editCompanyMutation.mutate({ id: editingCompany.id, data: editCompanyData });
    }
  };

  const handleDeleteCompany = (id: number) => {
    deleteCompanyMutation.mutate(id);
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/admin/logout", {});
      onLogout();
    } catch (error) {
      console.error("Logout error:", error);
      onLogout(); // Force logout even if API call fails
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, Admin
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="space-y-4 mb-8">
          {/* First Row - Company Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Companies</CardTitle>
                <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {Array.isArray(companies) ? companies.length : 0}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  All registered companies
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Active Companies</CardTitle>
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {Array.isArray(companies) ? companies.filter((c: Company) => c.isActive).length : 0}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Currently active
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Second Row - User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Users</CardTitle>
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {Array.isArray(companies) ? companies.reduce((sum: number, c: Company) => sum + (c.userCount || 0), 0) : 0}
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  Across all companies
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Active Users</CardTitle>
                <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {Array.isArray(companies) ? companies.reduce((sum: number, c: Company) => sum + (c.userCount || 0), 0) : 0}
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  Currently online
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Companies Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Companies</CardTitle>
                <CardDescription>
                  Manage company accounts and their billing systems
                </CardDescription>
              </div>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Company
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Company</DialogTitle>
                    <DialogDescription>
                      Add a new company with an admin account
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateCompany} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Company Name</Label>
                        <Input
                          id="name"
                          value={newCompany.name}
                          onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Company Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newCompany.email}
                          onChange={(e) => setNewCompany({...newCompany, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={newCompany.phone}
                          onChange={(e) => setNewCompany({...newCompany, phone: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={newCompany.address}
                          onChange={(e) => setNewCompany({...newCompany, address: e.target.value})}
                        />
                      </div>
                    </div>

                    <hr className="my-4" />
                    <h4 className="font-medium">Admin Account</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="adminFirstName">First Name</Label>
                        <Input
                          id="adminFirstName"
                          value={newCompany.adminFirstName}
                          onChange={(e) => setNewCompany({...newCompany, adminFirstName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminLastName">Last Name</Label>
                        <Input
                          id="adminLastName"
                          value={newCompany.adminLastName}
                          onChange={(e) => setNewCompany({...newCompany, adminLastName: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="adminPassword">Admin Password</Label>
                      <Input
                        id="adminPassword"
                        type="password"
                        value={newCompany.adminPassword}
                        onChange={(e) => setNewCompany({...newCompany, adminPassword: e.target.value})}
                        required
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createCompanyMutation.isPending}>
                        {createCompanyMutation.isPending ? "Creating..." : "Create Company"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Edit Company Dialog */}
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Company</DialogTitle>
                    <DialogDescription>
                      Update company information
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdateCompany} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="editName">Company Name</Label>
                        <Input
                          id="editName"
                          value={editCompanyData.name}
                          onChange={(e) => setEditCompanyData({...editCompanyData, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editEmail">Company Email</Label>
                        <Input
                          id="editEmail"
                          type="email"
                          value={editCompanyData.email}
                          onChange={(e) => setEditCompanyData({...editCompanyData, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="editPhone">Phone</Label>
                        <Input
                          id="editPhone"
                          value={editCompanyData.phone}
                          onChange={(e) => setEditCompanyData({...editCompanyData, phone: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editAddress">Address</Label>
                        <Input
                          id="editAddress"
                          value={editCompanyData.address}
                          onChange={(e) => setEditCompanyData({...editCompanyData, address: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={editCompanyMutation.isPending}>
                        {editCompanyMutation.isPending ? "Updating..." : "Update Company"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!Array.isArray(companies) || companies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No companies found. Create your first company to get started.
                </div>
              ) : (
                companies.map((company: Company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium">{company.name}</h3>
                        <Badge variant={company.isActive ? "default" : "secondary"}>
                          {company.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {company.email}
                      </p>
                      {company.phone && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {company.phone}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{company.userCount} users</p>
                        <p className="text-xs text-gray-500">
                          Created {new Date(company.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditCompany(company)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Company</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{company.name}"? This action cannot be undone and will permanently remove all company data and users.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteCompany(company.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}