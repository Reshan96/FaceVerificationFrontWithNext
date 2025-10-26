"use client";

import * as React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  PaletteMode,
} from "@mui/material";
import { Roboto } from "next/font/google";
import Header from "@/components/common/Header";

const roboto = Roboto({ subsets: ["latin"], weight: ["300", "400", "500", "700"] });

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  // 👇 Use lazy init to avoid touching window/localStorage on server
  const [mode, setMode] = React.useState<PaletteMode>("dark");

  React.useEffect(() => {
    const stored = localStorage.getItem("mode") as PaletteMode | null;
    if (stored) setMode(stored);
  }, []);

  const toggleColorMode = React.useCallback(() => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("mode", next);
      return next;
    });
  }, []);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: { mode },
        shape: { borderRadius: 16 },
        typography: { fontFamily: roboto.style.fontFamily },
      }),
    [mode]
  );

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Header toggleColorMode={toggleColorMode} />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}