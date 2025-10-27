import { AttendanceActionCode, AttendancePayload } from "./types";

export function buildPayload(
  action: "in" | "out" | "breakStart" | "breakEnd",
  params: {
    employeeId: number;
    branchId?: number | null;
    sessionId?: number | null;
  }
): { endpoint: string; body: AttendancePayload } {
  const occurredAtUtc = new Date().toISOString();

  switch (action) {
    case "in":
      if (!params.branchId)
        throw new Error("BranchId is required for Check-In");

      return {
        endpoint: "/api/attendance/check",
        body: {
          EmployeeId: params.employeeId,
          BranchId: params.branchId,
          ActionTaken: AttendanceActionCode.CheckIn,
          OccurredAtUtc: occurredAtUtc,
        },
      };

    case "out":
      if (!params.sessionId)
        throw new Error("SessionId is required for Check-Out");

      return {
        endpoint: "/api/attendance/check",
        body: {
          EmployeeId: params.employeeId,
          SessionId: params.sessionId,
          ActionTaken: AttendanceActionCode.CheckOut,
          OccurredAtUtc: occurredAtUtc,
        },
      };

    case "breakStart":
      if (!params.sessionId)
        throw new Error("SessionId is required for BreakStart");

      return {
        endpoint: "/api/attendance/break",
        body: {
          EmployeeId: params.employeeId,
          SessionId: params.sessionId,
          ActionTaken: AttendanceActionCode.BreakStart,
          OccurredAtUtc: occurredAtUtc,
        },
      };

    case "breakEnd":
      if (!params.sessionId)
        throw new Error("SessionId is required for BreakEnd");

      return {
        endpoint: "/api/attendance/break",
        body: {
          EmployeeId: params.employeeId,
          SessionId: params.sessionId,
          ActionTaken: AttendanceActionCode.BreakEnd,
          OccurredAtUtc: occurredAtUtc,
        },
      };
  }
}
