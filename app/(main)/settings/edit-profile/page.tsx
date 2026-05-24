"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Camera, Loader2, User, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getProfile,
  updateProfile,
  updateAvatar,
  ProfileUpdatePayload,
} from "@/lib/services/profileService";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";

const GENDER_OPTIONS = ["male", "female", "other", "prefer_not_to_say"];

const inputCls =
  "w-full bg-background border border-input rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State for changes
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
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
            ? data.date_of_birth.split("T")[0]
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (avatarFile) {
        await updateAvatar(avatarFile);
      }

      const payload: ProfileUpdatePayload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v === "" ? null : v]),
      ) as ProfileUpdatePayload;

      await updateProfile(payload);

      toast.success("Profile updated successfully!");
      router.back();
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-accent text-foreground"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-8 bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm"
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-28 h-28 rounded-full border-4 border-accent overflow-hidden bg-muted flex items-center justify-center relative shadow-sm">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="avatar"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <User size={48} className="text-muted-foreground" />
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={32} className="text-white" />
                </div>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-semibold text-primary"
            >
              Change profile photo
            </button>
          </div>

          <div className="space-y-6">
            <Field label="Full name">
              <input
                name="full_name"
                value={form.full_name ?? ""}
                onChange={handleChange}
                className={inputCls}
              />
            </Field>
            <Field label="Bio">
              <textarea
                name="bio"
                value={form.bio ?? ""}
                onChange={handleChange}
                rows={4}
                className={`${inputCls} resize-none`}
              />
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Occupation">
                <input
                  name="occupation"
                  value={form.occupation ?? ""}
                  onChange={handleChange}
                  className={inputCls}
                />
              </Field>
              <Field label="Education">
                <input
                  name="education"
                  value={form.education ?? ""}
                  onChange={handleChange}
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
                      {g.replace(/_/g, " ").toUpperCase()}
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
            </div>
            <Field label="Phone number">
              <input
                name="phone_number"
                value={form.phone_number ?? ""}
                onChange={handleChange}
                type="tel"
                className={inputCls}
              />
            </Field>
            <Field label="Address">
              <input
                name="address"
                value={form.address ?? ""}
                onChange={handleChange}
                className={inputCls}
              />
            </Field>
            <Field label="Hobbies">
              <input
                name="hobbies"
                value={form.hobbies ?? ""}
                onChange={handleChange}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="pt-6 border-t border-border flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 rounded-full text-sm font-semibold text-muted-foreground hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 size={16} className="animate-spin" />} Save
              Changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
