"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";
import Image from "next/image";
import GlassButton from "@/components/common/GlassButton";

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

  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [snapshotBlob, setSnapshotBlob] = useState<Blob | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const startCamera = useCallback(async () => {
    try {
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
      await v.play();
      setCameraReady(true);
    } catch (err) {
      console.error("Camera start failed:", err);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => void startCamera(), 0);
    return () => {
      clearTimeout(t);
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    };
  }, [startCamera]);

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
    }, "image/jpeg", 0.92);
  };

  const handleRetake = async () => {
    if (snapshotUrl) URL.revokeObjectURL(snapshotUrl);
    setSnapshotBlob(null);
    setSnapshotUrl(null);
    try {
      await videoRef.current?.play();
      setCameraReady(true);
    } catch {
      await startCamera();
    }
  };

  const handleContinue = () => {
    if (snapshotBlob) onCaptured(snapshotBlob);
  };

  return (
    <Card
  elevation={0}
  sx={{
    width: "100%",
    maxWidth: 720,
    height: "auto",
    minHeight: "auto",
    maxHeight: "90dvh", // prevents elongation
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
        ? "0 6px 28px rgba(0,0,0,0.08)" // a touch softer
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
        sx={{ color: theme.palette.text.secondary }}
      >
        {cameraReady
          ? snapshotUrl
            ? "Preview your capture"
            : "Align your face within the circle"
          : "Starting camera..."}
      </Typography>
    </Box>

    {/* Camera ring (balanced sizing for portrait) */}
    <Box
      sx={{
        position: "relative",
        width: {
          xs: "min(75vw, 55vh)",
          sm: "min(55vw, 50vh)",
          md: "min(45vw, 45vh)",
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
            ? "radial-gradient(circle at 50% 50%, rgba(60,90,255,0.15), rgba(0,0,0,0.35))"
            : "radial-gradient(circle at 50% 50%, rgba(100,150,255,0.25), rgba(255,255,255,0.65))",
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 0 36px rgba(72,118,255,0.45)"
            : "0 0 28px rgba(72,118,255,0.3)",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border:
            theme.palette.mode === "dark"
              ? "2px solid rgba(120,160,255,0.35)"
              : "2px solid rgba(72,118,255,0.25)",
          animation: "pulseRing 3s ease-in-out infinite",
        },
        "@keyframes pulseRing": {
          "0%,100%": { boxShadow: "0 0 10px rgba(72,118,255,0.35)" },
          "50%": { boxShadow: "0 0 26px rgba(72,118,255,0.6)" },
        },
      }}
    >
      {!snapshotUrl ? (
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <Image
          src={snapshotUrl}
          alt="Captured"
          fill
          style={{ objectFit: "cover" }}
        />
      )}
    </Box>

    {/* Buttons */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: 1.5,
        flexWrap: "wrap",
        pt:{xs:10, sm:3},
        mb: { xs: 1.5, sm: 2 },
      }}
    >
      {!snapshotUrl ? (
        <>
          <GlassButton onClick={onCancel}>Cancel</GlassButton>
          <GlassButton
            onClick={handleCapture}
            disabled={!cameraReady}
            variant="contained"
          >
            {cameraReady ? "Capture" : "Loading…"}
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