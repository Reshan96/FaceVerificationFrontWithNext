import { NextRequest, NextResponse } from "next/server";
import { VerifyResponse, OpenSession } from "@/lib/types/types";
import { normalizeApiError, normalizeClientError } from "@/lib/errorHandler/errorHandler";

const FACE_VERIFICATION_API_URL =
  process.env.FACE_VERIFICATION_API_URL ?? "http://localhost:5261/api/face-verification";

const EMPLOYEE_API_URL =
  process.env.EMPLOYEE_API_URL ?? "http://localhost:5261/api/employee";

export async function POST(req: NextRequest) {
  console.log("📸 /api/verify request received");

  try {
    const formData = await req.formData();
    const image = formData.get("image") as Blob | null;
    const employeeId = formData.get("employeeId") as string | null;

    if (!image || !employeeId) {
      return NextResponse.json(
        { error: "Missing image or employeeId", title: "Bad Request" },
        { status: 400 }
      );
    }

    const faceForm = new FormData();
    faceForm.append("image", image);
    faceForm.append("employeeId", employeeId);

    const faceUrl = `${FACE_VERIFICATION_API_URL}/verify`;
    const sessionUrl = `${EMPLOYEE_API_URL}/session?employeeId=${encodeURIComponent(employeeId)}`;

    const [faceRes, sessionRes] = await Promise.all([
      fetch(faceUrl, { method: "POST", body: faceForm }),
      fetch(sessionUrl, { cache: "no-store" }),
    ]);

    // Handle face API errors
    if (!faceRes.ok) {
      const normalized = await normalizeApiError(faceRes);
      console.error("Face API Error:", normalized);
      return NextResponse.json(
        { error: normalized.message, title: normalized.title },
        { status: normalized.status }
      );
    }

    // arse face verification response
    const face = (await faceRes.json().catch(() => null)) ?? {};
    const match = Boolean(face.match);
    const verificationScore = Number(face.verificationScore ?? 0);

    // Fetch open session if face matched
    let openSession: OpenSession = null;
    if (match && sessionRes.ok) {
      const js = await sessionRes.json().catch(() => null);
      openSession = js ?? null;
    } else if (!sessionRes.ok && sessionRes.status !== 404) {
      const normalized = await normalizeApiError(sessionRes);
      console.error("Session API Error:", normalized);
      return NextResponse.json(
        { error: normalized.message, title: normalized.title },
        { status: normalized.status }
      );
    }

    return NextResponse.json<VerifyResponse>({
      match,
      verificationScore,
      openSession,
    });
  } catch (err) {
    const normalized = normalizeClientError(err);
    console.error("Client Error:", normalized);
    return NextResponse.json(
      { error: normalized.message, title: normalized.title },
      { status: normalized.status }
    );
  }
}
