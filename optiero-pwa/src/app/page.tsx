"use client";

import { Box} from "@mui/material";
import HomeClock from "@/components/home/HomeClock"

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        pt: { xs: 10, sm: 12 },
        background: `
          radial-gradient(800px 400px at 50% 0%, rgba(72,118,255,0.25), transparent 80%),
          linear-gradient(180deg, #0b1020 0%, #090d1a 100%)
        `,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <HomeClock/>
    </Box>
  );
}