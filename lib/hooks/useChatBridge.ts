import { useEffect, useRef, useState } from "react";

const getWsUrl = () => {
  const base = process.env.NEXT_PUBLIC_WS_URL || "";
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    return base.replace(/^ws:\/\//, "wss://");
  }
  return base;
};

export const useChatBridge = (
  receiveRoomId: string | null,
  sendRoomId: string | null,
  receiverToken: string | null,
  senderToken: string | null,
  onMessage: (data: any) => void,
) => {
  const [isSendReady, setIsSendReady] = useState(false);
  const [isReceiveReady, setIsReceiveReady] = useState(false);
  const sendWs = useRef<WebSocket | null>(null);
  const receiveWs = useRef<WebSocket | null>(null);

  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!receiveRoomId || !sendRoomId || !receiverToken || !senderToken) return;

    const WS_BASE = getWsUrl();

    const rWs = new WebSocket(
      `${WS_BASE}/ws/chat/${receiveRoomId}/?token=${receiverToken}`,
    );
    rWs.onopen = () => setIsReceiveReady(true);
    rWs.onclose = () => setIsReceiveReady(false);
    rWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessageRef.current(data);
      } catch (e) {
        console.error("WS Parse Error:", e);
      }
    };
    receiveWs.current = rWs;

    const sWs = new WebSocket(
      `${WS_BASE}/ws/chat/${sendRoomId}/?token=${senderToken}`,
    );
    sWs.onopen = () => setIsSendReady(true);
    sWs.onclose = () => setIsSendReady(false);
    sWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received on sWs (sender socket):", data);
        onMessageRef.current(data);
      } catch (e) {
        console.error("WS Parse Error (sWs):", e);
      }
    };
    sendWs.current = sWs;

    return () => {
      rWs.close();
      sWs.close();
    };
  }, [receiveRoomId, sendRoomId, receiverToken, senderToken]);

  const sendMessage = (data: any) => {
    if (sendWs.current?.readyState === WebSocket.OPEN) {
      sendWs.current.send(JSON.stringify(data));
    }
  };

  const markAsRead = () => {
    if (receiveWs.current?.readyState === WebSocket.OPEN) {
      receiveWs.current.send(JSON.stringify({ type: "mark_as_read" }));
    }
  };

  return { sendMessage, markAsRead, isSendReady, isReceiveReady };
};
