import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { toast } from "sonner";
import authService from "../service/authService";
import { Eye, EyeOff } from "lucide-react";

export function ResetPassword() {
    const [form, setForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [submitting, setSubmitting] = useState(false);

    const { oldPassword, newPassword, confirmPassword } = form;

    // visibility toggles for each field
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    /* ---- Handlers ---- */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
            toast.error("All fields are required");
            return;
        }

        if (form.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            toast.error("New password and confirm password must match");
            return;
        }

        let tId: string | number | undefined;
        try {
            setSubmitting(true);

            // create a loading toast and capture its id so we can update it later
            tId = toast.loading("Resetting password...");

            // ✅ Send as two separate string args (authService expects two args)
            await authService.changePassword(form.oldPassword, form.newPassword);

            // update the same toast to success (prevents lingering loading toast)
            toast.success("Password reset successfully!", { id: tId });

            setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err: any) {
            console.error("❌ reset password error:", err);
            // update the same toast to error if we had a loading toast
            toast.error(err?.message || "Failed to reset password", { id: tId });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center top-[50%] px-4">
            <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="w-full max-w-md"
            >
                <Card className="border-border/40 shadow-sm rounded-2xl">
                    <CardHeader className="space-y-1">
                        {/* reduced title size on mobile */}
                        <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                            Reset Password
                        </CardTitle>
                        {/* reduced description size on mobile */}
                        <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                            Update your password securely
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-3">

                            {/* Old Password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="oldPassword" className="text-xs sm:text-sm">Old Password *</Label>
                                <div className="relative">
                                    <Input
                                        id="oldPassword"
                                        type={showOld ? "text" : "password"}
                                        name="oldPassword"
                                        value={oldPassword}
                                        onChange={handleChange}
                                        placeholder="Enter old password"
                                        required
                                        className="text-sm sm:text-base"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOld(s => !s)}
                                        aria-label={showOld ? "Hide old password" : "Show old password"}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                                    >
                                        {showOld ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="newPassword" className="text-xs sm:text-sm">New Password *</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showNew ? "text" : "password"}
                                        name="newPassword"
                                        value={newPassword}
                                        onChange={handleChange}
                                        placeholder="Enter new password"
                                        required
                                        className="text-sm sm:text-base"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew(s => !s)}
                                        aria-label={showNew ? "Hide new password" : "Show new password"}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                                    >
                                        {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">Confirm Password *</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirm ? "text" : "password"}
                                        name="confirmPassword"
                                        value={confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Re-enter new password"
                                        required
                                        className="text-sm sm:text-base"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(s => !s)}
                                        aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                                    >
                                        {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={submitting}
                                >
                                    {submitting ? "Updating..." : "Reset Password"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

export default ResetPassword;
