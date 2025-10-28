import { NextRequest, NextResponse } from "next/server";
import { normalizeApiError, normalizeClientError } from "@/lib/errorHandler/errorHandler";

const ATTENDANCE_API_URL =
  process.env.ATTENDANCE_API_URL ?? "http://localhost:5261/api/attendance";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // safety validation – frontend must send required fields
    if (!body.employeeId || !body.actionTime || !body.reason || !body.branchId) {
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

    // Return backend’s response to client (it returns string “Successfully Updated”)
    const data = await res.text();
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
