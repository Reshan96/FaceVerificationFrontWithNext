// src/app/api/attendance/summary/route.ts
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
      const msg = await res.text();
      throw new Error(`API ${res.status}: ${msg}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Error fetching attendance summary:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
