import { generateReport } from "../../utils/reportGenerator";

const handleExportReport = () => {
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

  generateReport({
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
};
