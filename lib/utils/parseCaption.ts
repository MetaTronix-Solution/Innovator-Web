export interface CaptionSegment {
  type: "text" | "hashtag" | "mention" | "newline";
  value: string;
}

export function parseCaption(caption: string): CaptionSegment[] {
  const regex = /(#\w+|@\w+|\n)/g;
  const parts = caption.split(regex);

  return parts.filter(Boolean).map((part) => {
    if (part === "\n") return { type: "newline", value: "\n" };
    if (part.startsWith("#")) return { type: "hashtag", value: part };
    if (part.startsWith("@")) return { type: "mention", value: part };
    return { type: "text", value: part };
  });
}
