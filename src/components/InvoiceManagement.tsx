// src/pages/invoice/InvoiceManagement.tsx
import React, { useEffect, useState, ChangeEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Printer,
} from "lucide-react";
import membermembershipService from "@/service/membermembershipService";
import memberService from "@/service/memberService";
import membershipService from "@/service/membershipService";
import gymService from "@/service/gymService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Invoice {
  id: string;
  invoiceNumber: string;
  memberId?: string;
  memberName: string;
  memberEmail?: string;
  amount: number;
  dueDate: string;
  issueDate: string;
  status: "paid" | "pending" | "overdue";
  lateFee: number;
  planType: string;
  backendId?: string; // id returned from backend membermembership (optional)
}

interface MemberOption {
  id: string;
  name: string;
  email?: string;
}

interface MembershipOption {
  id: string;
  name: string;
  price?: string | number;
}

export function InvoiceManagement(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "paid" | "pending" | "overdue"
  >("all");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  const [members, setMembers] = useState<MemberOption[]>([]);
  const [memberships, setMemberships] = useState<MembershipOption[]>([]);
  const [gym, setGym] = useState<any | null>(null); // <-- primary gym info

  const [openModal, setOpenModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    memberId: "",
    membershipId: "",
    memberName: "",
    memberEmail: "",
    planType: "",
    amount: "",
    dueDate: "",
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  // --- extracted fetchAll so it can be called after adding invoices ---
  const fetchAll = async () => {
    setLoading(true);
    try {
      // fetch member-membership records (existing invoices)
      const mmRes = await membermembershipService.getAllMemberMemberships();
      // mmRes shape varies per backend; attempt to extract array
      const mmData: any[] =
        (mmRes && mmRes.data && Array.isArray(mmRes.data)) // if service returns { data: [...] }
          ? mmRes.data
          : Array.isArray(mmRes) // or service returned array directly
          ? mmRes
          : (mmRes && mmRes.data && mmRes.data.data) // previous code used .data.data
          ? mmRes.data.data
          : [];

      const formatted: Invoice[] = (mmData || []).map((item: any) => {
        // Try multiple sources for amount in order of preference
        let amount = 0;
        if (item.Membership?.price) {
          // First: Membership.price (when Membership object exists)
          amount = Number(item.Membership.price);
        } else if (item.amount_paid) {
          // Second: amount_paid field (direct amount paid for this membership)
          amount = Number(item.amount_paid);
        } else if (item.amount) {
          // Third: amount field
          amount = Number(item.amount);
        }
        
        return {
          id: item.id ?? Math.random().toString(36).substr(2, 9),
          backendId: item.id,
          invoiceNumber:
            item.invoice_number ??
            (item.id ? `INV-${String(item.id).slice(0, 8).toUpperCase()}` : `INV-${Date.now()}`),
          memberId: item.member_id ?? item.Member?.id,
          memberName: item.Member?.name || item.member_name || "Unknown",
          memberEmail: item.Member?.email || item.member_email || "N/A",
          amount: isNaN(amount) ? 0 : amount,
          dueDate: item.end_date ?? item.due_date ?? new Date().toISOString(),
          issueDate: item.start_date ?? item.issue_date ?? new Date().toISOString(),
          status:
            item.payment_status === "paid" || item.status === "paid" || item.status === "active"
              ? "paid"
              : item.status === "expired" || item.payment_status === "unpaid"
              ? "pending"
              : "pending",
          lateFee: Number(item.late_fee ?? 0),
          planType: item.Membership?.name ?? item.membership_name ?? item.plan_type ?? "N/A",
        };
      });

      setInvoices(formatted);

      // fetch members, memberships, and gyms to populate dropdowns and print header
      const [
        membersRes,
        membershipsRes,
        gymsRes
      ] = await Promise.allSettled([
        memberService.getMembers({ limit: 1000 }),
        membershipService.getMemberships({ limit: 1000 }),
        gymService.getGyms({ page: 1, limit: 10 }), // fetch gyms (we'll take the first gym as primary)
      ]);

      const mList: MemberOption[] =
        membersRes.status === "fulfilled"
          ? extractListFromResponse(membersRes.value)
              .map((m: any) => ({
                id: m.id,
                name: m.name,
                email: m.email,
              }))
              // dedupe by id
              .filter(uniqueById)
          : [];

      const msList: MembershipOption[] =
        membershipsRes.status === "fulfilled"
          ? extractListFromResponse(membershipsRes.value)
              .map((ms: any) => ({
                id: ms.id,
                name: ms.name,
                price: ms.price,
              }))
              .filter(uniqueById)
          : [];

      setMembers(mList);
      setMemberships(msList);

      // handle gyms result
      if (gymsRes.status === "fulfilled") {
        const gymsList = extractListFromResponse(gymsRes.value);
        if (Array.isArray(gymsList) && gymsList.length > 0) {
          setGym(gymsList[0]); // use first gym as primary
        } else {
          setGym(null);
        }
      } else {
        setGym(null);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to load invoices and lists");
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helpers used above
  function extractListFromResponse(resp: any): any[] {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp;
    if (resp.data && Array.isArray(resp.data)) return resp.data;
    if (resp.data && resp.data.data && Array.isArray(resp.data.data)) return resp.data.data;
    if (resp.data && resp.data.data && resp.data.data.data && Array.isArray(resp.data.data.data))
      return resp.data.data.data;
    return [];
  }

  function uniqueById<T extends { id?: string }>(value: T, index: number, self: T[]) {
    return self.findIndex((v) => v.id === value.id) === index;
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-neon-green/10 text-neon-green border-neon-green/20">
            <CheckCircle className="w-3 h-3 mr-1" /> Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" /> Overdue
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const totals = {
    all: invoices.length,
    paid: invoices.filter((i) => i.status === "paid").length,
    pending: invoices.filter((i) => i.status === "pending").length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
    totalAmount: invoices.reduce((sum, i) => sum + (isFinite(i.amount) ? i.amount : 0) + (i.lateFee || 0), 0),
    paidAmount: invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount, 0),
    pendingAmount: invoices.filter((i) => i.status !== "paid").reduce((sum, i) => sum + i.amount, 0),
    lateFees: invoices.reduce((sum, i) => sum + (i.lateFee || 0), 0),
  };

  // when member dropdown selects
  const onSelectMember = (memberId: string) => {
    const m = members.find((x) => x.id === memberId);
    setNewInvoice({
      ...newInvoice,
      memberId,
      memberName: m?.name || "",
      memberEmail: m?.email || "",
    });
  };

  // when membership dropdown selects
  const onSelectMembership = (membershipId: string) => {
    const ms = memberships.find((x) => x.id === membershipId);
    setNewInvoice({
      ...newInvoice,
      membershipId,
      planType: ms?.name || "",
      amount: ms?.price ? String(ms.price) : newInvoice.amount,
    });
  };

  // Create member-membership on backend & add local invoice
  const handleAddInvoice = async () => {
    // basic validations
    if (!newInvoice.memberName || !newInvoice.amount) {
      toast.error("Please fill in member name and amount.");
      return;
    }

    setLoading(true);
    try {
      let backendRecord: any = null;
      let createdOnBackend = false;

      // If user selected both member and membership IDs, create backend record
      if (newInvoice.memberId && newInvoice.membershipId) {
        const payload: any = {
          member_id: newInvoice.memberId,
          membership_id: newInvoice.membershipId,
          payment_status: "paid", // default to paid for generated invoice
          status: "active",
        };

        // set start_date to today, and end_date if provided
        payload.start_date = new Date().toISOString();
        if (newInvoice.dueDate) payload.end_date = new Date(newInvoice.dueDate).toISOString();

        try {
          const createRes = await membermembershipService.createMemberMembership(payload);
          backendRecord = createRes?.data ?? createRes;
          createdOnBackend = !!backendRecord;
          toast.success("MemberMembership created in backend");
        } catch (err: any) {
          console.warn("Backend create failed, continuing with local invoice", err);
          toast.error("Failed to create backend membership. Invoice saved locally.");
        }
      }

      const newItem: Invoice = {
        id: Math.random().toString(36).substr(2, 9),
        backendId: backendRecord?.id ?? undefined,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        memberId: newInvoice.memberId || undefined,
        memberName: newInvoice.memberName,
        memberEmail: newInvoice.memberEmail || undefined,
        amount: parseFloat(newInvoice.amount),
        dueDate: newInvoice.dueDate || new Date().toISOString(),
        issueDate: new Date().toISOString(),
        status: "paid",
        lateFee: 0,
        planType: newInvoice.planType || "Custom",
      };

      // If backend creation succeeded -> re-fetch entire list from server to reflect canonical data.
      if (createdOnBackend) {
        await fetchAll();
        toast.success("Invoice created and table refreshed.");
      } else {
        // fallback: keep local invoice so user sees it immediately
        setInvoices((prev) => [...prev, newItem]);
        toast.success("Invoice generated locally.");
      }

      setOpenModal(false);
      setNewInvoice({
        memberId: "",
        membershipId: "",
        memberName: "",
        memberEmail: "",
        planType: "",
        amount: "",
        dueDate: "",
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Error generating invoice");
    } finally {
      setLoading(false);
    }
  };

  // CSV Export helper
  const exportCSV = (rows: Invoice[]) => {
    if (!rows || rows.length === 0) {
      toast.error("No invoices to export");
      return;
    }
    const headers = [
      "Invoice Number",
      "Member Name",
      "Member Email",
      "Plan",
      "Amount (INR)",
      "Issue Date",
      "Due Date",
      "Status",
      "Late Fee",
    ];
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        [
          escapeCsv(r.invoiceNumber),
          escapeCsv(r.memberName),
          escapeCsv(r.memberEmail || ""),
          escapeCsv(r.planType),
          r.amount.toFixed(2),
          new Date(r.issueDate).toLocaleDateString(),
          new Date(r.dueDate).toLocaleDateString(),
          r.status,
          (r.lateFee || 0).toFixed(2),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export started");
  };

  const escapeCsv = (val: string | number) =>
    String(val ?? "").replaceAll('"', '""').includes(",")
      ? `"${String(val ?? "").replaceAll('"', '""')}"`
      : String(val ?? "");

  // small handlers
  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  // ------------------- New: View modal & printing -------------------
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const openViewModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewOpen(true);
  };

  const closeViewModal = () => {
    setViewOpen(false);
    setSelectedInvoice(null);
  };

  const printInvoice = (invoice: Invoice) => {
    // NOTE: Avoid using "noopener,noreferrer" in the features when you need to access the new window.
    const w = window.open("", "_blank");
    if (!w) {
      toast.error("Unable to open print window");
      return;
    }

    const issueDate = new Date(invoice.issueDate).toLocaleDateString();
    const dueDate = new Date(invoice.dueDate).toLocaleDateString();
    const amount = formatCurrency(invoice.amount);
    const lateFee = formatCurrency(invoice.lateFee || 0);

    // use gym info if available, otherwise fall back to defaults
    const gymName = gym?.name ? escapeHtml(gym.name) : "Your Company / Gym";
    const gymAddress = gym?.address ? escapeHtml(gym.address) : "Address line 1<br/>Address line 2";
    const gymPhone = gym?.phone ? escapeHtml(gym.phone) : "";
    const gymEmail = gym?.email ? escapeHtml(gym.email) : "support@example.com";
    const gymLogo = gym?.logo_url ? String(gym.logo_url) : null;

    const html = `<!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; margin: 20px; color: #111827; }
          .invoice { max-width: 800px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 24px; border-radius: 8px; }
          .header { display:flex; justify-content:space-between; align-items:center; gap:12px; }
          .brand { font-size: 18px; font-weight: 700; display:flex; align-items:center; gap:12px; }
          .meta { text-align: right; font-size: 13px; color: #374151; }
          .section { margin-top: 18px; }
          table { width:100%; border-collapse: collapse; margin-top: 12px; }
          th, td { padding: 8px 10px; border: 1px solid #e5e7eb; text-align:left; }
          .totals td { border: none; }
          .right { text-align: right; }
          .small { font-size: 13px; color: #6b7280; }
          img.logo { max-height: 56px; object-fit: contain; }
          @media print {
            body { margin:0; }
            .invoice { border: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <div class="brand">
              ${gymLogo ? `<img src="${escapeHtml(gymLogo)}" alt="${gymName}" class="logo" />` : ""}
              <div>
                <div style="font-weight:700">${gymName}</div>
                <div class="small">${gymAddress}${gymPhone ? `<br/>Phone: ${gymPhone}` : ""}${gymEmail ? `<br/>Email: ${gymEmail}` : ""}</div>
              </div>
            </div>
            <div class="meta">
              <div>Invoice: <strong>${escapeHtml(invoice.invoiceNumber)}</strong></div>
              <div>Date: ${issueDate}</div>
              <div>Due: ${dueDate}</div>
            </div>
          </div>

          <div class="section">
            <strong>Bill To</strong>
            <div class="small">${escapeHtml(invoice.memberName)}${invoice.memberEmail ? ` <br/> ${escapeHtml(invoice.memberEmail)}` : ""}</div>
          </div>

          <div class="section">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${escapeHtml(invoice.planType || "Membership")}</td>
                  <td class="right">${amount}</td>
                </tr>
                <tr>
                  <td>Late Fee</td>
                  <td class="right">${lateFee}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td style="text-align:right"><strong>Total</strong></td>
                  <td class="right"><strong>${formatCurrency((invoice.amount || 0) + (invoice.lateFee || 0))}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="section small">
            <div>Status: <strong>${escapeHtml(invoice.status)}</strong></div>
            <div style="margin-top:10px;">Thank you for your payment. If you have any questions, contact ${escapeHtml(gymEmail)}</div>
          </div>
        </div>

        <script>
          // Wait for window load, give a short delay to ensure rendering, then print and close.
          function doPrint() {
            try {
              window.focus();
              // small delay ensures fonts/CSS paint before printing
              setTimeout(() => {
                window.print();
                // close after print dialog shown (give user some time)
                setTimeout(() => { try { window.close(); } catch(e){} }, 1500);
              }, 500);
            } catch (e) {
              console.error(e);
            }
          }
          if (document.readyState === 'complete') {
            doPrint();
          } else {
            window.addEventListener('load', doPrint);
          }
        </script>
      </body>
      </html>`;

    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const escapeHtml = (str: string | undefined) => {
    if (!str) return "";
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  };
  // ------------------- End view/print additions -------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2 font-semibold">Invoice Management</h1>
          <p className="text-muted-foreground">Track payments, manage billing, and handle overdue accounts.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportCSV(filteredInvoices)}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button
            className="bg-gradient-to-r from-neon-green to-neon-blue text-white"
            onClick={() => setOpenModal(true)}
          >
            <FileText className="w-4 h-4 mr-2" /> Generate Invoice
          </Button>
        </div>
      </div>

      {/* Modal (Generate) */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogDescription>Fill the details to create a new invoice.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Member</Label>
              <Select
                value={newInvoice.memberId || "none"}
                onValueChange={(val) => {
                  if (val === "none") return;
                  onSelectMember(val);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>
                    -- Select member --
                  </SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} {m.email ? `(${m.email})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Membership</Label>
              <Select
                value={newInvoice.membershipId || "none"}
                onValueChange={(val) => {
                  if (val === "none") return;
                  onSelectMembership(val);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a membership" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>
                    -- Select membership --
                  </SelectItem>
                  {memberships.map((ms) => (
                    <SelectItem key={ms.id} value={ms.id}>
                      {ms.name} {ms.price ? `(${formatCurrency(Number(ms.price))})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Member Name</Label>
              <Input
                placeholder="Enter member name"
                value={newInvoice.memberName}
                onChange={(e) => setNewInvoice({ ...newInvoice, memberName: e.target.value })}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                placeholder="Enter email"
                value={newInvoice.memberEmail}
                onChange={(e) => setNewInvoice({ ...newInvoice, memberEmail: e.target.value })}
              />
            </div>

            <div>
              <Label>Plan Type</Label>
              <Input
                placeholder="e.g. Gold, Silver"
                value={newInvoice.planType}
                onChange={(e) => setNewInvoice({ ...newInvoice, planType: e.target.value })}
              />
            </div>

            <div>
              <Label>Amount (INR)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={newInvoice.amount}
                onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddInvoice} disabled={loading}>
              {loading ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Modal */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>View the invoice and print the bill.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {selectedInvoice ? (
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">Invoice: {selectedInvoice.invoiceNumber}</h3>
                    <div className="text-sm text-muted-foreground">{selectedInvoice.planType}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">Issue: {new Date(selectedInvoice.issueDate).toLocaleDateString()}</div>
                    <div className="text-sm">Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</div>
                    <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Billed To</h4>
                    <div className="mt-1">
                      <div className="font-medium">{selectedInvoice.memberName}</div>
                      <div className="text-xs text-muted-foreground">{selectedInvoice.memberEmail}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium">Summary</h4>
                    <div className="mt-1 text-sm">
                      <div>Amount: <strong>{formatCurrency(selectedInvoice.amount)}</strong></div>
                      <div>Late Fee: <strong>{formatCurrency(selectedInvoice.lateFee || 0)}</strong></div>
                      <div className="mt-2 text-lg">Total: <strong>{formatCurrency((selectedInvoice.amount || 0) + (selectedInvoice.lateFee || 0))}</strong></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <Button onClick={() => printInvoice(selectedInvoice)}>
                    <Printer className="w-4 h-4 mr-2" /> Print Bill
                  </Button>
                  <Button variant="outline" onClick={closeViewModal}>Close</Button>
                </div>
              </div>
            ) : (
              <div>No invoice selected.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Revenue", value: formatCurrency(totals.totalAmount), icon: <DollarSign className="h-4 w-4 text-neon-green" /> },
          { title: "Collected", value: formatCurrency(totals.paidAmount), icon: <CheckCircle className="h-4 w-4 text-neon-green" /> },
          { title: "Outstanding", value: formatCurrency(totals.pendingAmount), icon: <Clock className="h-4 w-4 text-yellow-500" /> },
          { title: "Late Fees", value: formatCurrency(totals.lateFees), icon: <AlertTriangle className="h-4 w-4 text-red-500" /> },
        ].map((c, i) => (
          <Card key={i} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">{c.title}</CardTitle>
              {c.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Filter */}
      <Card className="border-border/50">
        <CardContent className="p-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name or invoice..."
              value={searchTerm}
              onChange={onSearchChange}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({totals.all})</SelectItem>
              <SelectItem value="paid">Paid ({totals.paid})</SelectItem>
              <SelectItem value="pending">Pending ({totals.pending})</SelectItem>
              <SelectItem value="overdue">Overdue ({totals.overdue})</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
          <CardDescription>Latest billing records</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading invoices...</div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No invoices found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoiceNumber}</TableCell>
                        <TableCell>
                          <div className="font-medium">{invoice.memberName}</div>
                          <div className="text-xs text-muted-foreground">{invoice.memberEmail}</div>
                        </TableCell>
                        <TableCell>{invoice.planType}</TableCell>
                        <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              onClick={() => openViewModal(invoice)}
                              title="View invoice"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default InvoiceManagement;