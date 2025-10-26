import EmployeeList from "@/components/employee/EmployeeList";
import type { Employee } from "@/lib/types/types";
import { Box, Typography } from "@mui/material";
import { mockEmployees } from "@/lib/mock/employees";

const base = process.env.NEXT_PUBLIC_APP_URL!;

async function fetchEmployees(branchId: number = 1): Promise<Employee[]> {
  try {
    const res = await fetch(`http://localhost:3000/api/employees/get?branchId=${branchId}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as Employee[];
  } catch (e) {
    console.error("Error fetching employees:", e);
    return [];
  }
}

export default async function EmployeesPage() {
  const employees = await fetchEmployees(1);  //todo: branch should be changed to get from the ticket

  return (
    <Box
  sx={{
    minHeight: "100dvh",
    pt: { xs: 10, sm: 12 },
    background: `
      radial-gradient(800px 400px at 50% 0%, rgba(72,118,255,0.25), transparent 80%),
      linear-gradient(180deg, #0b1020 0%, #090d1a 100%)
    `,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  }}
>
      {employees.length > 0 ? (
        <EmployeeList employees={employees} />
      ) : (
        <Typography color="white" sx={{ mt: 8, opacity: 0.8 }}>
          {`No employees found${process.env.NODE_ENV === "development" ? " (or backend unavailable)" : ""}.`}
        </Typography>
      )}
    </Box>
  );
}
