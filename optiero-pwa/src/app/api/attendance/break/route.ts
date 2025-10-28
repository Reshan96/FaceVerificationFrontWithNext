import { NextRequest, NextResponse } from "next/server";

const ATTENDANCE_API_URL =
  process.env.ATTENDANCE_API_URL ?? "http://localhost:5261/api/attendance";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${ATTENDANCE_API_URL}/break`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    const text = await res.text();
    const contentType = res.headers.get("content-type") || "application/json";
    return new NextResponse(text, {
      status: res.status,
      headers: { "content-type": contentType },
    });
  } catch (err) {
    console.error("Error in /attendance/break route:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
