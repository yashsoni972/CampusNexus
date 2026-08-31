import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Shared header for all PDFs ─────────────────────────────────────────────
function addHeader(doc, title, subtitle, facultyName, department) {
  const W = doc.internal.pageSize.getWidth();

  // Background header bar
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.rect(0, 0, W, 30, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CampusNexus — College ERP Platform', W / 2, 12, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(title, W / 2, 22, { align: 'center' });

  // Meta info below header
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const date = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  doc.text(`Department: ${department || '—'}`, 14, 38);
  doc.text(`Faculty: ${facultyName || '—'}`, 14, 44);
  if (subtitle) doc.text(subtitle, 14, 50);
  doc.text(`Generated on: ${date}`, W - 14, 38, { align: 'right' });

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 55, W - 14, 55);

  return 60; // y start for table
}

// ── Footer ─────────────────────────────────────────────────────────────────
function addFooter(doc) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const pages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, H - 15, W - 14, H - 15);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('CampusNexus — Confidential', 14, H - 8);
    doc.text(`Page ${i} of ${pages}`, W - 14, H - 8, { align: 'right' });
  }
}

// ── ATTENDANCE REPORT PDF ──────────────────────────────────────────────────
export function generateAttendancePDF({ students, facultyName, department, semester }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const subtitle = semester ? `Semester ${semester}` : 'All Semesters';
  const startY = addHeader(doc, 'Student Attendance Report', subtitle, facultyName, department);

  const rows = students.map((s, idx) => [
    idx + 1,
    s.rollNumber || '—',
    s.name,
    s.program || '—',
    `Sem ${s.semester || '—'}`,
    s.batch || '—',
    `${s.attendance ?? 0}%`,
    (s.attendance ?? 0) >= 75 ? 'Satisfactory' :
    (s.attendance ?? 0) >= 60 ? 'Borderline' : 'Deficient',
  ]);

  autoTable(doc, {
    startY,
    head: [['#', 'Roll No', 'Student Name', 'Program', 'Semester', 'Batch', 'Attendance %', 'Status']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8.5 },
    alternateRowStyles: { fillColor: [245, 247, 255] },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 28 },
      6: { halign: 'center' },
      7: {
        halign: 'center',
        fontStyle: 'bold',
      },
    },
    didParseCell(data) {
      if (data.column.index === 7 && data.section === 'body') {
        const val = data.cell.raw;
        if (val === 'Satisfactory')  data.cell.styles.textColor = [22, 101, 52];
        else if (val === 'Borderline') data.cell.styles.textColor = [146, 64, 14];
        else if (val === 'Deficient')  data.cell.styles.textColor = [185, 28, 28];
      }
    },
  });

  // Summary stats
  const lastY = doc.lastAutoTable.finalY + 8;
  const total   = students.length;
  const good    = students.filter(s => (s.attendance ?? 0) >= 75).length;
  const border  = students.filter(s => (s.attendance ?? 0) >= 60 && (s.attendance ?? 0) < 75).length;
  const deficient = students.filter(s => (s.attendance ?? 0) < 60).length;
  const avg     = total ? (students.reduce((a, s) => a + (s.attendance ?? 0), 0) / total).toFixed(1) : 0;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text(`Summary — Total: ${total}  |  Avg Attendance: ${avg}%  |  Satisfactory: ${good}  |  Borderline: ${border}  |  Deficient: ${deficient}`, 14, lastY);

  addFooter(doc);
  doc.save(`Attendance_Report_${department || 'All'}_${new Date().toISOString().slice(0,10)}.pdf`);
}

// ── MARKSHEET PDF ──────────────────────────────────────────────────────────
export function generateMarksheetPDF({ students, facultyName, department, semester }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const subtitle = semester ? `Semester ${semester}` : 'All Semesters';
  const startY = addHeader(doc, 'Student Marksheet / CGPA Report', subtitle, facultyName, department);

  const rows = students.map((s, idx) => {
    const cgpa = s.cgpa;
    let grade = '—';
    if (cgpa !== undefined) {
      if (cgpa >= 9)      grade = 'O (Outstanding)';
      else if (cgpa >= 8) grade = 'A+ (Excellent)';
      else if (cgpa >= 7) grade = 'A (Very Good)';
      else if (cgpa >= 6) grade = 'B+ (Good)';
      else if (cgpa >= 5) grade = 'B (Average)';
      else if (cgpa >= 4) grade = 'C (Pass)';
      else                grade = 'F (Fail)';
    }
    return [
      idx + 1,
      s.rollNumber || '—',
      s.name,
      s.program || '—',
      `Sem ${s.semester || '—'}`,
      s.batch || '—',
      cgpa !== undefined ? cgpa.toFixed(2) : '—',
      grade,
      `${s.attendance ?? 0}%`,
    ];
  });

  autoTable(doc, {
    startY,
    head: [['#', 'Roll No', 'Student Name', 'Program', 'Semester', 'Batch', 'CGPA', 'Grade', 'Attendance']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8.5 },
    alternateRowStyles: { fillColor: [245, 247, 255] },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 28 },
      6: { halign: 'center', fontStyle: 'bold' },
      7: { halign: 'center' },
      8: { halign: 'center' },
    },
    didParseCell(data) {
      if (data.column.index === 6 && data.section === 'body') {
        const val = parseFloat(data.cell.raw);
        if (!isNaN(val)) {
          if (val >= 8)      data.cell.styles.textColor = [22, 101, 52];
          else if (val >= 6) data.cell.styles.textColor = [146, 64, 14];
          else               data.cell.styles.textColor = [185, 28, 28];
        }
      }
    },
  });

  // Summary
  const lastY = doc.lastAutoTable.finalY + 8;
  const total  = students.length;
  const withCgpa = students.filter(s => s.cgpa !== undefined);
  const avg = withCgpa.length
    ? (withCgpa.reduce((a, s) => a + s.cgpa, 0) / withCgpa.length).toFixed(2)
    : '—';
  const toppers = withCgpa.filter(s => s.cgpa >= 8).length;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text(`Summary — Total Students: ${total}  |  Class Avg CGPA: ${avg}  |  Students with CGPA ≥ 8.0: ${toppers}`, 14, lastY);

  addFooter(doc);
  doc.save(`Marksheet_${department || 'All'}_${new Date().toISOString().slice(0,10)}.pdf`);
}
