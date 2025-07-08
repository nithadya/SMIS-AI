import jsPDF from "jspdf";
import "jspdf-autotable";
import icbtLogo from "../assets/icbt-logo.png";

export class ReportGenerator {
  constructor() {
    this.doc = new jsPDF("p", "mm", "a4");
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margins = {
      top: 30,
      bottom: 20,
      left: 15,
      right: 15,
    };
    this.currentY = 60; // Initialize starting Y position after header
  }

  addHeader(title) {
    try {
      // Add ICBT logo
      const imgWidth = 60;
      const imgHeight = 20;
      this.doc.addImage(
        icbtLogo,
        "PNG",
        (this.pageWidth - imgWidth) / 2,
        10,
        imgWidth,
        imgHeight
      );

      // Add title
      this.doc.setFontSize(16);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(title, this.pageWidth / 2, 40, { align: "center" });

      // Add date and time
      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "normal");
      const dateStr = new Date().toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "short",
      });
      this.doc.text(`Generated on: ${dateStr}`, this.pageWidth / 2, 47, {
        align: "center",
      });

      // Add divider line
      this.doc.setLineWidth(0.5);
      this.doc.line(
        this.margins.left,
        50,
        this.pageWidth - this.margins.right,
        50
      );
    } catch (error) {
      console.error("Error in addHeader:", error);
      throw new Error("Failed to add header to report");
    }
  }

  addFooter() {
    try {
      const pageCount = this.doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        this.doc.setPage(i);
        this.doc.setFontSize(8);
        this.doc.setFont("helvetica", "normal");

        // Add footer text
        this.doc.text(
          "ICBT Campus - 25 Years of Higher Education Excellence",
          this.pageWidth / 2,
          this.pageHeight - 15,
          { align: "center" }
        );

        // Add page numbers
        this.doc.text(
          `Page ${i} of ${pageCount}`,
          this.pageWidth / 2,
          this.pageHeight - 10,
          { align: "center" }
        );
      }
    } catch (error) {
      console.error("Error in addFooter:", error);
      throw new Error("Failed to add footer to report");
    }
  }

  addSection(title, data, columns) {
    try {
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn(`No data provided for section: ${title}`);
        return;
      }

      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(title, this.margins.left, this.currentY);

      this.doc.autoTable({
        startY: this.currentY + 5,
        head: [columns.map((col) => col.header)],
        body: data.map((row) => columns.map((col) => row[col.key] ?? "")),
        theme: "grid",
        headStyles: {
          fillColor: [0, 32, 96],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 10,
          cellPadding: 4,
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 3,
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: "auto" },
        },
        margin: this.margins,
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        didDrawPage: (data) => {
          // Update current Y position after table is drawn
          this.currentY = data.cursor.y + 15;
        },
      });

      // Add some spacing after the table
      this.currentY += 10;
    } catch (error) {
      console.error("Error in addSection:", error);
      throw new Error(`Failed to add section: ${title}`);
    }
  }

  addSummary(summaryData) {
    try {
      if (!summaryData || Object.keys(summaryData).length === 0) {
        return;
      }

      this.doc.setFontSize(11);
      this.doc.setFont("helvetica", "bold");
      this.doc.text("Summary", this.margins.left, this.currentY);

      this.currentY += 5;
      Object.entries(summaryData).forEach(([key, value]) => {
        this.doc.setFont("helvetica", "normal");
        this.doc.setFontSize(9);
        this.doc.text(`${key}: ${value}`, this.margins.left, this.currentY);
        this.currentY += 5;
      });
    } catch (error) {
      console.error("Error in addSummary:", error);
      throw new Error("Failed to add summary to report");
    }
  }

  generate(filename) {
    try {
      this.addFooter();
      this.doc.save(filename);
    } catch (error) {
      console.error("Error generating report:", error);
      throw new Error("Failed to generate report");
    }
  }
}

export const generateReport = ({
  title,
  sections,
  summaryData = null,
  filename,
}) => {
  try {
    if (!title || !sections || !Array.isArray(sections) || !filename) {
      throw new Error("Invalid report parameters");
    }

    const report = new ReportGenerator();
    report.addHeader(title);

    sections.forEach((section) => {
      if (!section.title || !section.data || !section.columns) {
        console.warn(`Skipping invalid section: ${section.title || "Unnamed"}`);
        return;
      }
      report.addSection(section.title, section.data, section.columns);
    });

    if (summaryData) {
      report.addSummary(summaryData);
    }

    report.generate(filename);
  } catch (error) {
    console.error("Error generating report:", error);
    throw new Error("Failed to generate report: " + error.message);
  }
};

// Example usage:
/*
generateReport({
  title: 'Student Registration Report',
  sections: [
    {
      title: 'Registration Details',
      data: registrationData,
      columns: [
        { header: 'Student ID', key: 'studentId' },
        { header: 'Name', key: 'name' },
        { header: 'Program', key: 'program' },
        { header: 'Registration Date', key: 'date' }
      ]
    }
  ],
  summaryData: {
    'Total Students': '150',
    'Average Performance': '85%'
  },
  filename: 'student-registration-report.pdf'
});
*/
