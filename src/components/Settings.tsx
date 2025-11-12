import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
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
  Calendar,
  Save,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface SettingsProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export function Settings({ theme, onThemeChange }: SettingsProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    // Profile Settings
    fullName: 'John Doe',
    email: 'john.doe@gymmaster.com',
    phone: '+1 (555) 123-4567',
    role: 'Administrator',
    
    // Gym Settings
    gymName: 'FitMaster Gym',
    gymAddress: '123 Fitness Street, New York, NY 10001',
    gymPhone: '+1 (555) 987-6543',
    gymEmail: 'info@fitmastergym.com',
    gymWebsite: 'www.fitmastergym.com',
    timezone: 'America/New_York',
    currency: 'USD',
    
    // Operating Hours
    weekdayOpen: '06:00',
    weekdayClose: '22:00',
    weekendOpen: '08:00',
    weekendClose: '20:00',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    membershipExpiry: true,
    paymentReminders: true,
    lowAttendance: false,
    newMemberWelcome: true,
    
    // Display Settings
    itemsPerPage: '25',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    language: 'en',
    
    // Billing Settings
    taxRate: '8.5',
    lateFeeAmount: '25',
    lateFeeGracePeriod: '3',
    autoInvoicing: true,
    
    // Capacity Settings
    maxCapacity: '150',
    peakHourCapacity: '80',
    classMaxSize: '30'
  });

  const handleSave = (section: string) => {
    toast.success(`${section} settings saved successfully!`);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your gym and account settings</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="gym">Gym</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-neon-green" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your personal details and profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-neon-green/20 to-neon-blue/20 flex items-center justify-center">
                  <User className="h-10 w-10 text-neon-green" />
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
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={settings.role} onValueChange={(value) => handleInputChange('role', value)}>
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
                      onChange={(e) => handleInputChange('email', e.target.value)}
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
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSave('Profile')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gym Settings */}
        <TabsContent value="gym" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-neon-blue" />
                Gym Information
              </CardTitle>
              <CardDescription>Configure your gym's basic information and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gymName">Gym Name</Label>
                <Input
                  id="gymName"
                  value={settings.gymName}
                  onChange={(e) => handleInputChange('gymName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gymAddress">Address</Label>
                <div className="flex gap-2">
                  <MapPin className="h-4 w-4 mt-3 text-muted-foreground" />
                  <Textarea
                    id="gymAddress"
                    value={settings.gymAddress}
                    onChange={(e) => handleInputChange('gymAddress', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gymPhone">Phone Number</Label>
                  <Input
                    id="gymPhone"
                    type="tel"
                    value={settings.gymPhone}
                    onChange={(e) => handleInputChange('gymPhone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gymEmail">Email Address</Label>
                  <Input
                    id="gymEmail"
                    type="email"
                    value={settings.gymEmail}
                    onChange={(e) => handleInputChange('gymEmail', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gymWebsite">Website</Label>
                <div className="flex gap-2">
                  <Globe className="h-4 w-4 mt-3 text-muted-foreground" />
                  <Input
                    id="gymWebsite"
                    value={settings.gymWebsite}
                    onChange={(e) => handleInputChange('gymWebsite', e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={settings.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSave('Gym')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-400" />
                Operating Hours
              </CardTitle>
              <CardDescription>Set your gym's operating hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-base mb-3 block">Weekdays (Monday - Friday)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weekdayOpen">Opening Time</Label>
                      <Input
                        id="weekdayOpen"
                        type="time"
                        value={settings.weekdayOpen}
                        onChange={(e) => handleInputChange('weekdayOpen', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weekdayClose">Closing Time</Label>
                      <Input
                        id="weekdayClose"
                        type="time"
                        value={settings.weekdayClose}
                        onChange={(e) => handleInputChange('weekdayClose', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base mb-3 block">Weekends (Saturday - Sunday)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weekendOpen">Opening Time</Label>
                      <Input
                        id="weekendOpen"
                        type="time"
                        value={settings.weekendOpen}
                        onChange={(e) => handleInputChange('weekendOpen', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weekendClose">Closing Time</Label>
                      <Input
                        id="weekendClose"
                        type="time"
                        value={settings.weekendClose}
                        onChange={(e) => handleInputChange('weekendClose', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSave('Operating Hours')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-400" />
                Capacity Settings
              </CardTitle>
              <CardDescription>Configure gym capacity limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxCapacity">Maximum Capacity</Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    value={settings.maxCapacity}
                    onChange={(e) => handleInputChange('maxCapacity', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="peakHourCapacity">Peak Hour Limit (%)</Label>
                  <Input
                    id="peakHourCapacity"
                    type="number"
                    value={settings.peakHourCapacity}
                    onChange={(e) => handleInputChange('peakHourCapacity', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classMaxSize">Class Max Size</Label>
                  <Input
                    id="classMaxSize"
                    type="number"
                    value={settings.classMaxSize}
                    onChange={(e) => handleInputChange('classMaxSize', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSave('Capacity')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
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
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via text message</p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleInputChange('pushNotifications', checked)}
                  />
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h4 className="mb-4">Alert Types</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Membership Expiry Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified when memberships are expiring</p>
                    </div>
                    <Switch
                      checked={settings.membershipExpiry}
                      onCheckedChange={(checked) => handleInputChange('membershipExpiry', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Payment Reminders</Label>
                      <p className="text-sm text-muted-foreground">Notify about pending payments and dues</p>
                    </div>
                    <Switch
                      checked={settings.paymentReminders}
                      onCheckedChange={(checked) => handleInputChange('paymentReminders', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Low Attendance Alerts</Label>
                      <p className="text-sm text-muted-foreground">Alert when member attendance drops</p>
                    </div>
                    <Switch
                      checked={settings.lowAttendance}
                      onCheckedChange={(checked) => handleInputChange('lowAttendance', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Member Welcome</Label>
                      <p className="text-sm text-muted-foreground">Send welcome messages to new members</p>
                    </div>
                    <Switch
                      checked={settings.newMemberWelcome}
                      onCheckedChange={(checked) => handleInputChange('newMemberWelcome', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSave('Notification')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Settings */}
        <TabsContent value="display" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-400" />
                Display & Appearance
              </CardTitle>
              <CardDescription>Customize how the application looks and feels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      className={theme === 'light' ? 'bg-neon-green text-white' : ''}
                      onClick={() => onThemeChange('light')}
                    >
                      Light Mode
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      className={theme === 'dark' ? 'bg-neon-blue text-white' : ''}
                      onClick={() => onThemeChange('dark')}
                    >
                      Dark Mode
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={settings.language} onValueChange={(value) => handleInputChange('language', value)}>
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
                    <Select value={settings.itemsPerPage} onValueChange={(value) => handleInputChange('itemsPerPage', value)}>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select value={settings.dateFormat} onValueChange={(value) => handleInputChange('dateFormat', value)}>
                      <SelectTrigger id="dateFormat">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeFormat">Time Format</Label>
                    <Select value={settings.timeFormat} onValueChange={(value) => handleInputChange('timeFormat', value)}>
                      <SelectTrigger id="timeFormat">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12 Hour</SelectItem>
                        <SelectItem value="24h">24 Hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSave('Display')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-neon-green" />
                Billing & Payment Settings
              </CardTitle>
              <CardDescription>Configure billing, taxes, and payment options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.1"
                    value={settings.taxRate}
                    onChange={(e) => handleInputChange('taxRate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lateFeeAmount">Late Fee Amount ($)</Label>
                  <Input
                    id="lateFeeAmount"
                    type="number"
                    value={settings.lateFeeAmount}
                    onChange={(e) => handleInputChange('lateFeeAmount', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lateFeeGracePeriod">Grace Period (days)</Label>
                  <Input
                    id="lateFeeGracePeriod"
                    type="number"
                    value={settings.lateFeeGracePeriod}
                    onChange={(e) => handleInputChange('lateFeeGracePeriod', e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Invoicing</Label>
                  <p className="text-sm text-muted-foreground">Generate invoices automatically on due dates</p>
                </div>
                <Switch
                  checked={settings.autoInvoicing}
                  onCheckedChange={(checked) => handleInputChange('autoInvoicing', checked)}
                />
              </div>

              <Separator />

              <div>
                <h4 className="mb-4">Accepted Payment Methods</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-neon-green" />
                      <span className="text-sm">Credit/Debit Card</span>
                    </div>
                    <Badge className="bg-neon-green/10 text-neon-green">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-neon-blue" />
                      <span className="text-sm">Cash Payment</span>
                    </div>
                    <Badge className="bg-neon-blue/10 text-neon-blue">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-purple-400" />
                      <span className="text-sm">Bank Transfer</span>
                    </div>
                    <Badge className="bg-purple-400/10 text-purple-400">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Online Payment</span>
                    </div>
                    <Badge variant="outline">Inactive</Badge>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSave('Billing')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-400" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your account security and password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                  />
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
              </div>

              <Separator />

              <div>
                <h4 className="mb-4">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Enable 2FA</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline">Setup 2FA</Button>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-4">Active Sessions</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm">Current Session</p>
                      <p className="text-xs text-muted-foreground">New York, USA • Chrome on Windows</p>
                    </div>
                    <Badge className="bg-neon-green/10 text-neon-green">Active Now</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm">Mobile App</p>
                      <p className="text-xs text-muted-foreground">Los Angeles, USA • iOS 2 days ago</p>
                    </div>
                    <Button variant="outline" size="sm">Revoke</Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSave('Security')}>
                  <Save className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-500">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions - proceed with caution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-500/20 rounded-lg">
                <div>
                  <p className="text-sm">Export All Data</p>
                  <p className="text-xs text-muted-foreground">Download a copy of all your gym data</p>
                </div>
                <Button variant="outline">Export Data</Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-red-500/20 rounded-lg">
                <div>
                  <p className="text-sm">Delete Account</p>
                  <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
