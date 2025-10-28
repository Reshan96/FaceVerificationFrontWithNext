"use client";

import { Card, CircularProgress, Typography, useTheme } from "@mui/material";

interface GlassLoaderProps {
  message?: string;
  height?: string | number;
}

export default function GlassLoader({
  message = "Loading...",
  height = "auto",
}: GlassLoaderProps) {

  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 4,
        textAlign: "center",
        height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(20px) saturate(180%)",
        backgroundColor:
          theme.palette.mode === "light"
            ? "rgba(255,255,255,0.55)"
            : "rgba(17,25,40,0.6)",
        border: "1px solid rgba(255,255,255,0.25)",
        boxShadow:
          theme.palette.mode === "light"
            ? "0 4px 24px rgba(0,0,0,0.1)"
            : "0 4px 24px rgba(0,0,0,0.6)",
        transition: "all 0.3s ease",
      }}
    >
      <CircularProgress
        thickness={4}
        sx={{
          mb: 2,
          color:
            theme.palette.mode === "light"
              ? "rgba(0,0,0,0.7)"
              : "rgba(255,255,255,0.7)",
        }}
      />
      <Typography
        variant="h6"
        sx={{
          color: theme.palette.text.primary,
          fontWeight: 500,
          letterSpacing: 0.3,
        }}
      >
        {message}
      </Typography>
    </Card>
  );
}
