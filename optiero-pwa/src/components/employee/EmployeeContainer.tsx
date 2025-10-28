"use client";

import { useState, useEffect  } from "react";
import { 
  Box, Card, Typography, Button, Stack
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import HomeIcon from "@mui/icons-material/Home";

import EmployeeList from "@/components/employee/EmployeeList";
import GlassSnackbar from "@/components/common/GlassSnackbar";
import GlassLoader from "@/components/common/GlassLoader";
import type { Employee } from "@/lib/types/types";
import { normalizeClientError } from "@/lib/errorHandler/errorHandler";
import { useBranchStore } from "@/lib/stores/branchStore";

export default function EmployeeContainer() {
    const { branchId } = useBranchStore();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Employee[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ---------------- Fetch Employees ----------------
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

  useEffect(() => {
    if (branchId) {
      void fetchEmployees(branchId);
    } else  {
      setFetchError("No branch selected. Please go back to Home.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

    const handleRetry = async (): Promise<void> => {
    if (!branchId) {
      setFetchError("No branch selected. Please go back to Home.");
      setSnackbarOpen(true);
      return;
    }
    await fetchEmployees(branchId);
  };


  // ---- UI ----
  if (loading) return <GlassLoader message="Refreshing employee list..." height={320}/>;

  return (
    <>
      {fetchError ? (
        <>
          <Stack spacing={2} alignItems="center">
            <ErrorOutlineIcon sx={{ fontSize: 60, color: "#ff7676" }} />
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {fetchError}
            </Typography>

            <Stack direction="row" spacing={2} mt={2}>
              <Button
                variant="outlined"
                onClick={handleRetry}
                startIcon={<RefreshIcon />}
                sx={{
                  borderColor: "rgba(255,255,255,0.5)",
                  color: "white",
                  backdropFilter: "blur(6px)",
                }}
              >
                Retry
              </Button>
              <Button
                variant="outlined"
                href="/"
                startIcon={<HomeIcon />}
                sx={{
                  borderColor: "rgba(255,255,255,0.5)",
                  color: "white",
                  backdropFilter: "blur(6px)",
                }}
              >
                Home
              </Button>
            </Stack>
          </Stack>

          <GlassSnackbar
            open={snackbarOpen}
            message={fetchError}
            severity="error"
            onClose={() => setSnackbarOpen(false)}
          />
          </>
      ) : data.length > 0 ? (
        <EmployeeList employees={data} />
      ) : (
        <Typography color="white" sx={{ mt: 8, opacity: 0.8 }}>
          No employees found.
        </Typography>
      )}
</>
  );
}
