// src/app/api/attendance/summary/route.ts
import { normalizeApiError, normalizeClientError } from "@/lib/errorHandler/errorHandler";
import { NextRequest, NextResponse } from "next/server";

const ATTENDANCE_SUMMARY_API_URL =
  process.env.ATTENDANCE_SUMMARY_API_URL ?? "http://localhost:5261/api/attendance-summary";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId");
    const dateTime = searchParams.get("dateTime");

    if (!branchId || !dateTime) {
      return NextResponse.json(
        { error: "branchId and dateTime are required" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${ATTENDANCE_SUMMARY_API_URL}/get?branchId=${encodeURIComponent(branchId)}&dateTime=${encodeURIComponent(dateTime)}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      const normalized = await normalizeApiError(res);
      console.error("API Error:", normalized);
      return NextResponse.json(
        { error: normalized.message, title: normalized.title },
        { status: normalized.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (err) {
    const normalized = normalizeClientError(err);
    console.error("Client Error:", normalized);
    return NextResponse.json(
      { error: normalized.message, title: normalized.title },
      { status: normalized.status }
    );
  }
}
