"use client";
import * as React from "react";
import { Button, ButtonProps, useTheme } from "@mui/material";

export default function GlassButton(props: ButtonProps) {
  const theme = useTheme();
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const [ripples, setRipples] = React.useState<
    { x: number; y: number; size: number; id: number }[]
  >([]);

  // handle click for ripple creation
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, size, id }]);

    // auto remove after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);

    props.onClick?.(e);
  };

  return (
    <Button
      {...props}
      ref={btnRef}
      onClick={handleClick}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 999,
        textTransform: "none",
        fontWeight: 700,
        fontSize: 18,
        px: 4,
        py: 1.4,
        letterSpacing: 0.3,
        backdropFilter: "blur(18px) saturate(180%)",
        background:
          theme.palette.mode === "light"
            ? "linear-gradient(180deg, rgba(255,255,255,.85), rgba(255,255,255,.55)), radial-gradient(120% 120% at 50% 0%, rgba(107,167,255,.45), transparent)"
            : "linear-gradient(180deg, rgba(20,28,48,.85), rgba(20,28,48,.65)), radial-gradient(120% 120% at 50% 0%, rgba(107,167,255,.35), transparent)",
        border: "1px solid rgba(255,255,255,0.3)",
        boxShadow:
          theme.palette.mode === "light"
            ? "0 10px 26px rgba(0,0,0,.18), 0 0 0 2px rgba(107,167,255,.25) inset"
            : "0 12px 28px rgba(0,0,0,.55), 0 0 0 2px rgba(107,167,255,.25) inset",
        color: theme.palette.mode === "light" ? "#0b1020" : "#EAF1FF",
        textShadow:
          theme.palette.mode === "dark"
            ? "0 1px 2px rgba(0,0,0,.6)"
            : "0 1px 1px rgba(255,255,255,.6)",
        transition: "all .25s ease",
        "&:hover": {
          background:
            theme.palette.mode === "light"
              ? "linear-gradient(180deg, rgba(255,255,255,.9), rgba(255,255,255,.65)), radial-gradient(120% 120% at 50% 0%, rgba(107,167,255,.55), transparent)"
              : "linear-gradient(180deg, rgba(26,34,56,.92), rgba(26,34,56,.72)), radial-gradient(120% 120% at 50% 0%, rgba(107,167,255,.45), transparent)",
          boxShadow:
            theme.palette.mode === "light"
              ? "0 14px 32px rgba(0,0,0,.22), 0 0 0 2px rgba(107,167,255,.32) inset"
              : "0 16px 36px rgba(0,0,0,.65), 0 0 0 2px rgba(107,167,255,.32) inset",
        },
        "&:active": {
          transform: "translateY(1px) scale(0.985)",
        },
        "&.Mui-focusVisible": {
          boxShadow: "0 0 0 4px rgba(107,167,255,.45)",
        },
        ...(props.sx || {}),
      }}
    >
      {/* Ripple container */}
      {ripples.map((r) => (
        <span
          key={r.id}
          style={{
            position: "absolute",
            borderRadius: "50%",
            transform: "scale(0)",
            animation: "ripple 0.6s linear",
            background:
              theme.palette.mode === "light"
                ? "rgba(107,167,255,.45)"
                : "rgba(255,255,255,.25)",
            width: r.size,
            height: r.size,
            left: r.x,
            top: r.y,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ))}

      {/* Button text */}
      <span style={{ position: "relative", zIndex: 1 }}>{props.children}</span>

      {/* ripple keyframes */}
      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(3);
            opacity: 0;
          }
        }
      `}</style>
    </Button>
  );
}
