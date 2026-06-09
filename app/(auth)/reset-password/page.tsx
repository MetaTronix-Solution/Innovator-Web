"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
  KeyRound,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");
  const otp = searchParams.get("otp");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rules = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "At least one number", pass: /\d/.test(password) },
    {
      label: "One special character (@#$ %^&*)",
      pass: /[@#$%^&*]/.test(password),
    },
  ];

  useEffect(() => {
    if (!email || !otp) router.push("/forgot-password");
  }, [email, otp, router]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIsSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-4 text-center">
        <div className="max-w-md w-full space-y-4 animate-in fade-in zoom-in duration-300">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Password Reset Complete</h1>
          <p className="text-muted-foreground">
            Your password has been updated. Redirecting you to login...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card p-8 rounded-xl border border-border shadow-sm space-y-6">
        {/* Icon header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <KeyRound className="h-7 w-7 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Reset your password
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create a new, strong password to secure your account.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 pr-10 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Password rules */}
          {password.length > 0 && (
            <ul className="space-y-1.5">
              {rules.map((rule) => (
                <li
                  key={rule.label}
                  className="flex items-center gap-2 text-sm"
                >
                  {rule.pass ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span
                    className={
                      rule.pass
                        ? "text-green-600 dark:text-green-400"
                        : "text-muted-foreground"
                    }
                  >
                    {rule.label}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 pr-10 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !password || !rules.every((r) => r.pass)}
            className="w-full h-11"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Update Password"
            )}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
