"use client";

import React, { useRef } from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  borderRadius?: number;
  displacementScale?: number;
  blur?: number;
  saturation?: number;
}

const GlassCard = ({
  children,
  className = "",
  style,
  borderRadius = 12,
  displacementScale = 30,
  blur = 0.5,
  saturation = 140,
}: GlassCardProps) => {
  const id = useRef(`glass-${Math.random().toString(36).slice(2, 7)}`);
  const filterId = id.current;

  return (
    <div
      className={`relative ${className}`}
      style={{ borderRadius, isolation: "isolate", ...style }}
    >
      <svg
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        <defs>
          <filter
            id={filterId}
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.008"
              numOctaves="3"
              seed="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={displacementScale}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
          </filter>
        </defs>
      </svg>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius,
          backdropFilter: `blur(${blur}px) saturate(${saturation}%) brightness(1.04)`,
          WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%) brightness(1.04)`,
          filter: `url(#${filterId})`,
          zIndex: 0,
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius,
          backdropFilter: `blur(40px) saturate(${saturation}%) brightness(1.03)`,
          WebkitBackdropFilter: `blur(40px) saturate(${saturation}%) brightness(1.03)`,
          background: "oklch(1 0 0 / 0.10)",
          border: "1px solid oklch(1 0 0 / 0.32)",
          zIndex: 1,
        }}
      />

      {/* Top edge specular highlight */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0.80) 40%, oklch(1 0 0 / 0.55) 70%, transparent 100%)",
          borderRadius: `${borderRadius}px ${borderRadius}px 0 0`,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 3 }}>{children}</div>
    </div>
  );
};

export default GlassCard;
