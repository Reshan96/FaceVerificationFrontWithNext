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
  const [currentSession, setCurrentSession] = useState<OpenSession | null>(null);

  // 🔹 Step 1: Verify face and fetch session
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
        const data = (await res.json()) as VerifyResponse;

        if (!res.ok || !data.match)
          throw new Error("Face not recognized or verification failed.");

        setCurrentSession(data.openSession ?? null);
        setPhase("actions");
      } catch (err) {
        console.error("Verification failed:", err);
        setErrorMsg(
          err instanceof Error ? err.message : "Verification failed. Try again."
        );
        setPhase("error");
      }
    };

    verifyFace();
  }, [photoUrl, selectedUser, clearUser, router]);

  // 🔹 Step 2: Determine allowed actions
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

  // 🔹 Step 3: Handle attendance action
  const handleAction = async (action: Action) => {
    setSelectedAction(action);
    setIsLoading(true);
    setTimestamp(new Date());

    try {
      if (!selectedUser) throw new Error("User not found.");

      const payload = {
        employeeId: selectedUser.employeeId,
        BranchId: selectedUser.branchId,
        actionTaken: ACTION_LABEL[action].code,
        OccurredAtUtc: new Date().toISOString(),
        SessionId: currentSession?.sessionId,
      };

      let apiUrl = "/api/attendance";
      if (action === "breakStart" || action === "breakEnd") apiUrl += "/break";
      if (action === "in" || action === "out") apiUrl += "/check";

      const res = await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify(payload),
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.title || `HTTP ${res.status}`);
      }

      setPhase("success");
    } catch (err) {
      console.error("Attendance action failed:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "Attendance action failed."
      );
      setPhase("error");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 UI color mapping by phase
  const phaseColor =
    phase === "verifying"
      ? "rgba(168,85,247,0.8)" // purple
      : phase === "actions"
      ? "rgba(72,118,255,0.9)" // blue
      : phase === "success"
      ? "rgba(34,197,94,0.9)" // green
      : "rgba(232,65,101,0.9)"; // red

  // 🔹 UI
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
          <Typography variant="body2" sx={{ color: phaseColor }}>
            {phase === "verifying" && "Verifying face…"}
            {phase === "actions" && "Select an action"}
            {phase === "success" && "Attendance recorded"}
            {phase === "error" && "Verification failed"}
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
  );
}
