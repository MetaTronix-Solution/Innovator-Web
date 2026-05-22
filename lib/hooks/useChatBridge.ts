// @/hooks/useChatBridge.ts
import { useEffect, useRef, useState } from "react";

export const useChatBridge = (
  receiveRoomId: string | null,
  sendRoomId: string | null,
  receiverToken: string | null,
  senderToken: string | null,
  onMessage: (data: any) => void,
) => {
  const [isSendReady, setIsSendReady] = useState(false);
  const sendWs = useRef<WebSocket | null>(null);
  const receiveWs = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!receiveRoomId || !sendRoomId || !receiverToken || !senderToken) return;

    const rWs = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/ws/chat/${receiveRoomId}/?token=${receiverToken}`,
    );

    rWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        onMessage(data);
      } catch (e) {
        console.error("WS Parse Error:", e);
      }
    };

    receiveWs.current = rWs;

    const sWs = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/ws/chat/${sendRoomId}/?token=${senderToken}`,
    );
    sWs.onopen = () => setIsSendReady(true);
    sWs.onclose = () => setIsSendReady(false);
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

  return { sendMessage, isSendReady };
};
