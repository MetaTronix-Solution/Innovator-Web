"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Loader2, X, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/authService";
import { clearCredentials } from "@/lib/store/features/authSlice";
import { useDispatch } from "react-redux";
import { signOut } from "next-auth/react";

interface ChangePasswordModalProps {
  onClose: () => void;
}

export default function ChangePasswordModal({
  onClose,
}: ChangePasswordModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ current: "", new: "", confirm: "" });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.new !== form.confirm)
      return toast.error("New passwords do not match");

    setLoading(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_password: form.current,
          new_password: form.new,
          confirm_password: form.confirm,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to change password");
      }

      toast.success("Password updated! Please log in again.");

      try {
        await authService.logout();
      } catch (error) {
        console.error("Logout service error:", error);
      } finally {
        dispatch(clearCredentials());
        await signOut({ redirect: false });

        setForm({ current: "", new: "", confirm: "" });
        router.push("/login");
        router.refresh();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ff6b00]/30 transition-all pr-10";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-lg text-slate-900">Change Password</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password Field */}
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              placeholder="Current password"
              className={inputCls}
              onChange={(e) => setForm({ ...form, current: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* New Password Field */}
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              placeholder="New password"
              className={inputCls}
              onChange={(e) => setForm({ ...form, new: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm new password"
              className={inputCls}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff6b00] text-white py-3 rounded-xl font-semibold hover:bg-[#e55f00] flex items-center justify-center gap-2 transition-all"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
