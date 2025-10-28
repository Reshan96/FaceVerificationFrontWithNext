"use client";

import {useEffect, useState} from"react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
} from "@mui/material";
import GlassButton from "@/components/common/GlassButton";
import { useRouter } from "next/navigation";
import { useBranchStore } from "@/lib/stores/branchStore";


function getGreeting(hour: number) {
  if (hour < 12) return "Good Morning!";
  if (hour < 18) return "Good Afternoon!";
  return "Good Evening!";
}


export default function HomeClock() {
  const {setBranchId} = useBranchStore();
  const theme = useTheme();
  const router = useRouter();
  const [time, setTime] = useState(new Date());
  const branchId = 1;

  // update every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");
  const greeting = getGreeting(time.getHours());
  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        mt: 6,
        px: 2,
      }}
    >
     <Card
        elevation={0}
        sx={{
            width: { xs: "100%", sm: 700 },
            maxWidth: "95vw",
            p: { xs: 3, sm: 4 },
            borderRadius: 6,
            backdropFilter: "blur(20px) saturate(180%)",
            backgroundColor:
            theme.palette.mode === "light"
                ? "rgba(255, 255, 255, 0.55)"
                : "rgba(17, 25, 40, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            boxShadow:
            theme.palette.mode === "light"
                ? "0 4px 24px rgba(0,0,0,0.1)"
                : "0 4px 24px rgba(0,0,0,0.6)",
            textAlign: "center",
            transition: "all 0.3s ease",
            "&:hover": {
            transform: "translateY(-4px)",
            boxShadow:
                theme.palette.mode === "light"
                ? "0 6px 32px rgba(0,0,0,0.15)"
                : "0 6px 32px rgba(0,0,0,0.8)",
            },
        }}
        >
        <CardContent>
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              fontWeight: 500,
              color: theme.palette.text.primary,
            }}
          >
            Hello,&nbsp;{greeting}
          </Typography>

          {/* Digital clock */}
          <Typography
            variant="h2"
            sx={{
                letterSpacing: 4,
                mb: 1,
                fontWeight: 600,
                color: theme.palette.text.primary,
                textShadow:
                theme.palette.mode === "dark"
                    ? "0 0 12px rgba(120,160,255,0.35)"
                    : "0 0 6px rgba(60,60,60,0.25)",
            }}
            >
            {hours} : {minutes} : {seconds}
          </Typography>

          {/* Date */}
          <Typography
            variant="subtitle1"
            sx={{ color: theme.palette.text.secondary, mb: 4 }}
          >
            {formattedDate}
          </Typography>

          <GlassButton
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 1.2,
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
            }}
            onClick={() =>{
              setBranchId(branchId);
              router.push("/employees");
            }}
          >
            Verify
          </GlassButton>
        </CardContent>
      </Card>
    </Box>
  );
}