import { useState, useCallback } from "react";

export function useDeleteMessage() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteMessage = useCallback(async ({
    messageId,
    deleteType,
  }: {
    messageId: string;
    deleteType: "for_me" | "for_everyone";
  }) => {
    if (!messageId || messageId.toString().length < 20) {
      console.error("Invalid Message ID, skipping delete:", messageId);
      setError("Message not yet synced. Please wait or refresh.");
      return false;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/chats/${messageId}/delete-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delete_type: deleteType,
        }),
      });

      if (!res.ok) throw new Error("Failed to delete");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return { deleteMessage, isDeleting, error };
}
