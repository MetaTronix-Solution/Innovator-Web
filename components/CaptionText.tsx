"use client";

import { useRouter } from "next/navigation";
import { parseCaption } from "@/lib/utils/parseCaption";

interface Props {
  caption: string;
  className?: string;
}

export default function CaptionText({ caption, className }: Props) {
  const router = useRouter();
  const segments = parseCaption(caption);

  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (seg.type === "newline") {
          return <br key={i} />;
        }

        if (seg.type === "hashtag") {
          return (
            <button
              key={i}
              // onClick={(e) => {
              //   e.stopPropagation();
              //   router.push(`/search?q=${encodeURIComponent(seg.value)}`);
              // }}
              className="text-primary font-semibold hover:underline underline-offset-2"
            >
              {seg.value}
            </button>
          );
        }

        if (seg.type === "mention") {
          return (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/${seg.value.slice(1)}`);
              }}
              className="text-primary font-semibold hover:underline underline-offset-2"
            >
              {seg.value}
            </button>
          );
        }

        return <span key={i}>{seg.value}</span>;
      })}
    </span>
  );
}
