"use client";

import { Dialog, DialogProps, Paper, PaperProps } from "@mui/material";

type GlassModalProps = DialogProps & {
  paperProps?: PaperProps;
};

export default function GlassModal({ paperProps, children, ...props }: GlassModalProps) {
  return (
    <Dialog
      {...props}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(0,0,0,0.35)",
          },
        },
      }}
      PaperComponent={Paper}
      PaperProps={{
        elevation: 0,
        sx: (theme) => ({
          borderRadius: 4,
          p: 2.5,
          width: "min(560px, 92vw)",
          backdropFilter: "blur(20px) saturate(180%)",
          backgroundColor:
            theme.palette.mode === "light"
              ? "rgba(255,255,255,0.6)"
              : "rgba(17,25,40,0.7)",
          border: "1px solid rgba(255,255,255,0.25)",
          boxShadow:
            theme.palette.mode === "light"
              ? "0 10px 40px rgba(0,0,0,0.12)"
              : "0 10px 40px rgba(0,0,0,0.6)",
        }),
        ...paperProps,
      }}
    >
      {children}
    </Dialog>
  );
}
