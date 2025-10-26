"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  useTheme,
} from "@mui/material";
import EmployeeSearch from "./EmployeeSearch";
import type { Employee } from "@/lib/types/types";
import { useSelection } from "@/lib/stores/selectionStore";

export default function EmployeeList({ employees }: { employees: Employee[] }) {
  const router = useRouter();
  const theme = useTheme();
  const setSelected = useSelection((s) => s.setSelectedEmployee);

  const handleSelect = (emp: Employee) => {
    setSelected(emp);
    router.push(`/capture?userId=${encodeURIComponent(emp.employeeId)}`);
  };

  const glass = {
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
    transition: "all 0.3s ease",
  } as const;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
        px: { xs: 2, sm: 4 },
        pb: 4,
        mt:5
      }}
    >
      {/* 🔍 Search Bar */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 5 }}>
        <EmployeeSearch
          employees={employees}
          onSelect={handleSelect}
          sx={{
            width: "100%",
            maxWidth: 500,
            ...glass,
            borderRadius: 4,
            p: 1,
          }}
        />
      </Box>

      {/* 🌀 Carousel */}
    <Swiper
  slidesPerView={1.2}
  spaceBetween={20}
  grabCursor
  centeredSlides={false}
  slidesOffsetBefore={20}
  slidesOffsetAfter={20}
  breakpoints={{
    600: { slidesPerView: 2.2 },
    900: { slidesPerView: 3.2 },
    1200: { slidesPerView: 4.2 },
  }}
  style={{
    paddingBottom: "40px",  // ✅ subtle bottom gap
    paddingTop: "20px"
  }}
>
  {employees.map((emp) => (
    <SwiperSlide
      key={emp.employeeId}
      style={{
        width: 260,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <motion.div whileHover={{ scale: 1.04 }}>
        <Card
          elevation={0}
          sx={{
            width: 240,
            borderRadius: 5,
            overflow: "hidden",
            textAlign: "center",
            ...glass,
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow:
                theme.palette.mode === "light"
                  ? "0 6px 32px rgba(0,0,0,0.15)"
                  : "0 6px 32px rgba(0,0,0,0.8)",
            },
          }}
        >
          <CardActionArea onClick={() => handleSelect(emp)}>
            <Box
              sx={{
                width: "100%",
                height: 240,        // ⬆️ increased from 220 → 240
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Image
                src="https://i.pravatar.cc/300?img=1"
                alt={emp.firstName}
                fill
                style={{ objectFit: "cover" }}
              />
            </Box>

            <CardContent sx={{ py: 2 }}>
              <Typography
                variant="h6"
                fontWeight={600}
                noWrap
                sx={{ textOverflow: "ellipsis", maxWidth: "100%" }}
              >
                {emp.firstName} {emp.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {emp.employeeCode}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </motion.div>
    </SwiperSlide>
  ))}
</Swiper>
    </Box>
  );
}
