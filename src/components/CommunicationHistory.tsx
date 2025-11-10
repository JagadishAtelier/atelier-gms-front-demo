import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Search, 
  MessageSquare, 
  Mail, 
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Download,
  User,
  Calendar
} from 'lucide-react';

interface CommunicationRecord {
  id: string;
  type: 'whatsapp' | 'email';
  recipient: string;
  recipientEmail: string;
  subject: string;
  content: string;
  sentDate: string;
  sentTime: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  category: 'plan' | 'reminder' | 'invoice' | 'general';
}

const mockCommunications: CommunicationRecord[] = [
  {
    id: '1',
    type: 'whatsapp',
    recipient: 'John Smith',
    recipientEmail: 'john.smith@email.com',
    subject: 'Your New Workout Plan',
    content: 'Hi John! Here\'s your personalized workout plan for the next 8 weeks. Follow the progressive overload...',
    sentDate: '2024-02-28',
    sentTime: '14:30',
    status: 'read',
    category: 'plan'
  },
  {
    id: '2',
    type: 'email',
    recipient: 'Sarah Johnson',
    recipientEmail: 'sarah.j@email.com',
    subject: 'Payment Reminder - Invoice #INV-2024-002',
    content: 'Dear Sarah, This is a friendly reminder that your membership payment is due...',
    sentDate: '2024-02-28',
    sentTime: '09:15',
    status: 'delivered',
    category: 'reminder'
  },
  {
    id: '3',
    type: 'whatsapp',
    recipient: 'Mike Wilson',
    recipientEmail: 'mike.wilson@email.com',
    subject: 'Diet Plan - Weight Loss Program',
    content: 'Mike, your customized nutrition plan is ready! This 12-week program will help you achieve...',
    sentDate: '2024-02-27',
    sentTime: '16:45',
    status: 'read',
    category: 'plan'
  },
  {
    id: '4',
    type: 'email',
    recipient: 'Emily Davis',
    recipientEmail: 'emily.davis@email.com',
    subject: 'Monthly Invoice - March 2024',
    content: 'Dear Emily, Please find attached your monthly membership invoice for March 2024...',
    sentDate: '2024-02-27',
    sentTime: '11:20',
    status: 'sent',
    category: 'invoice'
  },
  {
    id: '5',
    type: 'whatsapp',
    recipient: 'Alex Brown',
    recipientEmail: 'alex.brown@email.com',
    subject: 'Welcome to FitnessPro Gym!',
    content: 'Welcome Alex! We\'re excited to have you as a member. Here\'s everything you need to know...',
    sentDate: '2024-02-26',
    sentTime: '10:00',
    status: 'read',
    category: 'general'
  },
  {
    id: '6',
    type: 'email',
    recipient: 'Lisa Martinez',
    recipientEmail: 'lisa.martinez@email.com',
    subject: 'Membership Renewal Reminder',
    content: 'Hi Lisa, Your membership expires in 7 days. Renew now to continue enjoying all our facilities...',
    sentDate: '2024-02-25',
    sentTime: '13:30',
    status: 'failed',
    category: 'reminder'
  }
];

export function CommunicationHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredCommunications = mockCommunications.filter(comm => {
    const matchesSearch = comm.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || comm.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || comm.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || comm.category === categoryFilter;
    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            <Send className="w-3 h-3 mr-1" />
            Sent
          </Badge>
        );
      case 'delivered':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Delivered
          </Badge>
        );
      case 'read':
        return (
          <Badge className="bg-neon-green/10 text-neon-green border-neon-green/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Read
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'whatsapp' 
      ? <Badge className="bg-neon-green/10 text-neon-green border-neon-green/20">WhatsApp</Badge>
      : <Badge className="bg-neon-blue/10 text-neon-blue border-neon-blue/20">Email</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      plan: { label: 'Plan', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
      reminder: { label: 'Reminder', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
      invoice: { label: 'Invoice', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      general: { label: 'General', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' }
    };
    
    const config = categoryConfig[category as keyof typeof categoryConfig];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const stats = {
    total: mockCommunications.length,
    whatsapp: mockCommunications.filter(c => c.type === 'whatsapp').length,
    email: mockCommunications.filter(c => c.type === 'email').length,
    sent: mockCommunications.filter(c => c.status === 'sent').length,
    delivered: mockCommunications.filter(c => c.status === 'delivered').length,
    read: mockCommunications.filter(c => c.status === 'read').length,
    failed: mockCommunications.filter(c => c.status === 'failed').length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2">Communication History</h1>
          <p className="text-muted-foreground">Track all messages sent to members via WhatsApp and Email</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-gradient-to-r from-neon-green to-neon-blue text-white">
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-neon-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">WhatsApp Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-neon-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-neon-green">{stats.whatsapp}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.whatsapp / stats.total) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Email Messages</CardTitle>
            <Mail className="h-4 w-4 text-neon-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-neon-blue">{stats.email}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.email / stats.total) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Read Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-neon-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-neon-green">{Math.round((stats.read / stats.total) * 100)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.read} messages read
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by member name or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="plan">Plans</SelectItem>
                  <SelectItem value="reminder">Reminders</SelectItem>
                  <SelectItem value="invoice">Invoices</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communications Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Messages ({filteredCommunications.length})</CardTitle>
          <CardDescription>
            Communication history with members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="hidden lg:table-cell">Category</TableHead>
                  <TableHead className="hidden sm:table-cell">Sent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommunications.map((comm) => (
                  <TableRow key={comm.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-neon-green to-neon-blue rounded-full flex items-center justify-center text-white text-sm">
                          {comm.recipient.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{comm.recipient}</div>
                          <div className="text-sm text-muted-foreground">{comm.recipientEmail}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {getTypeBadge(comm.type)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium line-clamp-1">{comm.subject}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]">
                          {comm.content}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {getCategoryBadge(comm.category)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="text-sm">
                        <div>{new Date(comm.sentDate).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">{comm.sentTime}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(comm.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Send Bulk Messages</CardTitle>
            <CardDescription>Send messages to multiple members at once</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              className="w-full bg-gradient-to-r from-neon-green/10 to-neon-green/5 hover:from-neon-green/20 hover:to-neon-green/10 border border-neon-green/20"
              onClick={() => {
                console.log('Opening WhatsApp broadcast composer...');
                // This would open a dialog for composing WhatsApp messages
                alert('WhatsApp Broadcast feature - Select members and compose message');
              }}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Send WhatsApp Broadcast
            </Button>
            <Button 
              className="w-full bg-gradient-to-r from-neon-blue/10 to-neon-blue/5 hover:from-neon-blue/20 hover:to-neon-blue/10 border border-neon-blue/20"
              onClick={() => {
                console.log('Opening email newsletter composer...');
                // This would open a dialog for composing email newsletters
                alert('Email Newsletter feature - Select recipients and compose email');
              }}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Email Newsletter
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Templates</CardTitle>
            <CardDescription>Use pre-built message templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              Welcome Message
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Payment Reminder
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Plan Delivery
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Message Statistics</CardTitle>
            <CardDescription>This month's performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Delivery Rate</span>
              <span className="text-sm font-medium text-neon-green">94%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Open Rate</span>
              <span className="text-sm font-medium text-neon-blue">76%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Response Rate</span>
              <span className="text-sm font-medium text-purple-400">23%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}