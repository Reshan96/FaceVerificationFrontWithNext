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
