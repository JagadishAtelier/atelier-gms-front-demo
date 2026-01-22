// src/components/Settings.tsx
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import {
  User,
  Building2,
  Bell,
  Palette,
  CreditCard,
  Shield,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Save,
  Upload,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import gymService from "../service/gymService.js";
import BASE_API from "../api/baseurl.js";

interface SettingsProps {
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
}

export function Settings({ theme, onThemeChange }: SettingsProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Controlled tab state so we can stay on the same tab after actions
  const [activeTab, setActiveTab] = useState<string>("profile");

  // Local app settings (non-gym fields)
  const [settings, setSettings] = useState({
    // Profile Settings
    fullName: "John Doe",
    email: "john.doe@gymmaster.com",
    phone: "+1 (555) 123-4567",
    role: "Administrator",

    // Display Settings (defaults)
    itemsPerPage: "25",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    language: "en",

    // Billing defaults
    taxRate: "8.5",
    lateFeeAmount: "25",
    lateFeeGracePeriod: "3",
    autoInvoicing: true,

    // Capacity defaults
    maxCapacity: "150",
    peakHourCapacity: "80",
    classMaxSize: "30",
  });

  // --- Gym-specific state (loaded from API) ---
  const [gymLoading, setGymLoading] = useState(false);
  const [gymError, setGymError] = useState<string | null>(null);
  const [gymId, setGymId] = useState<string | null>(null);
  const [gymName, setGymName] = useState("");
  const [gymAddress, setGymAddress] = useState("");
  const [gymPhone, setGymPhone] = useState("");
  const [gymEmail, setGymEmail] = useState("");
  const [gymWebsite, setGymWebsite] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [currency, setCurrency] = useState("USD");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [savingGym, setSavingGym] = useState(false);

  // Helper: resolve logo_url to absolute URL for preview
  const resolveUrl = (url?: string | null) => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    try {
      const base = new URL(BASE_API);
      return `${base.origin}${url.startsWith("/") ? url : `/${url}`}`;
    } catch {
      return `${window.location.origin}${url.startsWith("/") ? url : `/${url}`}`;
    }
  };

  const extractGymsArray = (res: any): any[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.data)) return res.data.data;
    if (Array.isArray(res.data?.rows)) return res.data.rows;
    if (Array.isArray(res.rows)) return res.rows;
    return [];
  };

  // Fetch single gym (first result)
  const loadGym = async () => {
    setGymLoading(true);
    setGymError(null);
    try {
      // Request only 1 gym to keep response small
      const res = await gymService.getGyms({ limit: 1 });
      const arr = extractGymsArray(res);
      const g = arr[0] ?? null;
      if (!g) {
        setGymError("No gym found. Create one from the admin panel or use Create option.");
        // clear form
        setGymId(null);
        setGymName("");
        setGymAddress("");
        setGymPhone("");
        setGymEmail("");
        setGymWebsite("");
        setIsActive(true);
        setLogoPreview(null);
        setLogoFile(null);
        setTimezone("America/New_York");
        setCurrency("USD");
        setGymLoading(false);
        return;
      }

      setGymId(g.id);
      setGymName(g.name || "");
      setGymAddress(g.address || "");
      setGymPhone(g.phone || "");
      setGymEmail(g.email || "");
      setGymWebsite(g.website || "");
      setIsActive(typeof g.is_active === "boolean" ? g.is_active : Boolean(g.is_active));
      setTimezone(g.timezone || "America/New_York");
      setCurrency(g.currency || "USD");

      const preview = g.logo_url ? resolveUrl(g.logo_url) : null;
      setLogoPreview(preview);
    } catch (err: any) {
      console.error("Failed to load gym:", err);
      setGymError(err?.message || "Failed to fetch gym");
      toast.error(err?.message || "Failed to fetch gym");
    } finally {
      setGymLoading(false);
    }
  };

  useEffect(() => {
    loadGym();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Logo file change handler
  const onLogoChange = (file?: File | null) => {
    setLogoFile(file || null);
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    } else {
      setLogoPreview(null);
    }
  };

  // Save (create/update gym)
  const handleSaveGym = async () => {
    // Basic client-side validation
    if (!gymName.trim()) return toast.error("Gym name is required");
    if (!gymAddress.trim()) return toast.error("Address is required");
    if (!gymPhone.trim()) return toast.error("Phone is required");
    if (!gymEmail.trim()) return toast.error("Email is required");

    setSavingGym(true);
    try {
      // Prepare payload as FormData to support file upload
      const form = new FormData();
      form.append("name", gymName.trim());
      form.append("address", gymAddress.trim());
      form.append("phone", gymPhone.trim());
      form.append("email", gymEmail.trim());
      if (gymWebsite) form.append("website", gymWebsite);
      // send boolean field as actual boolean-like string; backend Zod should coerce or controller will normalize
      form.append("is_active", JSON.stringify(Boolean(isActive)));
      form.append("timezone", timezone);
      form.append("currency", currency);

      if (logoFile) {
        // Use field name "image" to match optionalUpload pattern; change to "logo" if your backend expects that
        form.append("image", logoFile, logoFile.name);
      }

      let res;
      if (gymId) {
        // update
        res = await gymService.updateGym(gymId, form);
      } else {
        // create if none exists
        res = await gymService.createGym(form);
      }

      // Refresh view data and keep the user on the Gym tab
      await loadGym();
      setActiveTab("gym");
      toast.success((res && (res.message || "Gym saved successfully")) || "Gym saved");
    } catch (err: any) {
      console.error("Failed to save gym", err);
      const message =
        err?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to save gym";
      toast.error(message);
    } finally {
      setSavingGym(false);
    }
  };

  // Minimal handler for other settings saves (profile/display/etc.)
  const handleSave = (section: string) => {
    toast.success(`${section} settings saved successfully!`);
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9]">

    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your gym and account settings</p>
      </div>

      {/* Controlled Tabs - keeps active tab after actions */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(String(v))} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="gym">Gym</TabsTrigger>
          {/* <TabsTrigger value="notifications">Notifications</TabsTrigger> */}
          <TabsTrigger value="display">Display</TabsTrigger>
          {/* <TabsTrigger value="billing">Billing</TabsTrigger> */}
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile (unchanged) */}
        <TabsContent value="profile" className="space-y-6">
        <Card className="border-2 border-border/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-neon-green" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your personal details and profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
  <User className="h-10 w-10 text-muted-foreground" />
</div>

                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG or GIF (max. 2MB)</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={settings.fullName}
                    onChange={(e) => setSettings((p) => ({ ...p, fullName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={settings.role}
                    onValueChange={(value) => setSettings((p) => ({ ...p, role: value }))}
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrator">Administrator</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Trainer">Trainer</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex gap-2">
                    <Mail className="h-4 w-4 mt-3 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings((p) => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <Phone className="h-4 w-4 mt-3 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => setSettings((p) => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSave("Profile")}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gym Settings - now driven from API (show & edit single gym) */}
        <TabsContent value="gym" className="space-y-6">
        <Card className="border-2 border-border/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-neon-blue" />
                Gym Information
              </CardTitle>
              <CardDescription>Configure your gym's basic information and branding</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {gymLoading ? (
                <div>Loading gym...</div>
              ) : gymError ? (
                <div className="text-sm text-red-500">{gymError}</div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center overflow-hidden">
                      {logoPreview ? (
                        <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Upload Logo</Label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onLogoChange(e.target.files?.[0] ?? null)}
                      />
                      <p className="text-xs text-muted-foreground">PNG / JPG / SVG (max 2MB)</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="gymName">Gym Name</Label>
                    <Input id="gymName" value={gymName} onChange={(e) => setGymName(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gymAddress">Address</Label>
                    <div className="flex gap-2">
                      <MapPin className="h-4 w-4 mt-3 text-muted-foreground" />
                      <Textarea id="gymAddress" rows={2} value={gymAddress} onChange={(e) => setGymAddress(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gymPhone">Phone Number</Label>
                      <Input id="gymPhone" type="tel" value={gymPhone} onChange={(e) => setGymPhone(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gymEmail">Email Address</Label>
                      <Input id="gymEmail" type="email" value={gymEmail} onChange={(e) => setGymEmail(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <Label>Active</Label>
                      <Switch checked={isActive} onCheckedChange={(v) => setIsActive(Boolean(v))} />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button onClick={() => loadGym()} variant="ghost">Reload</Button>
                      <Button onClick={handleSaveGym} disabled={savingGym}>
                        {savingGym ? "Saving..." : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            {gymId ? "Save Changes" : "Create Gym"}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications (unchanged) */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-neon-green" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch checked={true} onCheckedChange={() => {}} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via text message</p>
                  </div>
                  <Switch checked={false} onCheckedChange={() => {}} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                  </div>
                  <Switch checked={true} onCheckedChange={() => {}} />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSave("Notification")}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display (unchanged) */}
        <TabsContent value="display" className="space-y-6">
        <Card className="border-2 border-border/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-400" />
                Display & Appearance
              </CardTitle>
              <CardDescription>Customize how the application looks and feels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      className={theme === "light" ? "bg-neon-green text-white" : ""}
                      onClick={() => onThemeChange("light")}
                    >
                      Light Mode
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      className={theme === "dark" ? "bg-neon-blue text-white" : ""}
                      onClick={() => onThemeChange("dark")}
                    >
                      Dark Mode
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={settings.language} onValueChange={(value) => setSettings((p) => ({ ...p, language: value }))}>
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="itemsPerPage">Items Per Page</Label>
                    <Select value={settings.itemsPerPage} onValueChange={(value) => setSettings((p) => ({ ...p, itemsPerPage: value }))}>
                      <SelectTrigger id="itemsPerPage">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={() => handleSave("Display")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing (unchanged) */}
        {/* <TabsContent value="billing" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-neon-green" />
                Billing & Payment Settings
              </CardTitle>
              <CardDescription>Configure billing, taxes, and payment options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input id="taxRate" type="number" step="0.1" value={settings.taxRate} onChange={(e) => setSettings((p) => ({ ...p, taxRate: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lateFeeAmount">Late Fee Amount ($)</Label>
                  <Input id="lateFeeAmount" type="number" value={settings.lateFeeAmount} onChange={(e) => setSettings((p) => ({ ...p, lateFeeAmount: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lateFeeGracePeriod">Grace Period (days)</Label>
                  <Input id="lateFeeGracePeriod" type="number" value={settings.lateFeeGracePeriod} onChange={(e) => setSettings((p) => ({ ...p, lateFeeGracePeriod: e.target.value }))} />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSave("Billing")}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* Security (unchanged) */}
        <TabsContent value="security" className="space-y-6">
        <Card className="border-2 border-border/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-400" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your account security and password</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input id="currentPassword" type={showPassword ? "text" : "password"} placeholder="Enter current password" />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="text-sm mb-2">Password Requirements:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>At least 8 characters long</li>
                    <li>Contains uppercase and lowercase letters</li>
                    <li>Contains at least one number</li>
                    <li>Contains at least one special character</li>
                  </ul>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={() => handleSave("Security")}>
                    <Save className="h-4 w-4 mr-2" />
                    Update Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </div>
  );
}

export default Settings;
