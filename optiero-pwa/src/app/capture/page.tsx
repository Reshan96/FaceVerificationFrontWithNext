"use client";

import { Box } from "@mui/material";
import CameraViewCard from "@/components/camera/CameraViewCard";
import { useRouter } from "next/navigation";
import { useSelection } from "@/lib/stores/selectionStore";

export default function CapturePage() {
  const router = useRouter();
  const selectedEmployee = useSelection((s) => s.selectedEmployee);

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
        height: "100svh", // ensures safe full height across browsers
        width: "100%",
        overflow: "hidden", // removes scroll bar / black edge
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: `
          radial-gradient(800px 400px at 50% 0%, rgba(72,118,255,0.25), transparent 80%),
          linear-gradient(180deg, #0b1020 0%, #090d1a 100%)
        `,
        pt:{xs:8, sm:8},
        px: { xs: 1.5, sm: 2 },
        pb: 0,
      }}
    >
      <CameraViewCard
        userName={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
        onCancel={() => router.back()}
        onCaptured={(blob) => {
          const url = URL.createObjectURL(blob);
          router.push(`/verify?photo=${encodeURIComponent(url)}`);
        }}
      />
    </Box>
  );
}