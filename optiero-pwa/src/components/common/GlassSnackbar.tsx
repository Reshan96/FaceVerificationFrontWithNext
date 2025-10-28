"use client";

import {
  Snackbar,Alert,AlertColor,
  Button,useTheme,Slide,SlideProps,
} from "@mui/material";
import { useRouter } from "next/navigation";

type GlassSnackbarProps = {
  open: boolean;
  message: string;
  severity?: AlertColor;
  onClose: () => void;
  showHomeButton?: boolean;
  autoHide?: boolean; // default: true
  autoHideDuration?: number; // ms, default: 5000
};

function SlideUp(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

export default function GlassSnackbar({
  open,
  message,
  severity = "error",
  onClose,
  showHomeButton = false,
  autoHide = true,
  autoHideDuration = 5000,
}: GlassSnackbarProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Snackbar
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      autoHideDuration={autoHide ? autoHideDuration : null}
      // ✅ New MUI v7 slots API for transitions
      slots={{
        transition: SlideUp,
      }}
    >
      <Alert
        severity={severity}
        onClose={onClose}
        sx={{
          backdropFilter: "blur(16px) saturate(180%)",
          backgroundColor:
            theme.palette.mode === "light"
              ? "rgba(255,255,255,0.75)"
              : "rgba(17,25,40,0.7)",
          border: "1px solid rgba(255,255,255,0.25)",
          color: theme.palette.text.primary,
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 1,
          "& .MuiAlert-icon": {
            color: severity === "error" ? "#ff5f56" : undefined,
          },
        }}
        variant="filled"
      >
        {message}
        {showHomeButton && (
            <Button
    size="small"
    onClick={() => {
      router.push("/");
      onClose();
    }}
    sx={{
      ml: 2,
      px: 2.5,
      py: 0.5,
      textTransform: "none",
      fontWeight: 600,
      borderRadius: 3,
      border: "1px solid rgba(255, 255, 255, 0.4)",
      backdropFilter: "blur(10px) saturate(150%)",
      backgroundColor:
        theme.palette.mode === "light"
          ? "rgba(255,255,255,0.3)"
          : "rgba(255,255,255,0.1)",
      color: theme.palette.text.primary,
      transition: "all 0.25s ease",
      "&:hover": {
        backgroundColor:
          theme.palette.mode === "light"
            ? "rgba(255,255,255,0.5)"
            : "rgba(255,255,255,0.25)",
        borderColor: "rgba(255,255,255,0.6)",
        transform: "translateY(-1px)",
        boxShadow:
          theme.palette.mode === "light"
            ? "0 2px 12px rgba(0,0,0,0.15)"
            : "0 2px 12px rgba(255,255,255,0.15)",
      },
      "&:active": {
        transform: "scale(0.97)",
      },
    }}
  >
    Back to Home
  </Button>
        )}
      </Alert>
    </Snackbar>
  );
}
