import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ConcreteResult } from './concreteCalc';
import type { BOQRow, BillingSummary } from './boqTypes';

export interface ReportMeta {
  companyName: string;
  projectName: string;
  clientName: string;
  location: string;
  engineerName: string;
  contractorName: string;
  date: string;
  preparedBy: string;
  checkedBy: string;
  approvedBy: string;
}

export function generatePDF(
  meta: ReportMeta,
  result: ConcreteResult,
  boqRows: BOQRow[],
  billing: BillingSummary
): void {
  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const blue:   [number,number,number] = [26,  61, 110];
  const yellow: [number,number,number] = [245,166,  35];
  const gray:   [number,number,number] = [107,114, 128];

  // ── Header band ──────────────────────────────────────────
  doc.setFillColor(...blue);
  doc.rect(0, 0, pageW, 36, 'F');
  doc.setFillColor(...yellow);
  doc.rect(0, 36, pageW, 3, 'F');

  // Logo box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(10, 5, 26, 26, 3, 3, 'F');
  doc.setFontSize(8);
  doc.setTextColor(...blue);
  doc.setFont('helvetica', 'bold');
  doc.text('LOGO', 23, 21, { align: 'center' });

  // Company name + title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(meta.companyName || 'COMPANY NAME', 42, 14);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Civil Engineering & Construction Consultants', 42, 20);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...yellow);
  doc.text('CONCRETE BOQ REPORT', pageW / 2, 31, { align: 'center' });

  // ── Project Info ──────────────────────────────────────────
  let y = 46;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blue);
  doc.text('PROJECT INFORMATION', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    body: [
      ['Project Name', meta.projectName, 'Client Name', meta.clientName],
      ['Location',     meta.location,    'Engineer',    meta.engineerName],
      ['Contractor',   meta.contractorName, 'Date',     meta.date],
    ],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [240,245,255], textColor: blue, cellWidth: 32 },
      2: { fontStyle: 'bold', fillColor: [240,245,255], textColor: blue, cellWidth: 32 },
    },
    margin: { left: 14, right: 14 },
  });

  // ── Mix Design ────────────────────────────────────────────
  y = (doc as any).lastAutoTable.finalY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blue);
  doc.text('CONCRETE MIX DESIGN', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Parameter', 'Value', 'Parameter', 'Value']],
    body: [
      ['Grade', result.grade,   'Mix Type', result.mixType],
      ['Mix Ratio', result.mixRatio, 'W/C Ratio', result.wcRatio.toFixed(2)],
      ['Wet Volume', `${result.wetVolume.toFixed(3)} m³`, 'Dry Volume', `${result.dryVolume.toFixed(3)} m³`],
    ],
    theme: 'striped',
    headStyles: { fillColor: blue, textColor: [255,255,255], fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    margin: { left: 14, right: 14 },
  });

  // ── Material Quantities ───────────────────────────────────
  y = (doc as any).lastAutoTable.finalY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blue);
  doc.text('MATERIAL QUANTITY CALCULATION', 14, y);
  y += 4;

  const matRows: string[][] = [
    ['Cement Volume',        `${result.cementVolume.toFixed(4)} m³`],
    ['Cement Weight',        `${result.cementWeightKg.toFixed(2)} kg`],
    ['Cement Bags (50 kg)', `${result.cementBags} Bags`],
    ['Fine Aggregate',       `${result.fineAggregateVolume.toFixed(3)} m³  |  ${result.fineAggregateWeight.toFixed(2)} kg`],
    ['Coarse Aggregate',     `${result.coarseAggregateVolume.toFixed(3)} m³  |  ${result.coarseAggregateWeight.toFixed(2)} kg`],
    ['Water Required',       `${result.waterLitres.toFixed(2)} Litres  (${result.waterKL.toFixed(3)} kL)`],
  ];
  if (result.admixture.required) {
    matRows.push([
      `Admixture (${result.admixture.type}) @ ${result.admixture.dosagePercent}%`,
      `${result.admixture.quantityKg.toFixed(3)} kg  (${result.admixture.quantityLitres.toFixed(3)} L)`,
    ]);
  }

  autoTable(doc, {
    startY: y,
    head: [['Material', 'Quantity']],
    body: matRows,
    theme: 'striped',
    headStyles: { fillColor: blue, textColor: [255,255,255], fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: { 0: { fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
  });

  // ── BOQ Table ─────────────────────────────────────────────
  y = (doc as any).lastAutoTable.finalY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blue);
  doc.text('BILL OF QUANTITIES (BOQ)', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['S.No', 'Item Description', 'Unit', 'Qty', 'Rate (₹)', 'Amount (₹)']],
    body: boqRows.map(r => [r.sno, r.description, r.unit, r.quantity.toFixed(2), r.rate.toFixed(2), r.amount.toFixed(2)]),
    foot: [['', '', '', '', 'Sub Total', `₹ ${billing.subTotal.toFixed(2)}`]],
    theme: 'striped',
    headStyles: { fillColor: blue, textColor: [255,255,255], fontSize: 8 },
    footStyles: { fillColor: [240,245,255], textColor: blue, fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: { 0: { cellWidth: 10 }, 4: { halign: 'right' }, 5: { halign: 'right' } },
    margin: { left: 14, right: 14 },
  });

  // ── Billing Summary ───────────────────────────────────────
  y = (doc as any).lastAutoTable.finalY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blue);
  doc.text('BILLING SUMMARY', 14, y);
  y += 4;

  const gst    = (billing.subTotal * billing.gstPercent) / 100;
  const cont   = (billing.subTotal * billing.contingenciesPercent) / 100;
  const oh     = (billing.subTotal * billing.overheadPercent) / 100;
  const profit = (billing.subTotal * billing.profitPercent) / 100;

  autoTable(doc, {
    startY: y,
    body: [
      ['Sub Total',                              `₹ ${billing.subTotal.toFixed(2)}`],
      [`GST @ ${billing.gstPercent}%`,           `₹ ${gst.toFixed(2)}`],
      [`Contingencies @ ${billing.contingenciesPercent}%`, `₹ ${cont.toFixed(2)}`],
      [`Overhead @ ${billing.overheadPercent}%`, `₹ ${oh.toFixed(2)}`],
      [`Profit @ ${billing.profitPercent}%`,     `₹ ${profit.toFixed(2)}`],
      ['Round Off',                              `₹ ${billing.roundOff.toFixed(2)}`],
      ['NET PAYABLE AMOUNT',                     `₹ ${billing.netPayable.toLocaleString('en-IN')}`],
    ],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [240,245,255], textColor: blue },
      1: { halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  // ── Signature Section ─────────────────────────────────────
  y = (doc as any).lastAutoTable.finalY + 12;
  if (y > 245) { doc.addPage(); y = 20; }

  doc.setFillColor(248, 250, 255);
  doc.rect(14, y, pageW - 28, 28, 'F');
  doc.setDrawColor(...blue);
  doc.rect(14, y, pageW - 28, 28);

  const cw = (pageW - 28) / 3;
  [
    { label: 'Prepared By', name: meta.preparedBy },
    { label: 'Checked By',  name: meta.checkedBy  },
    { label: 'Approved By', name: meta.approvedBy },
  ].forEach((s, i) => {
    const cx = 14 + cw * i + cw / 2;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...gray);
    doc.text(s.label, cx, y + 7, { align: 'center' });
    doc.setDrawColor(...blue);
    doc.line(cx - 22, y + 20, cx + 22, y + 20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...blue);
    doc.text(s.name || '____________', cx, y + 25, { align: 'center' });
  });

  // ── Footer on all pages ───────────────────────────────────
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    const h = doc.internal.pageSize.getHeight();
    doc.setFillColor(...blue);
    doc.rect(0, h - 9, pageW, 9, 'F');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Concrete BOQ Pro  |  Generated: ${new Date().toLocaleString('en-IN')}  |  Page ${p} of ${pageCount}`,
      pageW / 2, h - 3, { align: 'center' }
    );
  }

  doc.save(`CEB_Report_${meta.projectName || 'Project'}_${new Date().toISOString().slice(0,10)}.pdf`);
}
