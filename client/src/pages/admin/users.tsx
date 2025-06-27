import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserCheck,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Shield,
  Users,
  Plus,
  UserPlus,
  Activity,
  Settings,
  Lock,
  Unlock,
  RefreshCw,
} from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: "super_admin" | "admin" | "manager" | "viewer";
  status: "active" | "inactive" | "suspended";
  lastLogin?: string;
  createdAt: string;
  permissions: string[];
  loginCount: number;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newThisMonth: number;
  roleDistribution: {
    super_admin: number;
    admin: number;
    manager: number;
    viewer: number;
  };
}

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/admin/users/stats"],
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/stats"] });
      setShowDeleteDialog(false);
      setSelectedUser(null);
      toast({
        title: "User deleted",
        description: "The user has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/admin/users/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Status updated",
        description: "User status has been updated successfully.",
      });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      return apiRequest("PATCH", `/api/admin/users/${id}`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Role updated",
        description: "User role has been updated successfully.",
      });
    },
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "destructive";
      case "admin":
        return "default";
      case "manager":
        return "secondary";
      case "viewer":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "suspended":
        return "destructive";
      default:
        return "secondary";
    }
  };

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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage admin users, roles, and permissions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeUsers || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                New This Month
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats?.newThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Admins
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">
              {(stats?.roleDistribution?.admin || 0) + (stats?.roleDistribution?.super_admin || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.roleDistribution?.manager || 0} managers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Viewers
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats?.roleDistribution?.viewer || 0}</div>
            <p className="text-xs text-muted-foreground">
              Read-only access
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage admin users and their access levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Login Count</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleColor(user.role)}>
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.lastLogin ? formatDate(user.lastLogin) : "Never"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{user.loginCount}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => updateUserStatusMutation.mutate({
                            id: user.id,
                            status: user.status === "active" ? "suspended" : "active"
                          })}
                        >
                          {user.status === "active" ? (
                            <>
                              <Lock className="mr-2 h-4 w-4" />
                              Suspend User
                            </>
                          ) : (
                            <>
                              <Unlock className="mr-2 h-4 w-4" />
                              Activate User
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteDialog(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Details Modal */}
      {selectedUser && !showDeleteDialog && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(selectedUser.username)}</AvatarFallback>
                </Avatar>
                <div>
                  <div>{selectedUser.username}</div>
                  <div className="text-sm font-normal text-muted-foreground">
                    {selectedUser.email}
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Role</h4>
                  <Badge variant={getRoleColor(selectedUser.role)}>
                    {selectedUser.role.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  <Badge variant={getStatusColor(selectedUser.status)}>
                    {selectedUser.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Login Count</h4>
                  <p className="text-sm text-muted-foreground">{selectedUser.loginCount}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Last Login</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : "Never"}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Permissions</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.permissions?.map((permission) => (
                    <Badge key={permission} variant="outline">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Account Details</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Created:</span> {formatDate(selectedUser.createdAt)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">User ID:</span> {selectedUser.id}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedUser && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete user "{selectedUser.username}"? 
                This action cannot be undone and will remove all associated data.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteUserMutation.mutate(selectedUser.id)}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}