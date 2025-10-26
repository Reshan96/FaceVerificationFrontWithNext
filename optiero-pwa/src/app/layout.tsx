import type { Metadata } from "next";
import ThemeRegistry from "@/components/ThemeRegistry";

export const metadata: Metadata = {
  title: "Optiero",
  description: "Face verification kiosk",
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