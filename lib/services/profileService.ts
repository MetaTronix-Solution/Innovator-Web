export interface ProfileUpdatePayload {
  full_name?: string;
  phone_number?: string | null;
  gender?: string;
  date_of_birth?: string | null;
  address?: string | null;
  hobbies?: string | null;
  bio?: string | null;
  occupation?: string | null;
  education?: string | null;
}

export const getProfile = async () => {
  const res = await fetch("/api/profile/", { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch profile");
  return data;
};

export const updateProfile = async (payload: ProfileUpdatePayload) => {
  const res = await fetch("/api/profile/", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update profile");
  return data;
};

export const updateAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await fetch("/api/profile/avatar/", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update avatar");
  return data;
};
