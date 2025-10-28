"use client";

import { useEffect, useState } from "react";
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
import { useRouter } from "next/navigation";
import { useSelection } from "@/lib/stores/selectionStore";
import { SessionStatus, OpenSession, VerifyResponse } from "@/lib/types/types";
import { buildPayload } from "@/lib/types/payloadBuilder";
import { normalizeClientError } from "@/lib/errorHandler/errorHandler";
import GlassSnackbar from "../common/GlassSnackbar";

type Phase = "verifying" | "actions" | "success" | "error";
type Action = "in" | "out" | "breakStart" | "breakEnd";

interface VerificationStepCardProps {
  photoUrl: string;
  userName: string;
  onDone?: () => void;
}

interface ActionInfo {
  actionLabel: string;
  responseLabel: string;
  code: number;
}

const ACTION_LABEL: Record<Action, ActionInfo> = {
  in: { actionLabel: "Check in", responseLabel: "Checked in", code: 1 },
  breakStart: { actionLabel: "Take a break", responseLabel: "Break started", code: 2 },
  breakEnd: { actionLabel: "I'm back", responseLabel: "Welcome back", code: 3 },
  out: { actionLabel: "Check out", responseLabel: "Checked out", code: 4 },
};

export default function VerificationStepCard({
  photoUrl,
  userName,
  onDone,
}: VerificationStepCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const selectedUser = useSelection((s) => s.selectedEmployee);
  const clearUser = useSelection((s) => s.clear);

  const [phase, setPhase] = useState<Phase>("verifying");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [timestamp, setTimestamp] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<OpenSession | null>(null);

const firstName = userName?.split(" ")[0] ?? userName;

const titleText =
  phase === "actions"
    ? `Hello ${firstName}, Welcome Back!`
    : phase === "error"
    ? "Oh! No"
    : userName;

const subtitleText =
  phase === "verifying"
    ? "Verifying face…"
    : phase === "actions"
    ? "Select an action"
    : phase === "success"
    ? "Attendance recorded"
    : errorMsg?.toLowerCase().includes("unexpected") ||
      errorMsg?.toLowerCase().includes("http")
    ? "Unexpected error occurred"
    : "Verification failed";

  useEffect(() => {
    const verifyFace = async () => {
      try {
        if (!selectedUser) {
          alert("User not found, please select again.");
          clearUser();
          router.replace("/");
          return;
        }

        const form = new FormData();
        form.append("image", await fetch(photoUrl).then((r) => r.blob()));
        form.append("employeeId", selectedUser.employeeId.toString());

        const res = await fetch("/api/verify", { method: "POST", body: form });

        if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const message =
          errJson?.error ||
          errJson?.message ||
          `HTTP ${res.status} - ${res.statusText || "Request failed"}`;
        throw new Error(message);
      }

        const data = (await res.json()) as VerifyResponse;

              if (!data.match) throw new Error("Face not recognized. Please try again.");

        setCurrentSession(data.openSession ?? null);
        setPhase("actions");

      } catch (err) {
      const normalized = normalizeClientError(err);
      console.error("Verification failed:", normalized);
      setErrorMsg(normalized.message);
      setSnackbarOpen(true);
      setPhase("error");
    }
    };

    verifyFace();
  }, [photoUrl, selectedUser, clearUser, router]);

  const getAllowedActions = (session: OpenSession | null): Action[] => {
    if (!session) return ["in"];
    switch (session.sessionStatus) {
      case SessionStatus.Open:
        return ["out", "breakStart"];
      case SessionStatus.OnBreak:
        return ["out", "breakEnd"];
      default:
        return ["in"];
    }
  };

 const handleAction = async (action: Action) => {
  setSelectedAction(action);
  setIsLoading(true);
  setTimestamp(new Date());

  setErrorMsg("");
  setSnackbarOpen(false);

  try {
    if (!selectedUser) throw new Error("User not found.");

    const { endpoint, body } = buildPayload(action, {
      employeeId: selectedUser.employeeId,
      branchId: selectedUser.branchId,
      sessionId: currentSession?.sessionId ?? null,
    });

    const res = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const message =
        errJson?.error ||
        errJson?.message ||
        `HTTP ${res.status} - ${res.statusText || "Request failed"}`;
      throw new Error(message);
    }

    setPhase("success");
  } catch (err) {
    const normalized = normalizeClientError(err);
    console.error("Attendance action failed:", normalized);

    setErrorMsg(normalized.message);
    setSnackbarOpen(true);
    setPhase("error");
  } finally {
    setIsLoading(false);
  }
};

  const phaseColor =
    phase === "verifying"
      ? "rgba(168,85,247,0.8)" // purple
      : phase === "actions"
      ? "rgba(72,118,255,0.9)" // blue
      : phase === "success"
      ? "rgba(34,197,94,0.9)" // green
      : "rgba(232,65,101,0.9)"; // red

  return (
    <>
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
    variant="h5"
    sx={{
        fontWeight: 700,
        color:
        phase === "error"
        ? "rgba(232,65,101,0.95)" // red-ish for error title
        : theme.palette.text.primary,
        letterSpacing: 0.2,
    }}
    >
    {titleText}
  </Typography>

  <Typography
    variant="body2"
    sx={{
        mt: 0.25,
        
        color:
        phase === "actions"
        ? "rgba(255,255,255,0.92)"
        : phase === "error"
        ? "rgba(232,65,101,0.9)"
        : phase === "verifying"
        ? "rgba(178, 132, 222, 0.85)" 
        : "rgba(77, 202, 123, 0.9)", 
        fontWeight: 600 ,
        transition: "color .25s ease",
    }}
    >
    {subtitleText}
  </Typography>
</Box>

        {/* Captured Photo */}
        <Box
          sx={{
              position: "relative",
              borderRadius: "50%",
              overflow: "hidden",
            width: { xs: "min(80vw, 60vh)", sm: "min(60vw, 50vh)" },
            aspectRatio: "1 / 1",
            boxShadow: `0 0 36px ${phaseColor}`,
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

        {/* Action / Result Buttons */}
        <Box
          sx={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 1.5,
              textAlign: "center",
            }}
            >
          {phase === "actions" &&
            getAllowedActions(currentSession).map((a) => (
                <GlassButton
                key={a}
                onClick={() => handleAction(a)}
                disabled={isLoading}
                variant={selectedAction === a ? "contained" : "outlined"}
                >
                {isLoading && selectedAction === a
                  ? "Processing…"
                  : ACTION_LABEL[a].actionLabel}
              </GlassButton>
            ))}

          {phase === "success" && (
              <Box>
              <Typography
                variant="h6"
                sx={{ color: "rgba(34,197,94,0.9)", mb: 1 }}
              >
                {selectedAction &&
                  ACTION_LABEL[selectedAction].responseLabel}
              </Typography>
              {timestamp && (
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {timestamp.toLocaleString()}
                </Typography>
              )}
              <GlassButton sx={{ mt: 2 }} onClick={onDone}>
                Done
              </GlassButton>
            </Box>
          )}

          {phase === "error" && (
              <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {errorMsg || "Verification failed. Please try again."}
              </Typography>
              <GlassButton onClick={onDone}>Back</GlassButton>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>

    <GlassSnackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        message={errorMsg || "Verification failed. Please try again."}
        />
    </>
  );
}
