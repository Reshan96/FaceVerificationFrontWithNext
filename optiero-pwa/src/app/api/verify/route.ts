import { NextRequest, NextResponse } from "next/server";
import { VerifyResponse, OpenSession } from "@/lib/types/types";

const FACE_VERIFICATION_API_URL =
  process.env.FACE_VERIFICATION_API_URL ?? "http://localhost:5261/api/FaceVerification";

const EMPLOYEE_API_URL = process.env.EMPLOYEE_API_URL ?? "http://localhost:5261/api/Employee";

export async function POST(req: NextRequest) {
    console.log("req recived");
  try {
    const formData = await req.formData();
    const image = formData.get("image") as Blob | null;
    const employeeId = formData.get("employeeId") as string | null;

    if (!image || !employeeId)
      return NextResponse.json(
        { error: "Missing image or employee Id" },
        { status: 400 },
      );

    const faceForm = new FormData();
    faceForm.append("image", image);
    faceForm.append("employeeId", employeeId);

    const faceUrl = `${FACE_VERIFICATION_API_URL}/verify`;
    const sessionUrl = `${EMPLOYEE_API_URL}/Session?employeeId=${encodeURIComponent(String(employeeId))}`;
    
    const [faceRes, sessionRes] = await Promise.all([
      fetch(faceUrl, { method:"POST", body: faceForm }),
      fetch(sessionUrl, { cache: "no-store" }),
    ]);

    // Handle face API errors
    if (!faceRes.ok) {
      const msg = await faceRes.text();
      return NextResponse.json(
        { error: `Face verification failed: ${msg}` },
        { status: 502 },
      );
    }

    const face = (await faceRes.json()) as {
      match: boolean;
      verificationScore: number;
    };

    let openSession: OpenSession = null;
    if (face.match && sessionRes.ok) {
      // Expecting: { sessionId: number, sessionStatus: 1|2|3 } or 404
      const js = await sessionRes.json().catch(() => null);
      openSession = js ?? null;
    } // if 404 or bad, leave as null

    return NextResponse.json<VerifyResponse>({
      match: face.match,
      verificationScore: face.verificationScore ?? 0,
      openSession,
    });

  } catch (err) {
    console.error("API verify error:", err);
    return NextResponse.json({error: "Internal server error",},{status: 500,},);
  }
}
