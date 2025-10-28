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

export default function AdminSessionForm({ open, onClose, onCreated }: Props) {
  const { branchId } = useBranchStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [state, setState] = useState<FormState>({
    employee: null,
    action: "SignIn",
    time: dayjs(),
    remarks: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: "error"|"success" }>({
    open: false, msg: "", sev: "success"
  });

const [data, setData] = useState<Employee[]>([]);
const [loading, setLoading] = useState(false);
const [fetchError, setFetchError] = useState<string | null>(null);
const [snackbarOpen, setSnackbarOpen] = useState(false);

// --- fetch employees (your pattern)
const fetchEmployees = async (id: number): Promise<void> => {
  setLoading(true);
  setFetchError(null);

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
    setFetchError(normalized.message);
    setSnackbarOpen(true);
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
  if (!state.employee || !state.remarks.trim()) {
    setSnack({
      open: true,
      msg: "Please select an employee and add remarks before saving.",
      sev: "error",
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
    setSnack({
      open: true,
      msg: "Session created successfully 🎉",
      sev: "success",
    });

    onCreated?.(); // refresh table
    onClose();
    setState({
      employee: null,
      action: "SignIn",
      time: dayjs(),
      remarks: "",
    });
  } catch (err: unknown) {
    const normalized = normalizeClientError(err);
    console.error("Submit error:", normalized);
    setSnack({
      open: true,
      msg: normalized.message || "Failed to create session.",
      sev: "error",
    });
  } finally {
    setSubmitting(false);
  }
};

  return (
    <>
      <GlassModal open={open} onClose={onClose}>
        <Stack spacing={2.5}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AddRounded />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Manual Sign-In
            </Typography>
          </Stack>

          {loadingEmployees ? (
            <GlassLoader message="Loading employees..." height={160} />
          ) : (
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
                <Button onClick={onClose} variant="outlined" disabled={submitting}>
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
          )}
        </Stack>
      </GlassModal>

      <GlassSnackbar
        open={snack.open}
        message={snack.msg}
        severity={snack.sev}
        autoHideDuration={snack.sev === "success" ? 3000 : 5000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      />
    </>
  );
}
