import EmployeeList from "@/components/employee/EmployeeList";
import type { Employee } from "@/lib/types/types";
import { Box, Typography } from "@mui/material";
import { mockEmployees } from "@/lib/mock/employees";

async function fetchEmployees(branchId: number = 1): Promise<Employee[]> {
  return mockEmployees.filter((e) => e.branchId === branchId);
}

export default async function EmployeesPage() {
  const employees = await fetchEmployees(1);

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
        <Typography color="white" textAlign="center">
          No employees found.
        </Typography>
      )}
    </Box>
  );
}
