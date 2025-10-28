import { NextRequest, NextResponse } from "next/server";

const EMPLOYEE_API_URL =
  process.env.EMPLOYEE_API_URL ?? "http://localhost:5261/api/employee";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId");
    if (!branchId)
      return NextResponse.json(
        { error: "branchId is required" },
        { status: 400 },
      );

    const res = await fetch(
      `${EMPLOYEE_API_URL}/get/all?branchId=${encodeURIComponent(branchId)}`,
      {
        cache: "no-store",
        method: "GET",
      },
    );

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`API ${res.status}: ${msg}`);
    }

    return NextResponse.json(await res.json());

  } catch (err) {
    console.error("Error in getUsers route:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );

  }
}
