// import type { EmployeeAttendance, EmployeeAttendanceStatus } from "@/lib/types/types";

// /** Utility: Converts Date to ISO string without timezone offset */
// function toIso(date: Date) {
//   return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
// }

// /**
//  * Generates realistic mock attendance data.
//  * - `Open`      → Checked in, no checkout yet
//  * - `OnBreak`   → Checked in, currently on break
//  * - `Closed`    → Completed day (has both times)
//  * - `OnLeave`   → On leave, no times
//  */
// export function generateMockData(count = 40): EmployeeAttendance[] {
//   const now = new Date();
//   const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//   const statuses: EmployeeAttendanceStatus[] = ["Open", "OnBreak", "Closed", "OnLeave"];
//   const departments = ["HR", "IT", "Finance", "Operations", "QA", "Design"];

//   return Array.from({ length: count }).map((_, i) => {
//     const status = statuses[i % statuses.length];
//     const checkIn = new Date(base.getTime() + 9 * 3600 * 1000 + (i % 20) * 5 * 60000); // 09:00 + offset
//     const checkOut = new Date(base.getTime() + 17 * 3600 * 1000 + (i % 30) * 3 * 60000); // 17:00 + offset

//     let checkInTime: string | null = null;
//     let checkOutTime: string | null = null;
//     let totalMinutesWorked = 0;
//     let breakMinutes = 0;
//     let overTimeMinutes = 0;

//     switch (status) {
//       case "Open":
//         checkInTime = toIso(checkIn);
//         totalMinutesWorked = Math.min(
//           Math.floor((now.getTime() - checkIn.getTime()) / 60000),
//           8 * 60
//         );
//         breakMinutes = 30 + (i % 15);
//         break;

//       case "OnBreak":
//         checkInTime = toIso(checkIn);
//         totalMinutesWorked = 3 * 60 + (i % 25);
//         breakMinutes = 60 + (i % 10);
//         break;

//       case "Closed":
//         checkInTime = toIso(checkIn);
//         checkOutTime = toIso(checkOut);
//         totalMinutesWorked = 8 * 60 + (i % 20);
//         breakMinutes = 45 + (i % 20);
//         overTimeMinutes = i % 4 === 0 ? 30 : 0;
//         break;

//       case "OnLeave":
//         // all remain null or 0
//         break;
//     }

//     return {
//       employeeId: i + 1,
//       employeeCode: `EMP${(1000 + i).toString()}`,
//       employeeName: `Employee ${i + 1}`,
//       branchId: 1,
//       attendanceStatus: status,
//       department: departments[i % departments.length],
//       checkInTime,
//       checkOutTime,
//       totalMinutesWorked,
//       breakMinutes: breakMinutes,
//       overTimeMinutes,
//     };
//   });
// }
