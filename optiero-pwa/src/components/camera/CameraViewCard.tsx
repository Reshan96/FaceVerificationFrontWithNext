"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";
import Image from "next/image";
import GlassButton from "@/components/common/GlassButton";
import { useFaceDetection } from "@/lib/customHooks/useFaceDetection";

interface CameraViewCardProps {
  userName: string;
  onCancel: () => void;
  onCaptured: (blob: Blob) => void;
}

export default function CameraViewCard({
  userName,
  onCancel,
  onCaptured,
}: CameraViewCardProps) {
  const theme = useTheme();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const {
    loading: detecting,
    hasFace,
    start: startDetect,
    stop: stopDetect,
  } = useFaceDetection(videoRef);

  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [snapshotBlob, setSnapshotBlob] = useState<Blob | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  // 🚀 Start camera
 const startCamera = useCallback(async () => {
  try {
    if (streamRef.current) return; // guard

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: 640, height: 640 },
      audio: false,
    });
    streamRef.current = stream;

    const v = videoRef.current;
    if (!v) return;

    v.srcObject = stream;
    v.muted = true;
    v.playsInline = true;

    // 🔑 ensure dimensions are available before play
    await new Promise<void>((resolve) => {
      if (v.readyState >= 1 && v.videoWidth > 0) return resolve();
      const onMeta = () => {
        v.removeEventListener("loadedmetadata", onMeta);
        resolve();
      };
      v.addEventListener("loadedmetadata", onMeta);
    });

    await v.play();
    setCameraReady(true);
  } catch (err) {
    console.error("Camera start failed:", err);
  }
}, []);

  // 📷 Initialize + Cleanup on unmount
  useEffect(() => {
    const t = setTimeout(() => void startCamera(), 0);
    return () => {
      clearTimeout(t);
      console.log("🧹 Cleaning up camera and detection on unmount...");
      stopDetect();

      const v = videoRef.current;
      if (v) {
        try {
          v.pause();
          v.srcObject = null;
        } catch {}
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((tr) => tr.stop());
        streamRef.current = null;
      }

      if (snapshotUrl) URL.revokeObjectURL(snapshotUrl);
    };
  }, [startCamera, stopDetect, snapshotUrl]);

  // 🧠 Auto-start detection once camera is ready
  useEffect(() => {
    if (cameraReady && !snapshotUrl) startDetect();
    return () => stopDetect();
  }, [cameraReady, snapshotUrl, startDetect, stopDetect]);

  // 📸 Capture image from video
const handleCapture = () => {
  const video = videoRef.current;
  const canvas = canvasRef.current;
  if (!video || !canvas) return;

  const size = Math.min(video.videoWidth, video.videoHeight);
  const sx = (video.videoWidth - size) / 2;
  const sy = (video.videoHeight - size) / 2;

  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    setSnapshotBlob(blob);
    setSnapshotUrl(url);

    // tiny, optional: freeze preview
    try { video.pause(); } catch {}
  }, "image/jpeg", 0.92);
};
  // 🔁 Retake photo
  const handleRetake = useCallback(async () => {
    console.log("🔄 Retaking photo...");
    // Clear snapshot
    if (snapshotUrl) URL.revokeObjectURL(snapshotUrl);
    setSnapshotUrl(null);
    setSnapshotBlob(null);
    setCameraReady(false);

    // Stop detection and camera
    stopDetect();

    try {
      const v = videoRef.current;
      if (v) {
        v.pause();
        v.srcObject = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      // Restart camera fresh
      await startCamera();

      // Restart detection
      startDetect();
    } catch (err) {
      console.error("Retake failed:", err);
    }
  }, [snapshotUrl, startCamera, startDetect, stopDetect]);

  // ❌ Cancel button
  const handleCancel = useCallback(() => {
    console.log("❌ Cancel clicked — cleaning up...");

    stopDetect();

    const v = videoRef.current;
    if (v) {
      try {
        v.pause();
        v.srcObject = null;
      } catch {}
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (snapshotUrl) URL.revokeObjectURL(snapshotUrl);

    setSnapshotUrl(null);
    setSnapshotBlob(null);
    setCameraReady(false);

    onCancel?.();
  }, [onCancel, snapshotUrl, stopDetect]);

  const handleContinue = () => {
    if (snapshotBlob) onCaptured(snapshotBlob);
  };

  // derive visual state
  const phase = !cameraReady
    ? "boot"
    : hasFace
    ? "found"
    : "search";

  const glow = {
    boot: { glow: "rgba(168, 85, 247, 0.60)", border: "rgba(168, 85, 247, 0.55)" },
    search: { glow: "rgba(232, 65, 101, 0.55)", border: "rgba(232, 65, 101, 0.45)" },
    found: { glow: "rgba(72, 118, 255, 0.55)", border: "rgba(72, 118, 255, 0.45)" },
  }[phase];

  const shouldPulse = phase !== "found";

  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 720,
        height: "auto",
        maxHeight: "90dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: 6,
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 2 },
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
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
      }}
    >
      <CardContent
        sx={{
          width: "100%",
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-evenly",
          p: 0,
        }}
      >
        {/* Header */}
        <Box sx={{ mt: 1, mb: 1 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 500, color: theme.palette.text.primary }}
          >
            {userName}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color:
                phase === "found"
                  ? "rgba(72, 118, 255, 0.8)"
                  : phase === "boot"
                  ? "rgba(169, 85, 247, 0.8)"
                  : "rgba(232, 65, 101, 0.8)",
              transition: "color .25s ease",
            }}
          >
            {!cameraReady
              ? "Starting camera…"
              : hasFace
              ? "Face detected — ready to capture"
              : "Searching for face…"}
          </Typography>
        </Box>

        {/* Camera ring */}
        <Box
          sx={{
            position: "relative",
            width: {
              xs: "min(80vw, 60vh)",
              sm: "min(60vw, 55vh)",
              md: "min(50vw, 50vh)",
            },
            maxWidth: 600,
            aspectRatio: "1 / 1",
            borderRadius: "50%",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            my: { xs: 1, sm: 1.5 },
            background:
              theme.palette.mode === "dark"
                ? "radial-gradient(circle at 50% 50%, rgba(60,90,255,0.14), rgba(0,0,0,0.35))"
                : "radial-gradient(circle at 50% 50%, rgba(120,160,255,0.22), rgba(255,255,255,0.78))",
            boxShadow: `0 0 36px ${glow.glow}`,
            transition: "box-shadow .35s ease, background .35s ease",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `2px solid ${glow.border}`,
              animation: shouldPulse ? "pulseRing 2.2s ease-in-out infinite" : "none",
              transition: "border-color .35s ease, box-shadow .35s ease",
            },
            "@keyframes pulseRing": {
              "0%, 100%": { boxShadow: `0 0 14px ${glow.glow}` },
              "50%": { boxShadow: `0 0 40px ${glow.glow}` },
            },
          }}
        >
          {!snapshotUrl ? (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Image src={snapshotUrl} alt="Captured" fill style={{ objectFit: "cover" }} />
          )}
        </Box>

        {/* Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1.5,
            flexWrap: "wrap",
            pt: { xs: 10, sm: 3 },
            mb: { xs: 1.5, sm: 2 },
          }}
        >
          {!snapshotUrl ? (
            <>
              <GlassButton onClick={handleCancel}>Cancel</GlassButton>
              <GlassButton
                onClick={handleCapture}
                disabled={!cameraReady || !hasFace}
                variant="contained"
              >
                {cameraReady ? (hasFace ? "Capture" : "Align Face") : "Loading…"}
              </GlassButton>
            </>
          ) : (
            <>
              <GlassButton onClick={handleRetake}>Retake</GlassButton>
              <GlassButton onClick={handleContinue}>Continue</GlassButton>
            </>
          )}
        </Box>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </CardContent>
    </Card>
  );
}
