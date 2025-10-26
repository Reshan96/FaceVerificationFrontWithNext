"use client";

import { useState } from "react";
import { Autocomplete, TextField, useTheme, PaperProps } from "@mui/material";
import type { Employee } from "@/lib/types/types";

type Props = {
  employees: Employee[];
  onSelect: (employee: Employee) => void;
  sx?: PaperProps["sx"];
};

export default function EmployeeSearch({ employees, onSelect, sx }: Props) {
  const [query, setQuery] = useState("");
  const theme = useTheme();

  const filtered = employees.filter((e) =>
    `${e.firstName} ${e.lastName} ${e.employeeCode}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <Autocomplete
      options={filtered}
      getOptionLabel={(e) => `${e.firstName} ${e.lastName} (${e.employeeCode})`}
      onChange={(_, value) => value && onSelect(value)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search employee"
          variant="outlined"
          size="medium"
          onChange={(e) => setQuery(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              color: theme.palette.text.primary,
            },
          }}
        />
      )}
      sx={sx}
    />
  );
}
