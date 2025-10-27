"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import GlassButton from "@/components/common/GlassButton";

type Phase = "verifying" | "actions" | "success" | "error";
type Action = "in" | "out" | "breakStart" | "breakEnd";

interface VerificationStepCardProps {
  photoUrl: string;
  userName: string;
  onActionSelect?: (action: Action) => void;
  onDone?: () => void;
  phase?: Phase;
  loading?: boolean;
}

export default function VerificationStepCard({
  photoUrl,
  userName,
  phase = "verifying",
  loading = false,
  onActionSelect,
  onDone,
}: VerificationStepCardProps) {
  const theme = useTheme();
  const [selected, setSelected] = useState<Action | null>(null);

  const ACTION_LABEL: Record<Action, string> = {
    in: "Check in",
    breakStart: "Take a break",
    breakEnd: "I'm back",
    out: "Check out",
  };

  const phaseColor =
    phase === "verifying"
      ? "rgba(168,85,247,0.8)"
      : phase === "actions"
      ? "rgba(72,118,255,0.9)"
      : phase === "success"
      ? "rgba(34,197,94,0.9)"
      : "rgba(232,65,101,0.8)";

  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 720,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderRadius: 6,
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
        textAlign: "center",
        backdropFilter: "blur(20px) saturate(180%)",
        backgroundColor:
          theme.palette.mode === "light"
            ? "rgba(255,255,255,0.55)"
            : "rgba(17,25,40,0.6)",
        border: "1px solid rgba(255,255,255,0.26)",
        boxShadow:
          theme.palette.mode === "light"
            ? "0 6px 28px rgba(0,0,0,0.08)"
            : "0 6px 28px rgba(0,0,0,0.65)",
      }}
    >
      <CardContent
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
        }}
      >
        {/* Header */}
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 500, color: theme.palette.text.primary }}
          >
            {userName}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: phaseColor,
              transition: "color .25s ease",
            }}
          >
            {phase === "verifying" && "Verifying face…"}
            {phase === "actions" && "Select an action"}
            {phase === "success" && "Attendance recorded"}
            {phase === "error" && "Verification failed"}
          </Typography>
        </Box>

        {/* Photo preview */}
        <Box
          sx={{
            position: "relative",
            borderRadius: "50%",
            overflow: "hidden",
            width: {
              xs: "min(80vw, 60vh)",
              sm: "min(60vw, 50vh)",
            },
            aspectRatio: "1 / 1",
            boxShadow: `0 0 36px ${phaseColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            src={photoUrl}
            alt="Captured"
            fill
            style={{ objectFit: "cover" }}
          />

          {phase === "verifying" && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backdropFilter: "blur(4px) brightness(0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={48} thickness={4} />
            </Box>
          )}
        </Box>

        {/* Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 1.5,
            mt: 1,
          }}
        >
          {phase === "actions" &&
            Object.entries(ACTION_LABEL).map(([key, label]) => (
              <GlassButton
                key={key}
                onClick={() => {
                  const a = key as Action;
                  setSelected(a);
                  onActionSelect?.(a);
                }}
                disabled={loading}
                variant={selected === key ? "contained" : "outlined"}
              >
                {label}
              </GlassButton>
            ))}

          {phase === "success" && (
            <GlassButton onClick={onDone}>Done</GlassButton>
          )}

          {phase === "error" && (
            <GlassButton onClick={onDone}>Back</GlassButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
