import { NextRequest, NextResponse } from "next/server";
import { normalizeApiError, normalizeClientError } from "@/lib/errorHandler/errorHandler";

const ATTENDANCE_API_URL =
  process.env.ATTENDANCE_API_URL ?? "http://localhost:5261/api/attendance";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${ATTENDANCE_API_URL}/check`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      const normalized = await normalizeApiError(res);
      console.error("Attendance Check API Error:", normalized);
      return NextResponse.json(
        { error: normalized.message, title: normalized.title },
        { status: normalized.status }
      );
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "content-type": contentType || "text/plain" },
    });
    
  } catch (err) {
    const normalized = normalizeClientError(err);
    console.error("Attendance Check Client Error:", normalized);
    return NextResponse.json(
      { error: normalized.message, title: normalized.title },
      { status: normalized.status }
    );
  }
}
