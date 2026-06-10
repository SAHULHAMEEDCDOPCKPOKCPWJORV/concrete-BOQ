import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/AppContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { generatePDF } from '../utils/pdfExport';
import { generateExcel } from '../utils/excelExport';
import type { ReportMeta } from '../utils/pdfExport';
import type { BOQRow, BillingSummary } from '../utils/boqTypes';
import type { ConcreteResult } from '../utils/concreteCalc';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const DEFAULT_META: ReportMeta = {
  companyName:'L&T Construction', projectName:'Skyline Towers',
  clientName:'DLF Group', location:'Mumbai, India',
  engineerName:'Sahul Hameed', contractorName:'BuildCorp Pvt Ltd',
  date: new Date().toISOString().split('T')[0],
  preparedBy:'Sahul Hameed', checkedBy:'Ravi Kumar', approvedBy:'Amit Sharma',
};

export default function Reports() {
  const { darkMode } = useTheme();
  const [meta, setMeta]         = useState<ReportMeta>(DEFAULT_META);
  const [result, setResult]     = useState<ConcreteResult | null>(null);
  const [boqData, setBoqData]   = useState<{ rows: BOQRow[]; billing: BillingSummary } | null>(null);

  const textColor  = darkMode ? '#f1f5f9' : '#1e293b';
  const mutedColor = darkMode ? '#64748b' : '#94a3b8';
  const cardBg     = darkMode ? 'rgba(26,37,53,0.85)' : '#fff';
  const cardBorder = darkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0';

  useEffect(() => {
    const r = localStorage.getItem('ceb_latest_result');
    const b = localStorage.getItem('ceb_saved_boq');
    if (r)  { try { setResult(JSON.parse(r)); } catch {} }
    if (b)  { try { setBoqData(JSON.parse(b)); } catch {} }
  }, []);

  const pieData = boqData ? {
    labels: boqData.rows.slice(0,5).map(r => r.description.split('(')[0].trim()),
    datasets: [{ data: boqData.rows.slice(0,5).map(r => r.amount), backgroundColor: ['#f5a623','#4a90d9','#8b8680','#10b981','#6366f1'], borderColor: darkMode ? '#1e293b' : '#fff', borderWidth:2 }],
  } : null;

  const barData = boqData ? {
    labels: ['Sub Total','GST','Contingencies','Overhead','Profit'],
    datasets: [{
      label:'Amount (₹)',
      data: [
        boqData.billing.subTotal,
        (boqData.billing.subTotal * boqData.billing.gstPercent) / 100,
        (boqData.billing.subTotal * boqData.billing.contingenciesPercent) / 100,
        (boqData.billing.subTotal * boqData.billing.overheadPercent) / 100,
        (boqData.billing.subTotal * boqData.billing.profitPercent) / 100,
      ],
      backgroundColor: ['#1a3d6e','#f5a623','#10b981','#6366f1','#ef4444'],
      borderRadius: 6,
    }],
  } : null;

  const chartOptions = {
    maintainAspectRatio: false as const,
    plugins: { legend: { labels: { color: darkMode ? '#e2e8f0' : '#334155', font: { size: 12 } } } },
    scales: { y: { ticks: { color: darkMode ? '#94a3b8' : '#64748b' }, grid: { color: darkMode ? '#1e293b' : '#f1f5f9' } }, x: { ticks: { color: darkMode ? '#94a3b8' : '#64748b' }, grid: { display:false } } },
  };

  return (
    <div>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom:'24px' }}>
        <h2 style={{ fontFamily:'Outfit,sans-serif', fontSize:'28px', fontWeight:800, color: textColor, marginBottom:'4px' }}>📈 Cost Analysis &amp; Reports</h2>
        <p style={{ color: mutedColor, fontSize:'14px' }}>Generate professional company-standard PDF &amp; Excel reports.</p>
      </div>

      {/* Charts */}
      {boqData ? (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'24px' }}>
          <div className="card animate-fade-up delay-1" style={{ background: cardBg, border:`1px solid ${cardBorder}` }}>
            <h3 style={{ fontWeight:700, color: textColor, marginBottom:'20px' }}>Material Cost Distribution</h3>
            <div style={{ height:'240px' }}>
              {pieData && <Pie data={pieData} options={{ maintainAspectRatio:false, plugins:{ legend:{ position:'right', labels:{ color: darkMode?'#e2e8f0':'#334155', font:{size:11} } } } }} />}
            </div>
          </div>
          <div className="card animate-fade-up delay-2" style={{ background: cardBg, border:`1px solid ${cardBorder}` }}>
            <h3 style={{ fontWeight:700, color: textColor, marginBottom:'20px' }}>Billing Breakdown</h3>
            <div style={{ height:'240px' }}>
              {barData && <Bar data={barData} options={{ ...chartOptions, plugins:{ legend:{ display:false } } }} />}
            </div>
          </div>
        </div>
      ) : (
        <div className="card animate-fade-up" style={{ background: cardBg, border:`2px dashed ${cardBorder}`, textAlign:'center', padding:'40px', marginBottom:'24px' }}>
          <div style={{ fontSize:'60px', marginBottom:'16px', opacity:0.4 }}>📊</div>
          <p style={{ color: textColor, fontWeight:600, marginBottom:'6px' }}>No Data for Charts</p>
          <p style={{ color: mutedColor, fontSize:'13px' }}>Complete an estimation and save a BOQ to enable charts.</p>
        </div>
      )}

      {/* Report Details Form */}
      <div className="card animate-fade-up delay-3" style={{ background: cardBg, border:`1px solid ${cardBorder}` }}>
        <div className="section-header" style={{ marginBottom:'20px' }}>
          <h3 style={{ fontWeight:700, color: textColor }}>Report Details</h3>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'14px', marginBottom:'24px' }}>
          {(Object.keys(DEFAULT_META) as (keyof ReportMeta)[]).map(key => (
            <div key={key}>
              <label className="label">{key.replace(/([A-Z])/g,' $1').trim()}</label>
              <input
                type={key === 'date' ? 'date' : 'text'}
                className="c-input"
                value={meta[key]}
                onChange={e => setMeta(p => ({ ...p, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        {/* Export Buttons */}
        <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', paddingTop:'20px', borderTop:`1px solid ${cardBorder}` }}>
          <button
            className="btn-danger"
            onClick={() => result && boqData && generatePDF(meta, result, boqData.rows, boqData.billing)}
            disabled={!result || !boqData}
            style={{ flex:1, justifyContent:'center', padding:'14px', fontSize:'15px', opacity: (!result || !boqData) ? 0.5 : 1 }}
          >
            📄 Download PDF Report
          </button>
          <button
            className="btn-success"
            onClick={() => result && boqData && generateExcel(meta, result, boqData.rows, boqData.billing)}
            disabled={!result || !boqData}
            style={{ flex:1, justifyContent:'center', padding:'14px', fontSize:'15px', opacity: (!result || !boqData) ? 0.5 : 1 }}
          >
            📊 Download Excel Export
          </button>
        </div>

        {(!result || !boqData) && (
          <p style={{ color:'#f5a623', fontSize:'12px', marginTop:'12px', textAlign:'center' }}>
            ⚠️ Complete estimation → Save BOQ → Come here to export reports
          </p>
        )}
      </div>
    </div>
  );
}
