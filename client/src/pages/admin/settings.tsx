import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building,
  Mail,
  Phone,
  Globe,
  Shield,
  Bell,
  Database,
  Save,
  RefreshCw,
  Upload,
  Download,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SystemSettings {
  // Company Settings
  companyName: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  taxId?: string;
  
  // System Configuration
  currency: string;
  timezone: string;
  dateFormat: string;
  defaultInvoiceTerms: string;
  autoNumbering: boolean;
  
  // Notification Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  reminderDays: number;
  
  // Security Settings
  sessionTimeout: number;
  passwordMinLength: number;
  requireTwoFactor: boolean;
  allowedDomains: string[];
  
  // Backup Settings
  autoBackup: boolean;
  backupFrequency: string;
  retentionPeriod: number;
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("company");
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<SystemSettings>({
    queryKey: ["/api/admin/settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<SystemSettings>) => {
      return apiRequest("PATCH", "/api/admin/settings", updatedSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: "Settings updated",
        description: "System settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createBackupMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/backup");
    },
    onSuccess: () => {
      toast({
        title: "Backup created",
        description: "System backup has been created successfully.",
      });
    },
  });

  const handleSaveSettings = (sectionSettings: Partial<SystemSettings>) => {
    updateSettingsMutation.mutate(sectionSettings);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">
          Configure system-wide settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Update your company details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    defaultValue={settings?.companyName}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    defaultValue={settings?.taxId}
                    placeholder="Enter tax ID"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={settings?.email}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    defaultValue={settings?.phone}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  defaultValue={settings?.address}
                  placeholder="Enter company address"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  defaultValue={settings?.website}
                  placeholder="https://example.com"
                />
              </div>

              <Button 
                onClick={() => handleSaveSettings({
                  companyName: (document.getElementById("companyName") as HTMLInputElement)?.value,
                  email: (document.getElementById("email") as HTMLInputElement)?.value,
                  phone: (document.getElementById("phone") as HTMLInputElement)?.value,
                  address: (document.getElementById("address") as HTMLTextAreaElement)?.value,
                  website: (document.getElementById("website") as HTMLInputElement)?.value,
                  taxId: (document.getElementById("taxId") as HTMLInputElement)?.value,
                })}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Company Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Configuration */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>
                Configure system defaults and regional settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select defaultValue={settings?.currency || "INR"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue={settings?.timezone || "Asia/Kolkata"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select defaultValue={settings?.dateFormat || "DD/MM/YYYY"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoNumbering"
                    defaultChecked={settings?.autoNumbering}
                  />
                  <Label htmlFor="autoNumbering">Auto Invoice Numbering</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultTerms">Default Invoice Terms</Label>
                <Textarea
                  id="defaultTerms"
                  defaultValue={settings?.defaultInvoiceTerms}
                  placeholder="Enter default terms and conditions"
                  rows={3}
                />
              </div>

              <Button 
                onClick={() => handleSaveSettings({
                  defaultInvoiceTerms: (document.getElementById("defaultTerms") as HTMLTextAreaElement)?.value,
                })}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save System Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure how and when notifications are sent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailNotifications"
                    defaultChecked={settings?.emailNotifications}
                  />
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="smsNotifications"
                    defaultChecked={settings?.smsNotifications}
                  />
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminderDays">Payment Reminder (Days Before Due)</Label>
                <Select defaultValue={settings?.reminderDays?.toString() || "3"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reminder days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={() => handleSaveSettings({})}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security policies and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (Minutes)</Label>
                  <Select defaultValue={settings?.sessionTimeout?.toString() || "60"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="480">8 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordLength">Minimum Password Length</Label>
                  <Select defaultValue={settings?.passwordMinLength?.toString() || "8"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 characters</SelectItem>
                      <SelectItem value="8">8 characters</SelectItem>
                      <SelectItem value="12">12 characters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="requireTwoFactor"
                  defaultChecked={settings?.requireTwoFactor}
                />
                <Label htmlFor="requireTwoFactor">Require Two-Factor Authentication</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowedDomains">Allowed Email Domains (one per line)</Label>
                <Textarea
                  id="allowedDomains"
                  defaultValue={settings?.allowedDomains?.join('\n')}
                  placeholder="example.com&#10;company.org"
                  rows={3}
                />
              </div>

              <Button 
                onClick={() => handleSaveSettings({})}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Backup & Recovery
              </CardTitle>
              <CardDescription>
                Configure automatic backups and data retention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoBackup"
                  defaultChecked={settings?.autoBackup}
                />
                <Label htmlFor="autoBackup">Enable Automatic Backups</Label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select defaultValue={settings?.backupFrequency || "daily"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retentionPeriod">Retention Period (Days)</Label>
                  <Select defaultValue={settings?.retentionPeriod?.toString() || "30"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select retention" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Manual Backup</h4>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => createBackupMutation.mutate()}
                    disabled={createBackupMutation.isPending}
                  >
                    {createBackupMutation.isPending ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Create Backup Now
                  </Button>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Restore from Backup
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <div className="flex items-center space-x-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <h4 className="text-sm font-medium">Danger Zone</h4>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Permanently delete all data. This action cannot be undone.
                </p>
                <Button variant="destructive" className="mt-3" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete All Data
                </Button>
              </div>

              <Button 
                onClick={() => handleSaveSettings({})}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Backup Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}