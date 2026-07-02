"use client";

import { useRouter } from "next/navigation";
import MessagesView from "@/components/messages/MessageView";
import { useMessagesData } from "./layout";

export default function MessagesPage() {
  const router = useRouter();
  const { conversations, mutualUsers, token, loading } = useMessagesData();

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-72px)] w-full items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <MessagesView
      conversations={conversations}
      mutualUsers={mutualUsers}
      token={token}
      urlUserId={null}
      onClose={() => router.push("/")}
    />
  );
}
