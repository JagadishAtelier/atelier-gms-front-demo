// src/pages/membership/MemberRenewal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { toast } from "sonner";
import { CreditCard, Clock } from "lucide-react";

/**
 * MemberRenewal.tsx
 * Member-facing renewal flow with Razorpay checkout (dummy-data + fallback).
 *
 * Replace /api/* endpoints below with your real server routes:
 * - POST /api/razorpay/create-order  { amount: number(in paise), currency: 'INR', receipt?: string } => { id: order_id, amount, currency }
 * - POST /api/razorpay/verify-payment {razorpay_order_id, razorpay_payment_id, razorpay_signature} => verify server-side
 *
 * NOTE: For security, always verify signature at your server after payment.
 */

/* ---------- Dummy member + membership options ---------- */
const DUMMY_MEMBER = {
  id: "m_1001",
  name: "Amit Kumar",
  email: "amit@example.com",
  phone: "+919876543210",
  planType: "Pro - Monthly",
  nextBilling: null,
};

const DUMMY_PLANS = [
  { id: "basic", name: "Basic", durationMonths: 1, price: 499 }, // rupees
  { id: "standard", name: "Standard", durationMonths: 1, price: 799 },
  { id: "pro", name: "Pro", durationMonths: 1, price: 1299 },
];

/* ---------- helper: dynamically load Razorpay script ---------- */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    const id = "razorpay-checkout-js";
    if (document.getElementById(id)) return resolve(true);
    const script = document.createElement("script");
    script.id = id;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/* ---------- main component ---------- */
export default function MemberRenewal() {
  const [member] = useState(DUMMY_MEMBER);
  const [plans] = useState(DUMMY_PLANS);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[1].id); // default Standard
  const [months, setMonths] = useState<number>(1);
  const [coupon, setCoupon] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isPaying, setIsPaying] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const RAZORPAY_KEY = "rzp_test_RM7CflLXabVnaU";

  const selectedPlan = useMemo(() => plans.find((p) => p.id === selectedPlanId) || plans[0], [plans, selectedPlanId]);

  const baseAmount = selectedPlan.price * months; // rupees
  const discountAmount = Math.round((baseAmount * discountPercent) / 100);
  const finalAmount = baseAmount - discountAmount;
  const finalAmountPaise = finalAmount * 100; // Razorpay takes paise

  useEffect(() => {
    // If you have coupon APIs, validate coupon here and set discountPercent accordingly.
    if (!coupon) {
      setDiscountPercent(0);
    } else {
      // demo: hardcoded coupon "FIT10" => 10% off
      if (coupon.trim().toUpperCase() === "FIT10") setDiscountPercent(10);
      else setDiscountPercent(0);
    }
  }, [coupon]);

  async function handleStartPayment() {
    setDialogOpen(true);
  }

  async function handlePayConfirmed() {
    setIsPaying(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment SDK. Please try again later.");
        setIsPaying(false);
        return;
      }

      // === Recommended: create an ORDER on your backend and pass order_id here ===
      // Example (uncomment & change URL to your backend):
      // const orderResp = await fetch('/api/razorpay/create-order', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ amount: finalAmountPaise, currency: 'INR', receipt: `rcpt_${member.id}_${Date.now()}` })
      // });
      // const orderData = await orderResp.json();
      // const orderId = orderData.id; // server should return order id

      // For demo / fallback we skip server order creation (not recommended for production).
      // Razorpay supports a checkout without server order by not passing 'order_id' (less secure).
      const options: any = {
        key: RAZORPAY_KEY,
        amount: finalAmountPaise, // paise
        currency: "INR",
        name: "Your Gym / Fitness App",
        description: `${selectedPlan.name} — ${months} month(s)`,
        // order_id: orderId, // if using server-created order
        handler: async function (response: any) {
          // response.razorpay_payment_id
          // response.razorpay_order_id (if order)
          // response.razorpay_signature (if order)

          // IMPORTANT: For real apps, verify signature at your server:
          // POST /api/razorpay/verify-payment with above 3 values
          // server should verify HMAC-SHA256 and return success/failure.

          // For demo, we'll just show success toast and close dialog.
          toast.success("Payment successful — payment id: " + (response?.razorpay_payment_id || "unknown"));
          setDialogOpen(false);

          // TODO: call backend to record the payment & extend membership
          // await fetch('/api/member/renew', { method:'POST', body: JSON.stringify({ memberId: member.id, planId: selectedPlan.id, months, payment: response }) });

          setIsPaying(false);
        },
        prefill: {
          name: member.name,
          email: member.email,
          contact: member.phone,
        },
        notes: {
          member_id: member.id,
          plan_id: selectedPlan.id,
          months: String(months),
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: function () {
            setIsPaying(false);
            toast.message("Payment window closed");
          },
        },
      };

      // If you created an order on server, include order_id: options.order_id = orderId

      // open checkout
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Payment failed", err);
      toast.error(err?.message || "Payment failed");
      setIsPaying(false);
    }
  }

  return (
    <div className="space-y-6 px-2 md:px-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Renew Membership</h1>
          <p className="text-muted-foreground mt-1">Renew or extend your plan and make secure payments via Razorpay.</p>
        </div>
        <div className="text-sm text-muted-foreground">Member: <strong>{member.name}</strong></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Choose plan</CardTitle>
            <CardDescription>Select the membership plan you want to renew</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Plan</label>
              <Select value={selectedPlanId} onValueChange={(v: string) => setSelectedPlanId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} — ₹{p.price} / month</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Duration (months)</label>
              <div className="flex gap-2">
                {[1, 3, 6, 12].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMonths(m)}
                    className={`px-3 py-1 rounded ${months === m ? "bg-slate-800 text-white" : "bg-transparent border"}`}
                  >
                    {m} {m === 1 ? "month" : "months"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Coupon (optional)</label>
              <Input placeholder="Enter coupon code (e.g. FIT10)" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
              {discountPercent > 0 && <div className="text-xs text-green-600 mt-1">Applied: {discountPercent}% off</div>}
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Subtotal</div>
                <div className="text-sm">₹{baseAmount.toLocaleString()}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Discount</div>
                <div className="text-sm">- ₹{discountAmount.toLocaleString()}</div>
              </div>
              <div className="flex items-center justify-between font-semibold text-lg pt-2">
                <div>Total</div>
                <div>₹{finalAmount.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleStartPayment} className="bg-gradient-to-r from-neon-green to-neon-blue text-white" disabled={isPaying}>
                <CreditCard className="w-4 h-4 mr-2" /> Proceed to Pay
              </Button>

              <Button variant="outline" onClick={() => toast.message("You can cancel this anytime")}>Cancel</Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <Clock className="inline-block mr-1" /> Payment powered by Razorpay. For production, the server should create orders and verify signatures.
            </div>
          </CardContent>
        </Card>

        {/* Right column: summary / preview */}
        <Card className="p-4 md:col-span-2">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Review before payment</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{selectedPlan.name} Plan</div>
                <div className="text-xs text-muted-foreground">{selectedPlan.price} ₹ per month</div>
              </div>
              <Badge>{months} {months === 1 ? "month" : "months"}</Badge>
            </div>

            <div className="bg-muted/10 p-3 rounded">
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm text-muted-foreground">Member</div>
                <div className="text-sm">{member.name}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="text-sm">{member.email}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm">You will be charged</div>
              <div className="text-2xl font-semibold">₹{finalAmount.toLocaleString()}</div>
            </div>

            <div className="text-xs text-muted-foreground">Note: For demo, this uses a client-side Razorpay checkout. In production your server must create orders and verify payment signatures.</div>
          </CardContent>
        </Card>
      </div>

      {/* Confirm Payment dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
          </DialogHeader>

          <div className="p-4">
            <div className="mb-2">You're about to pay <strong>₹{finalAmount.toLocaleString()}</strong> for the <strong>{selectedPlan.name}</strong> plan ({months} {months === 1 ? "month" : "months"}).</div>
            <div className="text-xs text-muted-foreground mb-4">Click "Pay Now" to open the secure Razorpay checkout window.</div>

            <div className="flex gap-2">
              <Button onClick={() => { setDialogOpen(false); }} variant="outline">Cancel</Button>
              <Button onClick={handlePayConfirmed} className="bg-gradient-to-r from-neon-green to-neon-blue text-white" disabled={isPaying}>
                {isPaying ? "Opening..." : "Pay Now"}
              </Button>
            </div>
          </div>

          <DialogFooter />
        </DialogContent>
      </Dialog>
    </div>
  );
}
