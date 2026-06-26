import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useBlockUser() {
  const [blocking, setBlocking] = useState(false);
  const router = useRouter();

  const blockUser = async (targetId: string, onSuccess?: () => void) => {
    setBlocking(true);
    try {
      const res = await fetch(`/api/users/${targetId}/block/`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to block user");
      toast.success("User blocked");
      onSuccess?.();
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to block user");
    } finally {
      setBlocking(false);
    }
  };

  return { blockUser, blocking };
}
