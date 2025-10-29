"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  MenuItem,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import EditCalendarRounded from "@mui/icons-material/EditCalendarRounded";
import NotesRounded from "@mui/icons-material/NotesRounded";
import PersonRounded from "@mui/icons-material/PersonRounded";
import GlassModal from "../common/GlassModal";
import GlassSnackbar from "../common/GlassSnackbar";
import type { EmployeeAttendance } from "@/lib/types/types";
import { AttendanceActionCode } from "@/lib/types/types";
import { normalizeClientError } from "@/lib/errorHandler/errorHandler";

type Props = {
  open: boolean;
  onClose: () => void;
  session: EmployeeAttendance | null; // selected session row
  onUpdated?: () => void; // optional callback to refresh summary
};

export default function AdminSessionUpdateForm({ open, onClose, session, onUpdated }: Props) {
  const [remarks, setRemarks] = useState("");
  const [time, setTime] = useState<Dayjs>(dayjs());
  const [action, setAction] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "error" | "success" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleClose = () => {
    setRemarks("");
    setTime(dayjs());
    setAction("");
    onClose();
  };

  // pick allowed actions based on current session status
  const availableActions = (() => {
    switch (session?.attendanceStatus) {
      case "Open":
        return [
          { label: "Break Start", value: AttendanceActionCode.BreakStart },
          { label: "Check Out", value: AttendanceActionCode.CheckOut },
        ];
      case "OnBreak":
        return [
          { label: "Break End", value: AttendanceActionCode.BreakEnd },
          { label: "Check Out", value: AttendanceActionCode.CheckOut },
        ];
      default:
        return [];
    }
  })();

  // minDateTime = checkInTime (if exists)
  const minDateTime = session?.checkInTime ? dayjs(session.checkInTime) : dayjs().startOf("day");

  const handleSubmit = async () => {
    if (!action) {
      setToast({ open: true, message: "Please select an action.", severity: "error" });
      return;
    }
    if (!remarks.trim()) {
      setToast({ open: true, message: "Please enter a remark.", severity: "error" });
      return;
    }
    if (!session) {
      setToast({ open: true, message: "No session selected.", severity: "error" });
      return;
    }
setSubmitting(true);
    try {
      const payload = {
        employeeId: session.employeeId,
        sessionId: session.sessionId,
        actionTime: time.toISOString(),
        attendanceAction: action,
        reason: remarks.trim(),
      };

      const res = await fetch("/api/attendance/override/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const msg =
          errJson?.error ||
          errJson?.message ||
          `HTTP ${res.status} - ${res.statusText || "Request failed"}`;
        throw new Error(msg);
      }

      setToast({ open: true, message: "Session updated successfully 🎉", severity: "success" });
      onUpdated?.();
      handleClose();
    } catch (err: unknown) {
      const normalized = normalizeClientError(err);
      console.error("Update error:", normalized);
      setToast({
        open: true,
        message: normalized.message || "Failed to update session.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <GlassModal open={open} onClose={handleClose}>
        <Stack spacing={2.5}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Update Attendance Session
          </Typography>

          {/* Employee name */}
          <TextField
            label="Employee"
            value={session?.employeeName ?? ""}
            disabled
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonRounded fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {/* Action dropdown */}
          <TextField
            label="Action"
            select
            value={action}
            onChange={(e) => setAction(Number(e.target.value))}
            disabled={!availableActions.length}
          >
            {availableActions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Time picker */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Time"
              value={time}
              onChange={(d) => d && setTime(d)}
              minDateTime={minDateTime}
              shouldDisableDate={(d) => !d.isSame(dayjs(), "day")}
              slotProps={{
                textField: {
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EditCalendarRounded fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                },
              }}
            />
          </LocalizationProvider>

          {/* Remarks */}
         <TextField
            label="Remarks"
            multiline
            minRows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1 }}>
                  <NotesRounded fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

         {/* Buttons */}
          <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 0.5 }}>
            <Button onClick={handleClose} variant="outlined" disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={submitting || !action}
              endIcon={submitting ? <CircularProgress size={18} /> : undefined}
            >
              Save
            </Button>
          </Stack>
        </Stack>

      </GlassModal>

      <GlassSnackbar
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        autoHideDuration={toast.severity === "success" ? 3000 : 5000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </>
  );
}