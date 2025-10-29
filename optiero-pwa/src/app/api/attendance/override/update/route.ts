import { NextRequest, NextResponse } from "next/server";
import { normalizeApiError, normalizeClientError } from "@/lib/errorHandler/errorHandler";

const ATTENDANCE_API_URL =
  process.env.ATTENDANCE_API_URL ?? "http://localhost:5261/api/attendance";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // basic validation before sending to backend
    if (!body.sessionId || !body.employeeId || !body.actionTime || !body.reason || !body.attendanceAction) {
      return NextResponse.json(
        { error: "Missing required fields in request body." },
        { status: 400 }
      );
    }

    const res = await fetch(`${ATTENDANCE_API_URL}/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const normalized = await normalizeApiError(res);
      console.error("Backend Error:", normalized);
      return NextResponse.json(
        { error: normalized.message, title: normalized.title },
        { status: normalized.status }
      );
    }

    const data = await res.text(); // backend returns "Successfully Updated"
    return NextResponse.json({ message: data }, { status: 200 });
  } catch (err) {
    const normalized = normalizeClientError(err);
    console.error("Client Error:", normalized);
    return NextResponse.json(
      { error: normalized.message, title: normalized.title },
      { status: normalized.status }
    );
  }
}
