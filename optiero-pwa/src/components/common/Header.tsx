// components/layout/Header.tsx
"use client";

import * as React from "react";
import {
  AppBar, Toolbar, IconButton, Typography, Box, Menu, MenuItem, useTheme,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useRouter } from "next/navigation";

export default function Header({ toggleColorMode }: { toggleColorMode: () => void }) {
  const router = useRouter();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        width: { xs: "94%", sm: "90%" },
        borderRadius: 4,
        backdropFilter: "blur(20px) saturate(180%)",
        backgroundColor: theme.palette.mode === "light"
          ? "rgba(255,255,255,0.55)"
          : "rgba(17,25,40,0.6)",
        border: "1px solid rgba(255,255,255,0.25)",
        boxShadow: theme.palette.mode === "light"
          ? "0 4px 24px rgba(0,0,0,0.1)"
          : "0 4px 24px rgba(0,0,0,0.6)",
        zIndex: theme.zIndex.appBar + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Left: home + title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton color="inherit" onClick={() => router.push("/")}>
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Optiero Login
          </Typography>
        </Box>

        {/* Right: theme toggle + menu */}
        <Box>
          <IconButton color="inherit" onClick={toggleColorMode}>
            {theme.palette.mode === "light" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
          </IconButton>
          <IconButton color="inherit" onClick={handleMenu}>
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            {/* New "Summary" item placed BEFORE Login/Logout */}
            <MenuItem
              onClick={() => {
                handleClose();
                router.push("/summary");
              }}
            >
              Summary
            </MenuItem>
            <MenuItem onClick={handleClose}>Login</MenuItem>
            <MenuItem onClick={handleClose}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
