import React, { useState } from "react";
import { Box, Button, Stack, CircularProgress } from "@mui/material";
import { Download } from "@mui/icons-material";
import { generateReport } from "../../utils/reportGenerator";

const EnrollmentRegistrationManagement = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    if (isExporting) return; // Prevent multiple clicks

    try {
      setIsExporting(true);
      const enrollmentData = enrollments.map((enrollment) => ({
        id: enrollment.id,
        studentName: enrollment.student_name,
        program: enrollment.program_name,
        batch: enrollment.batch_name,
        status: enrollment.status,
        registrationDate: new Date(
          enrollment.registration_date
        ).toLocaleDateString(),
        paymentStatus: enrollment.payment_status,
      }));

      const statusCounts = {};
      enrollments.forEach((enrollment) => {
        statusCounts[enrollment.status] =
          (statusCounts[enrollment.status] || 0) + 1;
      });

      await generateReport({
        title: "ICBT Enrollment and Registration Report",
        sections: [
          {
            title: "Enrollment Details",
            data: enrollmentData,
            columns: [
              { header: "ID", key: "id" },
              { header: "Student Name", key: "studentName" },
              { header: "Program", key: "program" },
              { header: "Batch", key: "batch" },
              { header: "Status", key: "status" },
              { header: "Registration Date", key: "registrationDate" },
              { header: "Payment Status", key: "paymentStatus" },
            ],
          },
          {
            title: "Status Distribution",
            data: Object.entries(statusCounts).map(([status, count]) => ({
              status,
              count,
              percentage: `${((count / enrollments.length) * 100).toFixed(1)}%`,
            })),
            columns: [
              { header: "Status", key: "status" },
              { header: "Count", key: "count" },
              { header: "Percentage", key: "percentage" },
            ],
          },
        ],
        summaryData: {
          "Total Enrollments": enrollments.length,
          "Active Enrollments": statusCounts["Active"] || 0,
          "Pending Enrollments": statusCounts["Pending"] || 0,
          "Completed Enrollments": statusCounts["Completed"] || 0,
          "Total Programs": programs.length,
          "Total Batches": batches.length,
        },
        filename: `ICBT-Enrollment-Report-${
          new Date().toISOString().split("T")[0]
        }.pdf`,
      });
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={
            isExporting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <Download />
            )
          }
          onClick={handleExportData}
          disabled={isExporting}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            background: "linear-gradient(45deg, primary.main, secondary.main)",
            "&:hover": {
              background:
                "linear-gradient(45deg, primary.dark, secondary.dark)",
            },
          }}
        >
          {isExporting ? "Generating Report..." : "Export Report"}
        </Button>
      </Stack>

      {/* Rest of your component's UI */}
    </Box>
  );
};

export default EnrollmentRegistrationManagement;
 