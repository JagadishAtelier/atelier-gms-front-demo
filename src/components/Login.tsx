// src/components/Login.tsx
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Dumbbell, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import authService from "../service/authService.js";

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // show/hide password states
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showFpNewPassword, setShowFpNewPassword] = useState<boolean>(false);
  const [showFpConfirmPassword, setShowFpConfirmPassword] = useState<boolean>(false);

  // forgot password page state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [fpStep, setFpStep] = useState<"email" | "verify">("email");
  const [fpEmail, setFpEmail] = useState<string>("");
  const [fpOtpToken, setFpOtpToken] = useState<string | null>(null);
  const [fpOtp, setFpOtp] = useState<string>("");
  const [fpNewPassword, setFpNewPassword] = useState<string>("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState<string>("");
  const [fpLoading, setFpLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login(identifier, password);
      toast.success(`Welcome, ${response?.user?.username || "User"}!`);
      onLogin();
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error(error?.response?.data?.message || error?.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- Forgot password handlers ---------- */
  const openForgot = () => {
    setForgotOpen(true);
    setFpStep("email");
    setFpEmail("");
    setFpOtpToken(null);
    setFpOtp("");
    setFpNewPassword("");
    setFpConfirmPassword("");
  };

  const closeForgot = () => {
    // now acts as "back to login page"
    setForgotOpen(false);
    setFpStep("email");
    setFpEmail("");
    setFpOtpToken(null);
    setFpOtp("");
    setFpNewPassword("");
    setFpConfirmPassword("");
  };

  // Step 1: request OTP for email
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fpEmail) {
      toast.error("Please enter your registered email");
      return;
    }
    try {
      setFpLoading(true);
      const res = await authService.forgotPassword(fpEmail);
      // backend returns { otp_token }
      const otp_token = res?.otp_token ?? res?.data?.otp_token ?? null;
      setFpOtpToken(otp_token);
      setFpStep("verify");
      toast.success("OTP sent to your email");
    } catch (err: any) {
      console.error("Failed to send OTP:", err);
      toast.error(err?.message || "Failed to send OTP");
    } finally {
      setFpLoading(false);
    }
  };

  // Step 2: verify OTP + reset password
  const handleResetWithOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fpOtpToken) {
      toast.error("OTP token missing. Request a new OTP.");
      return;
    }
    if (!fpOtp || !fpNewPassword || !fpConfirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (fpNewPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (fpNewPassword !== fpConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setFpLoading(true);
      await authService.resetPasswordWithOtp({
        email: fpEmail,
        otp: fpOtp,
        otp_token: fpOtpToken,
        newPassword: fpNewPassword,
      });
      toast.success("Password has been reset. You can login now.");
      // go back to login page and clear
      closeForgot();
    } catch (err: any) {
      console.error("Reset password failed:", err);
      toast.error(err?.message || "Failed to reset password");
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-3 bg-gradient-to-r from-neon-green to-neon-blue rounded-xl">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl text-center text-foreground font-bold">Atelier Fit</h1>
          <p className="text-muted-foreground text-center mt-1">Gym Management System</p>
        </div>

        {/* --- Conditional: show Forgot Password "page" or Login --- */}
        {forgotOpen ? (
          // Forgot Password "page" (keeps same card design, white bg + black text)
          <Card className="border-border/50 shadow-2xl bg-white text-black">
            <CardHeader className="space-y-1">
              <CardTitle className="text-center text-lg font-semibold" style={{color:"#fff"}}>Forgot Password</CardTitle>
              <CardDescription className="text-center text-sm">Reset your account password</CardDescription>
            </CardHeader>

            <CardContent>
              {/* Back button at top */}
              <div className="mb-3">
                <Button type="button" variant="ghost" onClick={closeForgot} className="px-2" style={{color:"#fff"}}>
                  ← Back to Sign In
                </Button>
              </div>

              {fpStep === "email" ? (
                <form onSubmit={handleRequestOtp} className="space-y-3">
                  <div>
                    <Label htmlFor="fpEmail" style={{color:"#fff" ,marginBottom:"5px"}}>Registered Email</Label>
                    <Input
                      id="fpEmail"
                      type="email"
                      placeholder="you@example.com"
                      style={{color:"#fff"}}
                      value={fpEmail}
                      onChange={(e) => setFpEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={fpLoading}>
                      {fpLoading ? "Sending OTP..." : "Send OTP"}
                    </Button>
                    <Button style={{color:"#fff"}} type="button" variant="ghost" onClick={closeForgot} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetWithOtp} className="space-y-3">
                  <div>
                    <Label>OTP Token</Label>
                    <div className="text-sm break-words text-black">{fpOtpToken ?? "—"}</div>
                  </div>

                  <div>
                    <Label htmlFor="fpOtp" style={{color:"#fff"}}>OTP</Label>
                    <Input id="fpOtp" style={{color:"#fff"}} value={fpOtp} onChange={(e) => setFpOtp(e.target.value)} required />
                  </div>

                  <div>
                    <Label htmlFor="fpNewPassword" style={{color:"#fff"}}>New Password</Label>
                    <div className="relative">
                      <Input
                        id="fpNewPassword"
                        style={{color:"#fff"}}
                        type={showFpNewPassword ? "text" : "password"}
                        value={fpNewPassword}
                        onChange={(e) => setFpNewPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        aria-label={showFpNewPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowFpNewPassword((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                      >
                        {showFpNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label style={{color:"#fff"}} htmlFor="fpConfirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="fpConfirmPassword"
                        style={{color:"#fff"}}
                        type={showFpConfirmPassword ? "text" : "password"}
                        value={fpConfirmPassword}
                        onChange={(e) => setFpConfirmPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        aria-label={showFpConfirmPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowFpConfirmPassword((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                      >
                        {showFpConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={fpLoading}>
                      {fpLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                    <Button style={{color:"#fff"}} type="button" variant="ghost" onClick={() => { setFpStep("email"); setFpOtpToken(null); }}>
                      Request New OTP
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        ) : (
          // Original Login Card (unchanged logic & layout)
          <Card className="border-border/50 shadow-2xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-center text-lg font-semibold">Welcome Back!</CardTitle>
              <CardDescription className="text-center text-sm">Sign in to continue</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="identifier">Email or Phone</Label>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="owner@example.com or 9876543210"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-neon-green to-neon-blue text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>

                <div className="flex justify-between items-center mt-2 text-xs sm:text-sm">
                  <button
                    type="button"
                    onClick={openForgot}
                    className="text-primary underline"
                  >
                    Forgot password?
                  </button>
                  <span className="text-muted-foreground">Use your registered email</span>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <p className="text-xs text-muted-foreground text-center mt-4">
          Use your registered email or phone to log in.
        </p>
      </div>
    </div>
  );
};

export default Login;
