"use client";

import { Box } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelection } from "@/lib/stores/selectionStore";
import CameraViewCard from "@/components/camera/CameraViewCard";
import VerificationStepCard from "@/components/camera/VerificationStepCard";

type Phase = "capture" | "verify";

export default function CapturePage() {
  const router = useRouter();
  const selectedEmployee = useSelection((s) => s.selectedEmployee);
  const [phase, setPhase] = useState<Phase>("capture");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  if (!selectedEmployee) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          color: "#fff",
          textAlign: "center",
          background: `
            radial-gradient(800px 400px at 50% 0%, rgba(72,118,255,0.25), transparent 80%),
            linear-gradient(180deg, #0b1020 0%, #090d1a 100%)
          `,
        }}
      >
        <div>
          <p>User not found.</p>
          <button
            onClick={() => router.replace("/")}
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid #ddd",
              cursor: "pointer",
            }}
          >
            Back to list
          </button>
        </div>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100svh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: `
          radial-gradient(800px 400px at 50% 0%, rgba(72,118,255,0.25), transparent 80%),
          linear-gradient(180deg, #0b1020 0%, #090d1a 100%)
        `,
        pt: { xs: 8, sm: 8 },
        px: { xs: 1.5, sm: 2 },
      }}
    >
      {phase === "capture" && (
        <CameraViewCard
          userName={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
          onCancel={() => router.back()}
          onCaptured={(blob) => {
            const url = URL.createObjectURL(blob);
            setPhotoUrl(url);
            setPhase("verify");
          }}
        />
      )}

      {phase === "verify" && photoUrl && (
        <VerificationStepCard
          photoUrl={photoUrl}
          userName={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
          onDone={() => router.replace("/")}
        />
      )}
    </Box>
  );
}
