"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Stack, TextField, Typography, MenuItem,
  InputAdornment, Avatar, CircularProgress
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import PersonRounded from "@mui/icons-material/PersonRounded";
import EditCalendarRounded from "@mui/icons-material/EditCalendarRounded";
import NotesRounded from "@mui/icons-material/NotesRounded";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import Autocomplete from "@mui/material/Autocomplete";
import GlassModal from "../common/GlassModal";
import GlassSnackbar from "../common/GlassSnackbar";
import GlassLoader from "../common/GlassLoader";
import { useBranchStore } from "@/lib/stores/branchStore";
import { normalizeClientError } from "@/lib/errorHandler/errorHandler";
import { AttendanceActionCode, type Employee } from "@/lib/types/types";

type FormState = {
  employee: Employee | null;
  action: "SignIn";
  time: Dayjs;
  remarks: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void; // call after successful submit to refresh table
};

export default function AdminSessionCheckInForm({ open, onClose, onCreated }: Props) {
  const { branchId } = useBranchStore();

  const [state, setState] = useState<FormState>({
    employee: null,
    action: "SignIn",
    time: dayjs(),
    remarks: "",
  });

const [submitting, setSubmitting] = useState(false);
const [data, setData] = useState<Employee[]>([]);
const [loading, setLoading] = useState(false);

const [toast, setToast] = useState<{ open: boolean; message: string; severity: "error" | "success" }>({
  open: false,
  message: "",
  severity: "success",
});

const resetToast = () => {
    setToast({open: false, message:"", severity: "success"});
}

const resetForm = () => {

  setState({
    employee: null,
    action: "SignIn",
    time: dayjs(),
    remarks: "",
  });

  setToast((t) => ({ ...t, open: false }));
};

const handleClose = () => {
  resetForm();
  onClose();
};

// --- fetch employees (your pattern)
const fetchEmployees = async (id: number): Promise<void> => {
  setLoading(true);
  resetToast();

  try {
    const res = await fetch(`/api/employees/get?branchId=${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const message =
        errJson?.error ||
        errJson?.message ||
        `HTTP ${res.status} - ${res.statusText || "Request failed"}`;
      throw new Error(message);
    }

    const json = (await res.json()) as Employee[];
    setData(json);

  } catch (err: unknown) {

    const normalized = normalizeClientError(err);
    console.error("Fetch error:", normalized);
    setToast({ open: true, message: normalized.message, severity: "error" });
    setData([]);
    
  } finally {
    setLoading(false);
  }
};

// --- call it when dialog opens or branch changes
useEffect(() => {
  if (!open || !branchId) return;
  void fetchEmployees(branchId);
},[open, branchId])


const handleSubmit = async () => {

  resetToast();

  if (!state.employee || !state.remarks.trim()) {
    setToast({
      open: true,
      message: "Please select an employee and add remarks before saving.",
      severity: "error",
    });
    return;
  }

  setSubmitting(true);

  try {
    const payload = {
      employeeId: state.employee.employeeId,
      actionTime: state.time.toISOString(),
      attendanceAction: AttendanceActionCode.CheckIn,
      reason: state.remarks.trim(),
      branchId: branchId,
    };

    const res = await fetch("/api/attendance/override/checkin", {
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

    // success
    setToast({ open: true, message: "Session created successfully 🎉", severity: "success" });

    onCreated?.(); // refresh table
    handleClose();

  } catch (err: unknown) {
    const normalized = normalizeClientError(err);
    console.error("Submit error:", normalized);
    setToast({
      open: true,
      message: normalized.message || "Failed to create session.",
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
          <Stack direction="row" alignItems="center" spacing={1}>
            <AddRounded />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Manual Sign-In
            </Typography>
          </Stack>
            <>
              {/* Employee */}
              <Autocomplete
                value={state.employee}
                onChange={(_, v) => setState((s) => ({ ...s, employee: v }))}
                options={data}
                loading={loading}
                getOptionLabel={(o) =>`${o.firstName} ${o.lastName}`}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Employee"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonRounded fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                ListboxProps={{
                  sx: { maxHeight: 240 },
                }}
                renderOption={(props, option) => (
                  <li {...props} key={option.employeeId}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {/* <Avatar
                        sx={{ width: 28, height: 28 }}
                        src={option.avatarUrl}
                        alt={option.employeeName}
                      >
                        {option.employeeName.slice(0, 1)}
                      </Avatar> */}
                      <Typography sx={{ fontWeight: 500 }}>
                        {`${option.firstName} ${option.lastName}`}
                        </Typography>
                    </Stack>
                  </li>
                )}
                isOptionEqualToValue={(a, b) => a.employeeId === b.employeeId}
              />

              {/* Action (fixed to Sign In for create) */}
              <TextField label="Action" select value="SignIn" disabled>
                <MenuItem value="SignIn">Sign In</MenuItem>
              </TextField>

              {/* Time */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                    label="Time"
                    value={state.time}
                    onChange={(d) => d && setState((s) => ({ ...s, time: d }))}
                    // allow any time today, disable all other dates
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
                value={state.remarks}
                onChange={(e) => setState((s) => ({ ...s, remarks: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1 }}>
                      <NotesRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 0.5 }}>
                <Button onClick={handleClose} variant="outlined" disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={submitting}
                  endIcon={submitting ? <CircularProgress size={18} /> : undefined}
                >
                  Save
                </Button>
              </Stack>
            </>
          
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
