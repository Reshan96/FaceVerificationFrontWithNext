// src/app/api/employees/get/route.ts
import { NextRequest, NextResponse } from "next/server";
import { normalizeApiError, normalizeClientError } from "@/lib/errorHandler/errorHandler";

const EMPLOYEE_API_URL =
  process.env.EMPLOYEE_API_URL ?? "http://localhost:5261/api/employee";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId");

    if (!branchId) {
      return NextResponse.json(
        { error: "branchId is required" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${EMPLOYEE_API_URL}/get/all?branchId=${encodeURIComponent(branchId)}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      // normalize backend error (400/500)
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
    // normalize client / network errors (e.g., backend down)
    const normalized = normalizeClientError(err);
    console.error("Client Error:", normalized);
    return NextResponse.json(
      { error: normalized.message, title: normalized.title },
      { status: normalized.status }
    );
  }
}
