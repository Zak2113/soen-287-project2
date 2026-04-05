"use client";

import { useState } from 'react';
import jsPDF from 'jspdf';

export default function ExportGradesPDF({ gradesData, studentName }) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Student Grade Report', margin, yPosition);
      yPosition += 15;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Student: ${studentName}`, margin, yPosition);
      yPosition += 10;
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 20;

      // Process each course
      gradesData.forEach((course, courseIndex) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = margin;
        }

        // Course header
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${course.code} - ${course.title}`, margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Term: ${course.term} | Instructor: ${course.instructor}`, margin, yPosition);
        yPosition += 8;
        pdf.text(`Current Progress: ${course.progress}%`, margin, yPosition);
        yPosition += 15;

        // Completed assessments
        if (course.completed.length > 0) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Completed Assessments:', margin, yPosition);
          yPosition += 10;

          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');

          course.completed.forEach((assessment) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = margin;
            }

            const percentage = Math.round((assessment.earned / assessment.total) * 100);
            pdf.text(`${assessment.title} (${assessment.weight}%): ${assessment.earned}/${assessment.total} (${percentage}%)`, margin + 10, yPosition);
            yPosition += 8;
          });
          yPosition += 5;
        }

        // Incomplete assessments
        if (course.incomplete.length > 0) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Incomplete Assessments:', margin, yPosition);
          yPosition += 10;

          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');

          course.incomplete.forEach((assessment) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = margin;
            }

            pdf.text(`${assessment.title} (${assessment.weight}%): Not graded`, margin + 10, yPosition);
            yPosition += 8;
          });
          yPosition += 10;
        }

        // Course separator
        if (courseIndex < gradesData.length - 1) {
          pdf.setDrawColor(200, 200, 200);
          pdf.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 15;
        }
      });

      // Footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 40, pageHeight - 10);
      }

      // Save the PDF
      pdf.save(`grades-report-${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={exportToPDF}
      disabled={isExporting}
      className="btn btn-primary"
      style={{ marginLeft: '1rem' }}
    >
      {isExporting ? 'Generating PDF...' : 'Export to PDF'}
    </button>
  );
}
