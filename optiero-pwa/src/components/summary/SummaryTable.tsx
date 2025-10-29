"use client";

import { useEffect, useMemo, useState} from "react";
import {
  Box,Card,CardContent,Typography,useTheme,Chip,Table,TableBody,
  TableCell,TableContainer,TableHead,TableRow,Paper,TablePagination,Stack,Divider,
  IconButton,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AddRounded from "@mui/icons-material/AddRounded";
import RefreshIcon from "@mui/icons-material/Refresh";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

import type {
    BackendAttendance,
  EmployeeAttendance,
  EmployeeAttendanceStatus,
} from "@/lib/types/types";

// ---------------- Helpers ----------------
import type { ChipProps } from "@mui/material";
import GlassLoader from "../common/GlassLoader";
import GlassSnackbar from "../common/GlassSnackbar";
import { normalizeApiError, normalizeClientError } from "@/lib/errorHandler/errorHandler";
import { useBranchStore } from "@/lib/stores/branchStore";
import AdminSessionCheckInForm from "./AdminSessionCheckInForm";
import AdminSessionUpdateForm from "./AdminSessionUpdateForm";




const statusColor = (s: EmployeeAttendanceStatus): ChipProps["color"] => {
  switch (s) {
    case "Open":
      return "success";
    case "OnBreak":
      return "warning";
    case "Closed":
      return "secondary";
    case "OnLeave":
      return "info";
    default:
      return "default";
  }
};

const statusLabel = (s: EmployeeAttendanceStatus): string => {
  switch (s) {
    case "Open":
      return "Open";
    case "OnBreak":
      return "On break";
    case "Closed":
      return "Closed";
    case "OnLeave":
      return "On leave";
    default:
      return s;
  }
};

/** Converts numeric backend enum → string-based frontend status */
function mapAttendanceStatus(value: number): EmployeeAttendanceStatus {
  switch (value) {
    case 1:
      return "Open";
    case 2:
      return "OnBreak";
    case 3:
      return "Closed";
    case 4:
      return "OnLeave";
    default:
      return "Open"; // fallback safety
  }
}

const toHHMM = (mins: number): string => {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

const formatTime = (iso?: string | null): string =>
  iso ? dayjs(iso).format("HH:mm") : "—";

// ---------------- Component ----------------
export default function SummaryTable() {
  const theme = useTheme();
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { branchId } = useBranchStore();


  const [rows, setRows] = useState<EmployeeAttendance[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [addSessionOpen, setAddSessionOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<EmployeeAttendance | null>(null);
  const [updateSessionOpen, setUpdateSessionOpen] = useState(false);

  const forceRefresh = () => {
    // triggers your useEffect by re-setting the same date
    setDate((prev) => prev.clone());
  };

  // ---------- Fetch Attendance Summary ----------
  useEffect(() => {

    const fetchData = async (): Promise<void> => {

      setLoading(true);
      setError(null);

      try {

        const formattedDate = date.format("YYYY-MM-DD");
        
        const res = await fetch(
          `/api/attendance/summary?branchId=${branchId}&dateTime=${formattedDate}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
            const errJson = await res.json().catch(() => null);
            const message =
                errJson?.error ||
                errJson?.message ||
                `HTTP ${res.status} - ${res.statusText || "Request failed"}`;
            throw new Error(message);
        }

        const json = (await res.json()) as BackendAttendance[];
        const data: EmployeeAttendance[] = json.map((item) => ({
        ...item,
        attendanceStatus: mapAttendanceStatus(item.attendanceStatus),
        }));

        setRows(data);

      } catch (err) {

        const normalized = normalizeClientError(err);
        console.error("Fetch error:", normalized);

        setError(normalized.message);
        setSnackbarOpen(true);
        
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, [date]);

  // ---------- Pagination ----------
  const pagedRows = useMemo(
    () => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [rows, page, rowsPerPage]
  );

  // ---------- Loading / Error / Empty States ----------
  if (loading) {
    return (
        <>
      <GlassLoader message="Loading attendance summary..." height={320} />

      <GlassSnackbar
          open={snackbarOpen}
          message={error ?? "An unexpected error occurred"}
          severity="error"
          showHomeButton
          onClose={() => setSnackbarOpen(false)}
        />
        </>
    );
  }

  if (error) {
    return (
        <>
        <Stack spacing={2} alignItems="center">
            <ErrorOutlineIcon sx={{ fontSize: 60, color: "#ff7676" }} />
        <Typography color="white" sx={{ mt: 8, opacity: 0.8 }}>
          {error}
        </Typography>
</Stack>
      <GlassSnackbar
          open={snackbarOpen}
          message={error}
          severity="error"
          showHomeButton
          onClose={() => setSnackbarOpen(false)}
        />
        </>
    );
  }

  // ---------------- Render Table ----------------
  return (
    <>
    <Card
      elevation={0}
      sx={{
        width: "94%",
        maxWidth: 1400,
        borderRadius: 4,
        backdropFilter: "blur(20px) saturate(180%)",
        backgroundColor:
          theme.palette.mode === "light"
            ? "rgba(255,255,255,0.55)"
            : "rgba(17,25,40,0.6)",
        border: "1px solid rgba(255,255,255,0.25)",
        boxShadow:
          theme.palette.mode === "light"
            ? "0 4px 24px rgba(0,0,0,0.1)"
            : "0 4px 24px rgba(0,0,0,0.6)",
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Attendance Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Branch: 1 &middot; Select a date to view daily summary
            </Typography>
          </Box>

        <Stack direction="row" alignItems="center" spacing={1.5}>

        <IconButton
        onClick={() => setAddSessionOpen(true)}
        color="inherit"
        sx={(theme) => ({
          backdropFilter: "blur(12px) saturate(180%)",
          backgroundColor:
            theme.palette.mode === "light"
              ? "rgba(255,255,255,0.4)"
              : "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.25)",
          transition: "all 0.15s ease",
          "&:hover": {
            transform: "scale(1.05)",
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(255,255,255,0.7)"
                : "rgba(255,255,255,0.25)",
          },
        })}
      >
        <AddRounded />
      </IconButton>

        {/* Refresh Button */}
        <IconButton
            onClick={forceRefresh}
            color="inherit"
            sx={{
            backdropFilter: "blur(12px) saturate(180%)",
            backgroundColor:
                theme.palette.mode === "light"
                ? "rgba(255,255,255,0.4)"
                : "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.25)",
            transition: "all 0.2s ease",
            "&:hover": {
                backgroundColor:
                theme.palette.mode === "light"
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(255,255,255,0.25)",
                transform: "rotate(90deg)",
            },
            }}
        >
            <RefreshIcon />
        </IconButton>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date"
              value={date}
              disableFuture
              onChange={(d) => {
                if (d) setDate(d);
                setPage(0);
            }}
            enableAccessibleFieldDOMStructure={false}
            slotProps={{
                textField: {
                    size: "small",
                  sx: { minWidth: 160 },
                },
            }}
            />
          </LocalizationProvider>
            </Stack>
        </Stack>

        <Divider sx={{ opacity: 0.5, mb: 2 }} />

        {/* Empty state */}
        {rows.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
            <Typography>No attendance records for the selected date.</Typography>
          </Box>
        ) : (
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              borderColor: "rgba(255,255,255,0.25)",
              background: "transparent",
            }}
          >
            <TableContainer
              sx={{
                maxHeight: { xs: 420, sm: 520 },
                overflow: "auto",
                "&::-webkit-scrollbar": { height: 8, width: 8 },
                "&::-webkit-scrollbar-thumb": {
                  borderRadius: 2,
                  backgroundColor:
                    theme.palette.mode === "light"
                      ? "rgba(0,0,0,0.25)"
                      : "rgba(255,255,255,0.25)",
                },
              }}
            >
              <Table stickyHeader aria-label="attendance table" sx={{ minWidth: 1100 }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        position: "sticky",
                        left: 0,
                        zIndex: (t) => t.zIndex.appBar + 1,
                        backgroundColor:
                          theme.palette.mode === "light"
                            ? "rgba(255,255,255,0.85)"
                            : "rgba(9,13,26,0.9)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Employee Code</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Sign In</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Sign Out</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Total Worked</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Break</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Overtime</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {pagedRows.map((r) => (
                    <TableRow
                        hover
                        key={r.sessionId}
                        onClick={() => {
                            if (r.attendanceStatus !== "Closed") {
                            setSelectedSession(r);
                            setUpdateSessionOpen(true);
                            }
                        }}
                        sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                            cursor: r.attendanceStatus !== "Closed" ? "pointer" : "default",
                            opacity: r.attendanceStatus === "Closed" ? 0.6 : 1,
                            transition: "background 0.2s ease",
                            "&:hover": {
                            backgroundColor:
                                r.attendanceStatus === "Closed"
                                ? "inherit"
                                : theme.palette.mode === "light"
                                    ? "rgba(255,255,255,0.3)"
                                    : "rgba(255,255,255,0.05)",
                            },
                        }}
                        >
                      <TableCell
                        sx={{
                          position: "sticky",
                          left: 0,
                          zIndex: (t) => t.zIndex.appBar,
                          backgroundColor:
                            theme.palette.mode === "light"
                              ? "rgba(255,255,255,0.7)"
                              : "rgba(17,25,40,0.7)",
                          backdropFilter: "blur(6px)",
                          fontWeight: 600,
                        }}
                      >
                        {r.employeeName}
                      </TableCell>
                      <TableCell>{r.employeeCode}</TableCell>
                      <TableCell>{r.department ?? "—"}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={statusLabel(r.attendanceStatus)}
                          color={statusColor(r.attendanceStatus)}
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>{formatTime(r.checkInTime)}</TableCell>
                      <TableCell>{formatTime(r.checkOutTime)}</TableCell>
                      <TableCell>{toHHMM(r.totalMinutesWorked)}</TableCell>
                      <TableCell>{toHHMM(r.breakMinutes)}</TableCell>
                      <TableCell>{toHHMM(r.overTimeMinutes)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              rowsPerPageOptions={[5, 10, 20, 50]}
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{
                px: 2,
                borderTop: "1px solid rgba(255,255,255,0.2)",
                backgroundColor: "transparent",
                ".MuiTablePagination-toolbar": { minHeight: 56 },
              }}
            />
          </Paper>
        )}
      </CardContent>
    </Card>

    <AdminSessionCheckInForm
      open={addSessionOpen}
      onClose={() => setAddSessionOpen(false)}
      onCreated={forceRefresh}
    />

    <AdminSessionUpdateForm
        open={updateSessionOpen}
        onClose={() => setUpdateSessionOpen(false)}
        session={selectedSession}
        onUpdated={forceRefresh}
        />

    <GlassSnackbar
        open={snackbarOpen}
        message={error ?? "An unexpected error occurred"}
        severity="error"
        showHomeButton
        onClose={() => setSnackbarOpen(false)}
      />
    </>
  );
}
