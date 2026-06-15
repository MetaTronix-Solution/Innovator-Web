"use client";

import React from "react";
import { ChatMessage } from "./MessageView";
import { Avatar } from "./MessageView";
import { MediaBubble } from "./MediaUploadButton";

interface MessageGroupProps {
  group: {
    senderId: string;
    messages: ChatMessage[];
    isMine: boolean;
  };
  currentChatName: string;
  currentChatAvatar: string | null;
  currentUserAvatar: string | null;
}

function formatTime(iso: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function MessageGroup({
  group,
  currentChatName,
  currentChatAvatar,
  currentUserAvatar,
}: MessageGroupProps) {
  const firstMsg = group.messages[0];
  const lastMsg = group.messages[group.messages.length - 1];
  const senderName =
    firstMsg.sender_full_name ||
    (group.isMine ? "You" : currentChatName);
  const senderAvatarSrc = group.isMine
    ? currentUserAvatar
    : firstMsg.sender_avatar || currentChatAvatar;

  return (
    <div
      className={`flex items-end gap-2 mb-2 ${
        group.isMine ? "flex-row-reverse pr-1" : "flex-row"
      }`}
    >
      <div className="shrink-0 self-end mb-1">
        {!group.isMine && (
          <Avatar
            src={senderAvatarSrc}
            name={senderName}
            id={String(firstMsg.sender)}
            size={26}
          />
        )}
      </div>

      <div
        className={`flex flex-col gap-[3px] ${
          group.isMine
            ? "items-end max-w-[72%] ml-auto"
            : "items-start max-w-[72%]"
        }`}
      >
        {(() => {
          const elements: React.ReactNode[] = [];
          let i = 0;
          while (i < group.messages.length) {
            const msg = group.messages[i];
            const textBody =
              msg.message ||
              msg.text ||
              msg.body ||
              msg.content ||
              "";

            if (msg.attachment && !textBody.trim()) {
              const attachmentBatch: string[] = [];
              const batchIds: string[] = [];
              while (
                i < group.messages.length &&
                group.messages[i].attachment &&
                !(
                  group.messages[i].message ||
                  group.messages[i].text ||
                  group.messages[i].body ||
                  group.messages[i].content ||
                  ""
                ).trim()
              ) {
                attachmentBatch.push(group.messages[i].attachment!);
                batchIds.push(group.messages[i].id);
                i++;
              }
              elements.push(
                <div key={batchIds.join("-")} className="w-full">
                  <MediaBubble
                    attachments={attachmentBatch}
                    isMine={group.isMine}
                  />
                </div>,
              );
              continue;
            }

            const isFirst = i === 0;
            const isLast = i === group.messages.length - 1;
            elements.push(
              <div key={msg.id} className="w-full">
                {msg.attachment && (
                  <MediaBubble
                    attachments={[msg.attachment]}
                    isMine={group.isMine}
                  />
                )}
                {textBody.trim() && (
                  <div
                    className={`inline-block px-3.5 py-2 text-[13px] leading-relaxed break-words max-w-full ${
                      group.isMine
                        ? "bg-orange-600 text-white"
                        : "bg-card text-foreground border border-border/60"
                    } ${
                      group.isMine
                        ? isFirst && isLast
                          ? "rounded-2xl rounded-br-[5px]"
                          : isFirst
                            ? "rounded-2xl rounded-br-[5px] rounded-bl-2xl"
                            : isLast
                              ? "rounded-2xl rounded-br-[5px]"
                              : "rounded-[10px] rounded-r-[5px]"
                        : isFirst && isLast
                          ? "rounded-2xl rounded-bl-[5px]"
                          : isFirst
                            ? "rounded-2xl rounded-bl-[5px] rounded-br-2xl"
                            : isLast
                              ? "rounded-2xl rounded-bl-[5px]"
                              : "rounded-[10px] rounded-l-[5px]"
                    }`}
                  >
                    {textBody}
                  </div>
                )}
              </div>,
            );
            i++;
          }
          return elements;
        })()}
        {formatTime(lastMsg.created_at) && (
          <p
            className={`text-[10px] text-muted-foreground/50 font-medium mt-0.5 ${
              group.isMine ? "text-right mr-1" : "ml-1"
            }`}
          >
            {formatTime(lastMsg.created_at)}
            {group.isMine && <span className="ml-1">✓✓</span>}
          </p>
        )}
      </div>
    </div>
  );
}
