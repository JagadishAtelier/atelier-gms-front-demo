import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Search, 
  Download, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  memberName: string;
  memberEmail: string;
  amount: number;
  dueDate: string;
  issueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  lateFee: number;
  planType: string;
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    memberName: 'John Smith',
    memberEmail: 'john.smith@email.com',
    amount: 150,
    dueDate: '2024-03-15',
    issueDate: '2024-02-15',
    status: 'paid',
    lateFee: 0,
    planType: 'Premium Monthly'
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    memberName: 'Sarah Johnson',
    memberEmail: 'sarah.j@email.com',
    amount: 80,
    dueDate: '2024-03-01',
    issueDate: '2024-02-01',
    status: 'overdue',
    lateFee: 25,
    planType: 'Basic Monthly'
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    memberName: 'Mike Wilson',
    memberEmail: 'mike.wilson@email.com',
    amount: 150,
    dueDate: '2024-03-20',
    issueDate: '2024-02-20',
    status: 'pending',
    lateFee: 0,
    planType: 'Premium Monthly'
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-004',
    memberName: 'Emily Davis',
    memberEmail: 'emily.davis@email.com',
    amount: 1200,
    dueDate: '2024-03-25',
    issueDate: '2024-02-25',
    status: 'paid',
    lateFee: 0,
    planType: 'Premium Annual'
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-005',
    memberName: 'Alex Brown',
    memberEmail: 'alex.brown@email.com',
    amount: 80,
    dueDate: '2024-02-28',
    issueDate: '2024-01-28',
    status: 'overdue',
    lateFee: 40,
    planType: 'Basic Monthly'
  }
];

export function InvoiceManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch = invoice.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-neon-green/10 text-neon-green border-neon-green/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'overdue':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Overdue
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const totals = {
    all: mockInvoices.length,
    paid: mockInvoices.filter(i => i.status === 'paid').length,
    pending: mockInvoices.filter(i => i.status === 'pending').length,
    overdue: mockInvoices.filter(i => i.status === 'overdue').length,
    totalAmount: mockInvoices.reduce((sum, i) => sum + i.amount + i.lateFee, 0),
    paidAmount: mockInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount + i.lateFee, 0),
    pendingAmount: mockInvoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount + i.lateFee, 0),
    lateFees: mockInvoices.reduce((sum, i) => sum + i.lateFee, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2">Invoice Management</h1>
          <p className="text-muted-foreground">Track payments, manage billing, and handle overdue accounts</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-gradient-to-r from-neon-green to-neon-blue text-white">
            <FileText className="w-4 h-4 mr-2" />
            Generate Invoice
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-neon-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">₹{totals.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This month's billing
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Collected</CardTitle>
            <CheckCircle className="h-4 w-4 text-neon-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-neon-green">₹{totals.paidAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totals.paid} invoices paid
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Outstanding</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-yellow-500">₹{totals.pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totals.pending + totals.overdue} pending/overdue
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Late Fees</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-500">₹{totals.lateFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {totals.overdue} overdue invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by member name or invoice number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Invoices ({totals.all})</SelectItem>
                <SelectItem value="paid">Paid ({totals.paid})</SelectItem>
                <SelectItem value="pending">Pending ({totals.pending})</SelectItem>
                <SelectItem value="overdue">Overdue ({totals.overdue})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
          <CardDescription>
            {statusFilter === 'all' ? 'All invoices' : `${statusFilter} invoices`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead className="hidden md:table-cell">Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden sm:table-cell">Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          Issued: {new Date(invoice.issueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.memberName}</div>
                        <div className="text-sm text-muted-foreground">{invoice.memberEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{invoice.planType}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">₹{invoice.amount}</div>
                        {invoice.lateFee > 0 && (
                          <div className="text-sm text-red-500">
                            +₹{invoice.lateFee} late fee
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className={`text-sm ${isOverdue(invoice.dueDate) && invoice.status !== 'paid' ? 'text-red-500' : ''}`}>
                        {new Date(invoice.dueDate).toLocaleDateString()}
                        {invoice.status === 'overdue' && (
                          <div className="text-xs text-red-500">
                            {getDaysOverdue(invoice.dueDate)} days overdue
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            alert(`Viewing invoice details for Invoice #${invoice.id}\n\nMember: ${invoice.member}\nAmount: ${invoice.amount}\nStatus: ${invoice.status}\nDue Date: ${invoice.dueDate}`);
                          }}
                          title="View Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            // Create and trigger download
                            const invoiceData = `Invoice #${invoice.id}\nMember: ${invoice.member}\nAmount: ${invoice.amount}\nStatus: ${invoice.status}\nDue Date: ${invoice.dueDate}\nIssued: ${invoice.issuedDate}`;
                            const blob = new Blob([invoiceData], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `invoice-${invoice.id}.txt`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                          title="Download Invoice"
                        >
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
            <CardTitle className="text-lg">Send Reminders</CardTitle>
            <CardDescription>Notify members about upcoming due dates</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-gradient-to-r from-neon-blue/10 to-neon-blue/5 hover:from-neon-blue/20 hover:to-neon-blue/10 border border-neon-blue/20">
              Send Payment Reminders
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Overdue Actions</CardTitle>
            <CardDescription>Handle overdue accounts and late fees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full text-orange-500 border-orange-500/20">
                Apply Late Fees
              </Button>
              <Button variant="outline" className="w-full text-red-500 border-red-500/20">
                Freeze Accounts
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Bulk Actions</CardTitle>
            <CardDescription>Perform actions on multiple invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Export Selected
              </Button>
              <Button variant="outline" className="w-full">
                Mark as Paid
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}