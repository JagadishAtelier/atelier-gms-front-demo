import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { 
  Search, 
  Plus, 
  Filter, 
  Calendar,
  Phone,
  Mail,
  User,
  CreditCard,
  Edit,
  Save,
  X
} from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  planType: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'pending';
  amount: number;
  photo?: string;
  address?: string;
  emergencyContact?: string;
  joinDate?: string;
  lastPayment?: string;
  nextBilling?: string;
  notes?: string;
}

const mockMembers: Member[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    planType: 'Premium Annual',
    startDate: '2024-01-15',
    endDate: '2025-01-15',
    status: 'active',
    amount: 1200,
    address: '123 Main St, City, State 12345',
    emergencyContact: '+1 (555) 123-4568',
    joinDate: '2024-01-15',
    lastPayment: '2024-01-15',
    nextBilling: '2025-01-15',
    notes: 'Prefers evening workouts'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 234-5678',
    planType: 'Monthly Basic',
    startDate: '2024-02-01',
    endDate: '2024-03-01',
    status: 'expired',
    amount: 80,
    address: '456 Oak Ave, City, State 12345',
    emergencyContact: '+1 (555) 234-5679',
    joinDate: '2024-02-01',
    lastPayment: '2024-02-01',
    nextBilling: '2024-03-01',
    notes: 'Needs membership renewal reminder'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike.wilson@email.com',
    phone: '+1 (555) 345-6789',
    planType: 'Premium Monthly',
    startDate: '2024-02-15',
    endDate: '2024-03-15',
    status: 'pending',
    amount: 150,
    address: '789 Pine St, City, State 12345',
    emergencyContact: '+1 (555) 345-6790',
    joinDate: '2024-02-15',
    lastPayment: '2024-02-15',
    nextBilling: '2024-03-15',
    notes: 'Payment pending verification'
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+1 (555) 456-7890',
    planType: 'Basic Annual',
    startDate: '2024-01-01',
    endDate: '2025-01-01',
    status: 'active',
    amount: 800,
    address: '321 Elm St, City, State 12345',
    emergencyContact: '+1 (555) 456-7891',
    joinDate: '2024-01-01',
    lastPayment: '2024-01-01',
    nextBilling: '2025-01-01',
    notes: 'Personal trainer sessions on weekends'
  },
  {
    id: '5',
    name: 'Alex Brown',
    email: 'alex.brown@email.com',
    phone: '+1 (555) 567-8901',
    planType: 'Premium Monthly',
    startDate: '2024-02-20',
    endDate: '2024-03-20',
    status: 'active',
    amount: 150,
    address: '654 Maple Dr, City, State 12345',
    emergencyContact: '+1 (555) 567-8902',
    joinDate: '2024-02-20',
    lastPayment: '2024-02-20',
    nextBilling: '2024-03-20',
    notes: 'Interested in group fitness classes'
  }
];

export function MembershipManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    planType: '',
    startDate: '',
    amount: '',
    photo: ''
  });

  // Member profile dialog state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMember, setEditedMember] = useState<Member | null>(null);

  // Billing dialog state
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [billingMember, setBillingMember] = useState<Member | null>(null);

  const filteredMembers = mockMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || member.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-neon-green/10 text-neon-green border-neon-green/20">Active</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleAddMember = () => {
    // In a real app, this would make an API call
    console.log('Adding new member:', newMember);
    setIsAddMemberOpen(false);
    setNewMember({ name: '', email: '', phone: '', planType: '', startDate: '', amount: '', photo: '' });
  };

  const handleViewProfile = (member: Member) => {
    setSelectedMember(member);
    setEditedMember({ ...member });
    setIsEditing(false);
    setIsProfileOpen(true);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    if (editedMember) {
      // In a real app, this would make an API call
      console.log('Saving member profile:', editedMember);
      setSelectedMember(editedMember);
      setIsEditing(false);
      // Here you would typically update the member in your state/database
    }
  };

  const handleCancelEdit = () => {
    if (selectedMember) {
      setEditedMember({ ...selectedMember });
      setIsEditing(false);
    }
  };

  const handleViewBilling = (member: Member) => {
    setBillingMember(member);
    setIsBillingOpen(true);
  };

  const handleUpdatePayment = () => {
    // In a real app, this would process payment
    console.log('Processing payment for:', billingMember?.name);
    setIsBillingOpen(false);
  };

  const memberCounts = {
    all: mockMembers.length,
    active: mockMembers.filter(m => m.status === 'active').length,
    expired: mockMembers.filter(m => m.status === 'expired').length,
    pending: mockMembers.filter(m => m.status === 'pending').length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2">Membership Management</h1>
          <p className="text-muted-foreground">Manage gym members, plans, and renewals</p>
        </div>
        
        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-neon-green to-neon-blue text-white w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add New Member</span>
              <span className="sm:hidden">Add Member</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
            <DialogHeader className="px-1 sm:px-0">
              <DialogTitle className="text-lg sm:text-xl">Add New Member</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Add a new member to your gym. Fill in all the required information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:gap-4 py-3 sm:py-4 px-1 sm:px-0">
              {/* Photo Section */}
              <div className="grid gap-2">
                <Label htmlFor="photo" className="text-sm sm:text-base">Member Photo</Label>
                <div className="flex flex-col gap-2">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setNewMember({...newMember, photo: event.target?.result as string});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="cursor-pointer text-sm"
                  />
                  {newMember.photo && (
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 border-neon-green mx-auto sm:mx-0">
                      <img 
                        src={newMember.photo} 
                        alt="Member preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                    Upload a photo or use camera to capture member's image
                  </p>
                </div>
              </div>

              {/* Personal Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="name" className="text-sm sm:text-base">Full Name</Label>
                  <Input
                    id="name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    placeholder="Enter member's full name"
                    className="text-sm sm:text-base"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    placeholder="member@example.com"
                    className="text-sm sm:text-base"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-sm sm:text-base">Phone</Label>
                  <Input
                    id="phone"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                    className="text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Plan and Batch Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="planType" className="text-sm sm:text-base">Plan Type</Label>
                  <Select value={newMember.planType} onValueChange={(value) => setNewMember({...newMember, planType: value})}>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic-monthly" className="text-sm">Basic Monthly - ₹80</SelectItem>
                      <SelectItem value="premium-monthly" className="text-sm">Premium Monthly - ₹150</SelectItem>
                      <SelectItem value="basic-annual" className="text-sm">Basic Annual - ₹800</SelectItem>
                      <SelectItem value="premium-annual" className="text-sm">Premium Annual - ₹1200</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="batch" className="text-sm sm:text-base">Workout Batch</Label>
                  <Select value={newMember.batch || ''} onValueChange={(value) => setNewMember({...newMember, batch: value})}>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Select workout batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning" className="text-sm">Morning Batch (6:00 AM - 12:00 PM)</SelectItem>
                      <SelectItem value="evening" className="text-sm">Evening Batch (4:00 PM - 10:00 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Start Date */}
              <div className="grid gap-2">
                <Label htmlFor="startDate" className="text-sm sm:text-base">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newMember.startDate}
                  onChange={(e) => setNewMember({...newMember, startDate: e.target.value})}
                  className="text-sm sm:text-base"
                />
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 px-1 sm:px-0">
              <Button 
                type="submit" 
                onClick={handleAddMember} 
                className="w-full sm:w-auto bg-gradient-to-r from-neon-green to-neon-blue text-white order-2 sm:order-1"
              >
                Add Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Member Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Member Profile
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditProfile}
                  className="ml-2"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Edit member information' : 'View member details and information'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMember && editedMember && (
            <div className="grid gap-6 py-4">
              {/* Member Photo and Basic Info */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gradient-to-r from-neon-green to-neon-blue rounded-full flex items-center justify-center text-white text-xl">
                  {selectedMember.name.charAt(0)}
                </div>
                <div className="flex-1 space-y-2">
                  {isEditing ? (
                    <Input
                      value={editedMember.name}
                      onChange={(e) => setEditedMember({...editedMember, name: e.target.value})}
                      className="text-lg font-semibold"
                    />
                  ) : (
                    <h3 className="text-lg font-semibold">{selectedMember.name}</h3>
                  )}
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedMember.status)}
                    <Badge variant="outline">{selectedMember.planType}</Badge>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid gap-4">
                <h4 className="font-medium">Contact Information</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editedMember.email}
                        onChange={(e) => setEditedMember({...editedMember, email: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                    )}
                  </div>
                  <div>
                    <Label>Phone</Label>
                    {isEditing ? (
                      <Input
                        value={editedMember.phone}
                        onChange={(e) => setEditedMember({...editedMember, phone: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{selectedMember.phone}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedMember.address || ''}
                      onChange={(e) => setEditedMember({...editedMember, address: e.target.value})}
                      rows={2}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{selectedMember.address || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <Label>Emergency Contact</Label>
                  {isEditing ? (
                    <Input
                      value={editedMember.emergencyContact || ''}
                      onChange={(e) => setEditedMember({...editedMember, emergencyContact: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{selectedMember.emergencyContact || 'Not provided'}</p>
                  )}
                </div>
              </div>

              {/* Membership Information */}
              <div className="grid gap-4">
                <h4 className="font-medium">Membership Information</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Plan Type</Label>
                    {isEditing ? (
                      <Select value={editedMember.planType} onValueChange={(value) => setEditedMember({...editedMember, planType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Basic Monthly">Basic Monthly</SelectItem>
                          <SelectItem value="Premium Monthly">Premium Monthly</SelectItem>
                          <SelectItem value="Basic Annual">Basic Annual</SelectItem>
                          <SelectItem value="Premium Annual">Premium Annual</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-muted-foreground">{selectedMember.planType}</p>
                    )}
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <p className="text-sm text-muted-foreground">₹{selectedMember.amount}</p>
                  </div>
                  <div>
                    <Label>Start Date</Label>
                    <p className="text-sm text-muted-foreground">{new Date(selectedMember.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <p className="text-sm text-muted-foreground">{new Date(selectedMember.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label>Join Date</Label>
                    <p className="text-sm text-muted-foreground">{selectedMember.joinDate ? new Date(selectedMember.joinDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Last Payment</Label>
                    <p className="text-sm text-muted-foreground">{selectedMember.lastPayment ? new Date(selectedMember.lastPayment).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label>Notes</Label>
                {isEditing ? (
                  <Textarea
                    value={editedMember.notes || ''}
                    onChange={(e) => setEditedMember({...editedMember, notes: e.target.value})}
                    rows={3}
                    placeholder="Add notes about this member..."
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{selectedMember.notes || 'No notes available'}</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} className="bg-gradient-to-r from-neon-green to-neon-blue text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setIsProfileOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Billing Management Dialog */}
      <Dialog open={isBillingOpen} onOpenChange={setIsBillingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Billing Management</DialogTitle>
            <DialogDescription>
              Manage payment and billing information for {billingMember?.name}
            </DialogDescription>
          </DialogHeader>
          
          {billingMember && (
            <div className="grid gap-6 py-4">
              {/* Member Info */}
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-neon-green to-neon-blue rounded-full flex items-center justify-center text-white">
                  {billingMember.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-medium">{billingMember.name}</h4>
                  <p className="text-sm text-muted-foreground">{billingMember.planType}</p>
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-4">
                <h4 className="font-medium">Payment Information</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Current Plan</Label>
                    <p className="text-sm text-muted-foreground">{billingMember.planType}</p>
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <p className="text-sm text-neon-green font-medium">₹{billingMember.amount}</p>
                  </div>
                  <div>
                    <Label>Last Payment</Label>
                    <p className="text-sm text-muted-foreground">
                      {billingMember.lastPayment ? new Date(billingMember.lastPayment).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label>Next Billing</Label>
                    <p className="text-sm text-muted-foreground">
                      {billingMember.nextBilling ? new Date(billingMember.nextBilling).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="space-y-3">
                <h4 className="font-medium">Payment Status</h4>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(billingMember.status)}
                    <span className="text-sm">
                      {billingMember.status === 'active' && 'Payment up to date'}
                      {billingMember.status === 'expired' && 'Payment required - membership expired'}
                      {billingMember.status === 'pending' && 'Payment pending verification'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="font-medium">Quick Actions</h4>
                <div className="grid gap-2">
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => console.log('Processing payment for:', billingMember.name)}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Process Payment
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => console.log('Sending payment reminder to:', billingMember.email)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Payment Reminder
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => console.log('Updating billing info for:', billingMember.name)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Update Billing Date
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBillingOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={handleUpdatePayment}
              className="bg-gradient-to-r from-neon-green to-neon-blue text-white"
            >
              Update Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search and Filter */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search members by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members ({memberCounts.all})</SelectItem>
                  <SelectItem value="active">Active ({memberCounts.active})</SelectItem>
                  <SelectItem value="expired">Expired ({memberCounts.expired})</SelectItem>
                  <SelectItem value="pending">Pending ({memberCounts.pending})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Members ({filteredMembers.length})</CardTitle>
          <CardDescription>
            {selectedFilter === 'all' ? 'All registered members' : `Members with ${selectedFilter} status`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead className="hidden sm:table-cell">Contact</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="hidden md:table-cell">Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-neon-green to-neon-blue rounded-full flex items-center justify-center text-white text-sm">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground sm:hidden">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3 h-3" />
                          {member.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {member.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{member.planType}</div>
                        <div className="text-sm text-muted-foreground">₹{member.amount}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="text-sm">{new Date(member.startDate).toLocaleDateString()}</div>
                        <div className="text-sm text-muted-foreground">to {new Date(member.endDate).toLocaleDateString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewProfile(member)}
                          className="hover:bg-neon-green/10 hover:text-neon-green"
                        >
                          <User className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewBilling(member)}
                          className="hover:bg-neon-blue/10 hover:text-neon-blue"
                        >
                          <CreditCard className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Renewal This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-neon-green">23 members</div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated revenue: ₹3,450
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">New Members (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-neon-blue">18 members</div>
            <p className="text-xs text-muted-foreground mt-1">
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Retention Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-purple-400">87%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Above industry average
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}