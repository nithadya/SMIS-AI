import React, { useState } from "react";
import { Box, Button, Stack, CircularProgress } from "@mui/material";
import { Download } from "@mui/icons-material";
import { generateReport } from "../../utils/reportGenerator";

const AdvancedInquiries = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    if (isExporting) return; // Prevent multiple clicks

    try {
      setIsExporting(true);
      const inquiryData = inquiries.map((inquiry) => ({
        id: inquiry.id,
        studentName: inquiry.student_name,
        email: inquiry.email,
        phone: inquiry.phone,
        program: inquiry.program_name,
        status: inquiry.status,
        inquiryDate: new Date(inquiry.inquiry_date).toLocaleDateString(),
        followUpDate: inquiry.follow_up_date
          ? new Date(inquiry.follow_up_date).toLocaleDateString()
          : "Not Scheduled",
        counselor: inquiry.counselor_name,
      }));

      const statusCounts = {};
      inquiries.forEach((inquiry) => {
        statusCounts[inquiry.status] = (statusCounts[inquiry.status] || 0) + 1;
      });

      const counselorCounts = {};
      inquiries.forEach((inquiry) => {
        if (inquiry.counselor_name) {
          counselorCounts[inquiry.counselor_name] =
            (counselorCounts[inquiry.counselor_name] || 0) + 1;
        }
      });

      await generateReport({
        title: "ICBT Advanced Inquiries Report",
        sections: [
          {
            title: "Inquiry Details",
            data: inquiryData,
            columns: [
              { header: "ID", key: "id" },
              { header: "Student Name", key: "studentName" },
              { header: "Email", key: "email" },
              { header: "Phone", key: "phone" },
              { header: "Program", key: "program" },
              { header: "Status", key: "status" },
              { header: "Inquiry Date", key: "inquiryDate" },
              { header: "Follow-up Date", key: "followUpDate" },
              { header: "Counselor", key: "counselor" },
            ],
          },
          {
            title: "Counselor Performance",
            data: Object.entries(counselorCounts).map(([counselor, count]) => ({
              counselor,
              inquiries: count,
              percentage: `${((count / inquiries.length) * 100).toFixed(1)}%`,
            })),
            columns: [
              { header: "Counselor", key: "counselor" },
              { header: "Total Inquiries", key: "inquiries" },
              { header: "Percentage", key: "percentage" },
            ],
          },
        ],
        summaryData: {
          "Total Inquiries": inquiries.length,
          "New Inquiries": statusCounts["New"] || 0,
          "In Progress": statusCounts["In Progress"] || 0,
          Converted: statusCounts["Converted"] || 0,
          "Not Interested": statusCounts["Not Interested"] || 0,
          "Total Counselors": Object.keys(counselorCounts).length,
          "Conversion Rate": `${(
            ((statusCounts["Converted"] || 0) / inquiries.length) *
            100
          ).toFixed(1)}%`,
        },
        filename: `ICBT-Inquiries-Report-${
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

export default AdvancedInquiries;
