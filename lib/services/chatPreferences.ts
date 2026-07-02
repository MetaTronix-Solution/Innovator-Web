export async function setChatDeletionPreference(
  chatPartner: string,
  preference: "24_hours" | "never",
) {
  const res = await fetch("/api/chat-preferences", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_partner: chatPartner,
      deletion_preference: preference,
    }),
  });
  if (!res.ok) throw new Error("Failed to update chat preference");
  return res.json();
}
