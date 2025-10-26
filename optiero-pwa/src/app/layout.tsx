import type { Metadata, Viewport } from "next";
import ThemeRegistry from "@/components/ThemeRegistry";

export const metadata: Metadata = {
   title: "Face Verification",
  description: "Face-based attendance system",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#1976d2"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100dvh" }}>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}