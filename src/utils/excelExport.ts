import * as XLSX from 'xlsx';
import type { ConcreteResult } from './concreteCalc';
import type { BOQRow, BillingSummary } from './boqTypes';
import type { ReportMeta } from './pdfExport';

export function generateExcel(
  meta: ReportMeta,
  result: ConcreteResult,
  boqRows: BOQRow[],
  billing: BillingSummary
): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1 – Project Info & Materials
  const ws1Data = [
    ['CONCRETE BOQ PRO'],
    [],
    ['PROJECT INFORMATION'],
    ['Project Name',   meta.projectName],
    ['Client Name',    meta.clientName],
    ['Company Name',   meta.companyName],
    ['Location',       meta.location],
    ['Engineer Name',  meta.engineerName],
    ['Contractor',     meta.contractorName],
    ['Date',           meta.date],
    [],
    ['MIX DESIGN'],
    ['Grade',          result.grade],
    ['Mix Type',       result.mixType],
    ['Mix Ratio',      result.mixRatio],
    ['W/C Ratio',      result.wcRatio],
    ['Wet Volume (m³)',result.wetVolume],
    ['Dry Volume (m³)',result.dryVolume],
    [],
    ['MATERIAL QUANTITIES'],
    ['Cement Volume (m³)',        result.cementVolume.toFixed(4)],
    ['Cement Weight (kg)',        result.cementWeightKg.toFixed(2)],
    ['Cement Bags (50kg)',        result.cementBags],
    ['Fine Aggregate Vol (m³)',   result.fineAggregateVolume.toFixed(3)],
    ['Fine Aggregate Wt (kg)',    result.fineAggregateWeight.toFixed(2)],
    ['Coarse Aggregate Vol (m³)', result.coarseAggregateVolume.toFixed(3)],
    ['Coarse Aggregate Wt (kg)',  result.coarseAggregateWeight.toFixed(2)],
    ['Water (Litres)',            result.waterLitres.toFixed(2)],
    ['Water (kL)',                result.waterKL.toFixed(3)],
    ...(result.admixture.required ? [
      ['Admixture Type',     result.admixture.type],
      ['Admixture Mfg',      result.admixture.manufacturer],
      ['Admixture Dosage %', result.admixture.dosagePercent],
      ['Admixture (kg)',     result.admixture.quantityKg.toFixed(3)],
      ['Admixture (L)',      result.admixture.quantityLitres.toFixed(3)],
    ] : []),
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
  ws1['!cols'] = [{ wch: 32 }, { wch: 28 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Project & Materials');

  // Sheet 2 – Calculation Steps
  const ws2Data = [
    ['STEP-BY-STEP CALCULATION'],
    [],
    ['Step', 'Parameter', 'Formula / Working', 'Value', 'Unit'],
    ...result.steps.map((s, i) => [i + 1, s.label, s.formula, s.value, s.unit]),
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
  ws2['!cols'] = [{ wch: 6 }, { wch: 28 }, { wch: 52 }, { wch: 14 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Calculation Steps');

  // Sheet 3 – BOQ & Billing
  const gst    = (billing.subTotal * billing.gstPercent) / 100;
  const cont   = (billing.subTotal * billing.contingenciesPercent) / 100;
  const oh     = (billing.subTotal * billing.overheadPercent) / 100;
  const profit = (billing.subTotal * billing.profitPercent) / 100;

  const ws3Data = [
    ['BILL OF QUANTITIES (BOQ)'],
    [`Project: ${meta.projectName}`, '', '', '', '', `Date: ${meta.date}`],
    [],
    ['S.No', 'Item Description', 'Unit', 'Quantity', 'Rate (₹)', 'Amount (₹)'],
    ...boqRows.map(r => [r.sno, r.description, r.unit, r.quantity, r.rate, r.amount]),
    [],
    ['', '', '', '', 'Sub Total',                                 billing.subTotal.toFixed(2)],
    ['', '', '', '', `GST @ ${billing.gstPercent}%`,              gst.toFixed(2)],
    ['', '', '', '', `Contingencies @ ${billing.contingenciesPercent}%`, cont.toFixed(2)],
    ['', '', '', '', `Overhead @ ${billing.overheadPercent}%`,    oh.toFixed(2)],
    ['', '', '', '', `Profit @ ${billing.profitPercent}%`,        profit.toFixed(2)],
    ['', '', '', '', 'Round Off',                                 billing.roundOff.toFixed(2)],
    ['', '', '', '', 'NET PAYABLE (₹)',                           billing.netPayable],
    [],
    ['Prepared By', meta.preparedBy, '', 'Checked By', meta.checkedBy],
    ['Approved By', meta.approvedBy],
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(ws3Data);
  ws3['!cols'] = [{ wch:8 }, { wch:42 }, { wch:12 }, { wch:12 }, { wch:20 }, { wch:18 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'BOQ & Billing');

  XLSX.writeFile(wb, `CEB_Report_${meta.projectName || 'Export'}_${new Date().toISOString().slice(0,10)}.xlsx`);
}
