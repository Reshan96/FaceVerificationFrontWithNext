export type User = {
  id: string;
  fullName: string;
  avatarUrl: string; // round photo
};

export type Employee = {
  employeeId: number;
  firstName: string;
  lastName: string;
  employeeCode: string;
  branchId: number;
  designation: string;
};

export type EmployeeAttendanceStatus = "Open" | "OnBreak" | "Closed" | "OnLeave";

export type EmployeeAttendance = {
  sessionId: number
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  branchId: number;
  attendanceStatus: EmployeeAttendanceStatus;
  department?: string | null;
  checkInTime?: string | null;   // ISO string (for design)
  checkOutTime?: string | null;  // ISO string
  totalMinutesWorked: number;
  overTimeMinutes: number;
  breakMinutes: number;
};

export type BackendAttendance = Omit<EmployeeAttendance, "attendanceStatus"> & {
  attendanceStatus: number;
};



export type OpenSession = {
  sessionId: number;
  sessionStatus: SessionStatus;
} | null;

export enum SessionStatus {
  Open = 1,
  OnBreak = 2,
  Closed = 3,
}

export type VerifyResponse = {
  match: boolean;
  verificationScore: number;
  openSession: OpenSession; // null if none
};

export type VerificationState =
  | "idle"
  | "capturing"
  | "captured"
  | "verifying"
  | "verified"
  | "failed";

export interface UserCarouselProps {
  users: Employee[];
  onSelect: (user: User) => void;
  autoScroll?: boolean; // slow auto scroll
}

export interface CameraCaptureProps {
  userName: string;
  onCaptured: (blob: Blob) => void;
  onCancel?: () => void;
}


// Attendance action enum
export enum AttendanceActionCode {
  CheckIn = 1,
  BreakStart = 2,
  BreakEnd = 3,
  CheckOut = 4,
}

type ISO8601 = string;

// common base for both forms
interface AttendanceBasePayload {
  EmployeeId: number;
  ActionTaken: AttendanceActionCode;
  OccurredAtUtc: ISO8601;
}

// /Attendance/check form
export interface CheckPayload extends AttendanceBasePayload {
  BranchId?: number | null;     // required only for CheckIn
  SessionId?: number | null;    // required only for CheckOut
}

// /Attendance/break form
export interface BreakPayload extends AttendanceBasePayload {
  SessionId: number;
}

// unified union
export type AttendancePayload = CheckPayload | BreakPayload;
