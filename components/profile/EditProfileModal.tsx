"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Camera, Loader2, User, X } from "lucide-react";
import {
  getProfile,
  updateProfile,
  updateAvatar,
  ProfileUpdatePayload,
} from "@/lib/services/profileService";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";

const GENDER_OPTIONS = ["male", "female", "other", "prefer_not_to_say"];

interface EditProfileModalProps {
  onClose: () => void;
  onUpdated: (updatedProfile: any) => void;
}

const inputCls =
  "w-full bg-muted/40 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ff6b00]/30 focus:border-[#ff6b00]/50 transition-all placeholder:text-slate-400";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function EditProfileModal({
  onClose,
  onUpdated,
}: EditProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [form, setForm] = useState<ProfileUpdatePayload>({
    full_name: "",
    phone_number: "",
    gender: "",
    date_of_birth: "",
    address: "",
    hobbies: "",
    bio: "",
    occupation: "",
    education: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProfile();
        setForm({
          full_name: data.full_name ?? "",
          phone_number: data.phone_number ?? "",
          gender: data.gender ?? "",
          date_of_birth: data.date_of_birth
            ? data.date_of_birth.split("T")[0] // strip time if present
            : "",
          address: data.address ?? "",
          hobbies: data.hobbies ?? "",
          bio: data.bio ?? "",
          occupation: data.occupation ?? "",
          education: data.education ?? "",
        });
        if (data.avatar) setAvatarPreview(getMediaUrl(data.avatar));
      } catch (err: any) {
        toast.error(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    try {
      const updated = await updateAvatar(file);
      onUpdated(updated);
      toast.success("Avatar updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: ProfileUpdatePayload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v === "" ? null : v]),
      ) as ProfileUpdatePayload;
      const updated = await updateProfile(payload);
      onUpdated(updated);
      toast.success("Profile updated!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h2 className="font-bold text-lg text-slate-900">Edit Profile</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-1.5 bg-[#ff6b00] text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-[#e55f00] disabled:opacity-50 transition-colors"
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              Save
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-5">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={28} className="animate-spin text-slate-400" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-2 pb-2">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center relative">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="avatar"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <User size={30} className="text-slate-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute bottom-0 right-0 w-7 h-7 bg-[#ff6b00] text-white rounded-full flex items-center justify-center shadow border-2 border-white hover:bg-[#e55f00] transition-colors"
                  >
                    {avatarUploading ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Camera size={12} />
                    )}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <p className="text-xs text-slate-400">
                  Tap camera to change photo
                </p>
              </div>

              <Field label="Full name">
                <input
                  name="full_name"
                  value={form.full_name ?? ""}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className={inputCls}
                />
              </Field>

              <Field label="Bio">
                <textarea
                  name="bio"
                  value={form.bio ?? ""}
                  onChange={handleChange}
                  placeholder="Tell people about yourself…"
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </Field>

              <Field label="Occupation">
                <input
                  name="occupation"
                  value={form.occupation ?? ""}
                  onChange={handleChange}
                  placeholder="e.g. Software engineer"
                  className={inputCls}
                />
              </Field>

              <Field label="Education">
                <input
                  name="education"
                  value={form.education ?? ""}
                  onChange={handleChange}
                  placeholder="e.g. BSc Computer Science"
                  className={inputCls}
                />
              </Field>

              <Field label="Phone number">
                <input
                  name="phone_number"
                  value={form.phone_number ?? ""}
                  onChange={handleChange}
                  placeholder="+977 98XXXXXXXX"
                  type="tel"
                  className={inputCls}
                />
              </Field>

              <Field label="Gender">
                <select
                  name="gender"
                  value={form.gender ?? ""}
                  onChange={handleChange}
                  className={inputCls}
                >
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Date of birth">
                <input
                  name="date_of_birth"
                  value={form.date_of_birth ?? ""}
                  onChange={handleChange}
                  type="date"
                  className={inputCls}
                />
              </Field>

              <Field label="Address">
                <input
                  name="address"
                  value={form.address ?? ""}
                  onChange={handleChange}
                  placeholder="City, Country"
                  className={inputCls}
                />
              </Field>

              <Field label="Hobbies">
                <input
                  name="hobbies"
                  value={form.hobbies ?? ""}
                  onChange={handleChange}
                  placeholder="e.g. Hiking, Photography"
                  className={inputCls}
                />
              </Field>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
