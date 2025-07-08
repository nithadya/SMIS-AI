import { useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import icbtLogo from "../../assets/icbt-logo.png";

const DashboardReport = ({ analyticsData, onClose }) => {
  const generatePDF = async () => {
    // Create new PDF document
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add ICBT logo in header
    const imgWidth = 60;
    const imgHeight = 20;
    doc.addImage(
      icbtLogo,
      "PNG",
      (pageWidth - imgWidth) / 2,
      10,
      imgWidth,
      imgHeight
    );

    // Add title
    doc.setFontSize(16);
    doc.text("ICBT Campus Dashboard Report", pageWidth / 2, 40, {
      align: "center",
    });
    doc.setFontSize(12);
    doc.text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      48,
      { align: "center" }
    );

    // Add student statistics
    doc.setFontSize(14);
    doc.text("Student Statistics", 14, 60);

    const studentStats = [
      ["Total Students", analyticsData.totalStudents],
      ["Active Students", analyticsData.activeStudents],
      ["New Enrollments", analyticsData.newEnrollments],
      ["Graduation Rate", `${analyticsData.graduationRate}%`],
    ];

    doc.autoTable({
      startY: 65,
      head: [["Metric", "Value"]],
      body: studentStats,
      theme: "grid",
      headStyles: { fillColor: [0, 32, 96] },
      margin: { left: 14 },
    });

    // Add course statistics
    doc.setFontSize(14);
    doc.text("Course Statistics", 14, doc.autoTable.previous.finalY + 15);

    const courseStats = [
      ["Total Courses", analyticsData.totalCourses],
      ["Active Courses", analyticsData.activeCourses],
      ["Average Course Rating", analyticsData.avgCourseRating],
      ["Most Popular Course", analyticsData.popularCourse],
    ];

    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 20,
      head: [["Metric", "Value"]],
      body: courseStats,
      theme: "grid",
      headStyles: { fillColor: [0, 32, 96] },
      margin: { left: 14 },
    });

    // Add performance metrics
    doc.setFontSize(14);
    doc.text("Performance Metrics", 14, doc.autoTable.previous.finalY + 15);

    const performanceStats = [
      ["Average GPA", analyticsData.avgGPA],
      ["Attendance Rate", `${analyticsData.attendanceRate}%`],
      ["Student Satisfaction", `${analyticsData.studentSatisfaction}%`],
      ["Retention Rate", `${analyticsData.retentionRate}%`],
    ];

    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 20,
      head: [["Metric", "Value"]],
      body: performanceStats,
      theme: "grid",
      headStyles: { fillColor: [0, 32, 96] },
      margin: { left: 14 },
    });

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    // Save the PDF
    doc.save("ICBT-Dashboard-Report.pdf");
  };

  useEffect(() => {
    generatePDF();
    if (onClose) onClose();
  }, []);

  return null; // This is a utility component that doesn't render anything
};

export default DashboardReport;
