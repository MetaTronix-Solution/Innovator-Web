"use client";

import React, { useState, memo, useRef, useEffect } from "react";
import { Lightbulb } from "lucide-react";
import ReactionPicker, { REACTIONS } from "./ReactionPicker";

interface ReactionButtonProps {
  currentReaction: string | null;
  count: number;
  onReact: (type: string | null) => void;
  onCountClick?: () => void;
  variant?: "reels" | "post";
  isVertical?: boolean;
}

const REACTION_COLORS: Record<string, string> = {
  like: "text-amber-400",
  love: "text-rose-500",
  haha: "text-yellow-500",
  wow: "text-purple-500",
  sad: "text-blue-500",
  angry: "text-red-500",
};

interface Spark {
  id: number;
  angle: number;
  dist: number;
  size: number;
  color: string;
}

const SPARK_COLORS = ["#fbbf24", "#f59e0b", "#fde68a", "#d97706", "#fcd34d"];

function generateSparks(n = 8): Spark[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    angle: (360 / n) * i + Math.random() * 20 - 10,
    dist: 20 + Math.random() * 14,
    size: 3 + Math.random() * 3,
    color: SPARK_COLORS[i % SPARK_COLORS.length],
  }));
}

const ReactionButton = memo(
  ({
    currentReaction,
    count,
    onReact,
    onCountClick,
    variant,
    isVertical,
  }: ReactionButtonProps) => {
    const [showPicker, setShowPicker] = useState(false);
    const [animating, setAnimating] = useState(false);
    const [sparks, setSparks] = useState<Spark[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const animRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(
      () => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (animRef.current) clearTimeout(animRef.current);
      },
      [],
    );

    const handleMouseEnter = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setShowPicker(true);
    };

    const handleMouseLeave = () => {
      timerRef.current = setTimeout(() => setShowPicker(false), 200);
    };

    const triggerLightAnimation = () => {
      setSparks(generateSparks(8));
      setAnimating(true);
      if (animRef.current) clearTimeout(animRef.current);
      animRef.current = setTimeout(() => {
        setAnimating(false);
        setSparks([]);
      }, 500);
    };

    const handleSelect = (type: string | null) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setShowPicker(false);
      const next = type === currentReaction ? null : type;
      if (next === "like") triggerLightAnimation();
      onReact(next);
    };

    const isLit = currentReaction === "like";
    const reaction = REACTIONS.find((r) => r.type === currentReaction);
    const color = currentReaction
      ? REACTION_COLORS[currentReaction]
      : "text-muted-foreground";
    const iconSize = isVertical ? 24 : 18;

    return (
      <div
        className="relative flex items-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {showPicker && (
          <ReactionPicker
            onSelect={handleSelect}
            onClose={() => setShowPicker(false)}
            variant={variant}
          />
        )}

        <button
          onClick={() => handleSelect(currentReaction ? null : "like")}
          onMouseEnter={() => setShowPicker(true)}
          className={`flex items-center ${
            isVertical ? "flex-col gap-1" : "flex-row gap-1.5"
          } px-3 py-2 cursor-pointer rounded-lg transition-all hover:scale-105 font-semibold text-sm ${color}`}
        >
          <div
            className="relative flex items-center justify-center"
            style={{ width: iconSize + 4, height: iconSize + 4 }}
          >
            {sparks.map((spark) => {
              const rad = (spark.angle * Math.PI) / 180;
              return (
                <span
                  key={spark.id}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: spark.size,
                    height: spark.size,
                    borderRadius: "50%",
                    background: spark.color,
                    transform: "translate(-50%, -50%)",
                    animation: `sparkFly 0.45s ease-out ${spark.id * 0.02}s forwards`,
                    ["--tx" as string]: `${Math.cos(rad) * spark.dist}px`,
                    ["--ty" as string]: `${Math.sin(rad) * spark.dist}px`,
                    pointerEvents: "none",
                  }}
                />
              );
            })}

            {isLit && (
              <span
                style={{
                  position: "absolute",
                  inset: -6,
                  borderRadius: "50%",
                  animation: animating ? "glowPulse 0.4s ease-out" : undefined,
                  pointerEvents: "none",
                }}
              />
            )}

            {reaction && reaction.type !== "like" ? (
              <span className="text-lg leading-none">{reaction.emoji}</span>
            ) : (
              <Lightbulb
                size={iconSize}
                strokeWidth={1.8}
                color={
                  isLit
                    ? "#d97706"
                    : variant === "reels"
                      ? "#ffffff"
                      : "currentColor"
                }
                fill={isLit ? "#fde68a" : "none"}
                style={{
                  transition:
                    "transform 0.3s cubic-bezier(.34,1.56,.64,1), color 0.2s, fill 0.2s",
                  transform: animating
                    ? "scale(1.35) rotate(-12deg)"
                    : isLit
                      ? "scale(1.1)"
                      : "scale(1)",
                  filter: isLit ? "drop-shadow(0 0 6px #f59e0baa)" : "none",
                }}
              />
            )}
          </div>

          <span
            className={`cursor-pointer ${
              variant === "reels" && !isLit
                ? "text-white"
                : "text-muted-foreground"
            } hover:underline text-xs`}
            onClick={(e) => {
              e.stopPropagation();
              onCountClick?.();
            }}
          >
            {count}
          </span>
        </button>
      </div>
    );
  },
);

ReactionButton.displayName = "ReactionButton";
export default ReactionButton;
