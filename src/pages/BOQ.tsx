import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/AppContext';
import { createDefaultBOQRows, computeBillingSummary, generateId } from '../utils/boqTypes';
import type { BOQRow, BillingSummary } from '../utils/boqTypes';

export default function BOQ() {
  const { darkMode } = useTheme();
  const [rows, setRows]       = useState<BOQRow[]>([]);
  const [billing, setBilling] = useState<BillingSummary>({
    subTotal:0, gstPercent:18, contingenciesPercent:3, overheadPercent:5, profitPercent:10, roundOff:0, netPayable:0,
  });
  const [saved, setSaved] = useState(false);

  const textColor  = darkMode ? '#f1f5f9' : '#1e293b';
  const mutedColor = darkMode ? '#64748b' : '#94a3b8';
  const cardBg     = darkMode ? 'rgba(26,37,53,0.85)' : '#fff';
  const cardBorder = darkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0';

  useEffect(() => {
    const saved = localStorage.getItem('ceb_saved_boq');
    if (saved) {
      try { const d = JSON.parse(saved); setRows(d.rows); setBilling(d.billing); return; } catch {}
    }
    const res = localStorage.getItem('ceb_latest_result');
    let initRows: BOQRow[];
    if (res) {
      try { initRows = createDefaultBOQRows(JSON.parse(res)); }
      catch { initRows = createDefaultBOQRows(); }
    } else {
      initRows = createDefaultBOQRows();
    }
    setRows(initRows);
    setBilling(computeBillingSummary(initRows, 18, 3, 5, 10));
  }, []);

  const recalc = (newRows: BOQRow[], b: BillingSummary) => {
    const updated = computeBillingSummary(newRows, b.gstPercent, b.contingenciesPercent, b.overheadPercent, b.profitPercent);
    setBilling(updated);
    setSaved(false);
  };

  const changeRow = (id: string, field: keyof BOQRow, val: string | number) => {
    const newRows = rows.map(r => {
      if (r.id !== id) return r;
      const nr = { ...r, [field]: val };
      if (field === 'quantity' || field === 'rate') {
        nr.amount = parseFloat((nr.quantity * nr.rate).toFixed(2));
      }
      return nr;
    });
    setRows(newRows);
    recalc(newRows, billing);
  };

  const addRow = () => {
    const newRow: BOQRow = { id: generateId(), sno: rows.length + 1, description: 'New Item', unit: 'Nos', quantity: 1, rate: 0, amount: 0 };
    const newRows = [...rows, newRow];
    setRows(newRows);
    recalc(newRows, billing);
  };

  const deleteRow = (id: string) => {
    const newRows = rows.filter(r => r.id !== id).map((r, i) => ({ ...r, sno: i + 1 }));
    setRows(newRows);
    recalc(newRows, billing);
  };

  const duplicateRow = (id: string) => {
    const src = rows.find(r => r.id === id)!;
    const newRow = { ...src, id: generateId(), sno: rows.length + 1 };
    const newRows = [...rows, newRow];
    setRows(newRows);
    recalc(newRows, billing);
  };

  const changeBilling = (field: keyof BillingSummary, val: number) => {
    const updated = { ...billing, [field]: val };
    const fresh   = computeBillingSummary(rows, updated.gstPercent, updated.contingenciesPercent, updated.overheadPercent, updated.profitPercent);
    setBilling(fresh);
    setSaved(false);
  };

  const saveBOQ = () => {
    localStorage.setItem('ceb_saved_boq', JSON.stringify({ rows, billing }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputStyle: React.CSSProperties = {
    background:'transparent', border:'none', borderBottom:`1px solid transparent`,
    outline:'none', width:'100%', padding:'2px 0', fontFamily:'inherit', fontSize:'13px',
    color: textColor, cursor:'text',
  };

  return (
    <div>
      {/* Header */}
      <div className="animate-fade-up" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'24px' }}>
        <div>
          <h2 style={{ fontFamily:'Outfit,sans-serif', fontSize:'28px', fontWeight:800, color: textColor, marginBottom:'4px' }}>📋 Bill of Quantities</h2>
          <p style={{ color: mutedColor, fontSize:'14px' }}>Editable inline BOQ with real-time billing summary.</p>
        </div>
        <button className={saved ? 'btn-success' : 'btn-secondary'} onClick={saveBOQ}>
          {saved ? '✅ Saved!' : '💾 Save BOQ'}
        </button>
      </div>

      {/* BOQ Table */}
      <div className="card animate-fade-up delay-1" style={{ background: cardBg, border:`1px solid ${cardBorder}`, padding:0, overflow:'hidden', marginBottom:'24px' }}>
        <div style={{ overflowX:'auto' }}>
          <table className="boq-table">
            <thead>
              <tr>
                <th style={{ width:'50px' }}>#</th>
                <th>Item Description</th>
                <th style={{ width:'90px' }}>Unit</th>
                <th style={{ width:'100px', textAlign:'right' }}>Quantity</th>
                <th style={{ width:'110px', textAlign:'right' }}>Rate (₹)</th>
                <th style={{ width:'120px', textAlign:'right' }}>Amount (₹)</th>
                <th style={{ width:'90px', textAlign:'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} style={{ color: textColor }}>
                  <td style={{ textAlign:'center', fontWeight:600, opacity:0.5, fontSize:'12px' }}>{row.sno}</td>
                  <td>
                    <input
                      style={inputStyle}
                      value={row.description}
                      onChange={e => changeRow(row.id, 'description', e.target.value)}
                      onFocus={e => (e.target.style.borderBottomColor = '#f5a623')}
                      onBlur={e => (e.target.style.borderBottomColor = 'transparent')}
                    />
                  </td>
                  <td>
                    <input
                      style={inputStyle}
                      value={row.unit}
                      onChange={e => changeRow(row.id, 'unit', e.target.value)}
                      onFocus={e => (e.target.style.borderBottomColor = '#f5a623')}
                      onBlur={e => (e.target.style.borderBottomColor = 'transparent')}
                    />
                  </td>
                  <td>
                    <input
                      type="number" style={{ ...inputStyle, textAlign:'right' }}
                      value={row.quantity}
                      onChange={e => changeRow(row.id, 'quantity', Number(e.target.value))}
                      onFocus={e => (e.target.style.borderBottomColor = '#f5a623')}
                      onBlur={e => (e.target.style.borderBottomColor = 'transparent')}
                    />
                  </td>
                  <td>
                    <input
                      type="number" style={{ ...inputStyle, textAlign:'right' }}
                      value={row.rate}
                      onChange={e => changeRow(row.id, 'rate', Number(e.target.value))}
                      onFocus={e => (e.target.style.borderBottomColor = '#f5a623')}
                      onBlur={e => (e.target.style.borderBottomColor = 'transparent')}
                    />
                  </td>
                  <td style={{ textAlign:'right', fontWeight:700 }}>
                    <input
                      type="number" style={{ ...inputStyle, textAlign:'right', fontWeight:700, color: darkMode ? '#f5a623' : '#1a3d6e' }}
                      value={row.amount}
                      onChange={e => changeRow(row.id, 'amount', Number(e.target.value))}
                      onFocus={e => (e.target.style.borderBottomColor = '#f5a623')}
                      onBlur={e => (e.target.style.borderBottomColor = 'transparent')}
                    />
                  </td>
                  <td>
                    <div style={{ display:'flex', justifyContent:'center', gap:'6px' }}>
                      <button onClick={() => duplicateRow(row.id)} title="Duplicate" style={{ background:'none', border:'none', cursor:'pointer', fontSize:'16px', padding:'2px 4px', borderRadius:'4px' }}>📄</button>
                      <button onClick={() => deleteRow(row.id)}    title="Delete"    style={{ background:'none', border:'none', cursor:'pointer', fontSize:'16px', padding:'2px 4px', borderRadius:'4px' }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding:'14px 16px', borderTop:`1px solid ${cardBorder}`, background: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
          <button onClick={addRow} style={{ background:'none', border:'none', cursor:'pointer', color:'#f5a623', fontWeight:700, fontSize:'13px', display:'flex', alignItems:'center', gap:'6px' }}>
            ➕ Add New Row
          </button>
        </div>
      </div>

      {/* Billing Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 420px', gap:'20px', alignItems:'start' }}>
        <div />
        <div className="card animate-fade-up delay-2" style={{ background: cardBg, border:`1px solid ${cardBorder}` }}>
          <div className="section-header" style={{ marginBottom:'20px' }}>
            <h3 style={{ fontWeight:700, color: textColor }}>Billing Summary</h3>
          </div>

          {/* Sub total */}
          <div className="billing-row">
            <span style={{ fontWeight:600, color: textColor }}>Sub Total</span>
            <span style={{ fontWeight:700, color: textColor }}>₹ {billing.subTotal.toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
          </div>

          {/* Percentage rows */}
          {([
            { field:'gstPercent',           label:'GST'           },
            { field:'contingenciesPercent', label:'Contingencies' },
            { field:'overheadPercent',      label:'Overhead'      },
            { field:'profitPercent',        label:'Profit'        },
          ] as { field: keyof BillingSummary; label: string }[]).map(item => {
            const pct = billing[item.field] as number;
            const amt = (billing.subTotal * pct) / 100;
            return (
              <div key={item.field} className="billing-row">
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ color: mutedColor, fontSize:'13px' }}>{item.label}</span>
                  <input
                    type="number" min="0" max="100" step="0.5"
                    value={pct}
                    onChange={e => changeBilling(item.field, Number(e.target.value))}
                    style={{ width:'56px', background: darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9', border:`1px solid ${cardBorder}`, borderRadius:'6px', padding:'3px 8px', color: textColor, fontSize:'12px', outline:'none', fontFamily:'inherit' }}
                  />
                  <span style={{ color: mutedColor, fontSize:'12px' }}>%</span>
                </div>
                <span style={{ color: mutedColor, fontSize:'13px' }}>₹ {amt.toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
              </div>
            );
          })}

          <div className="billing-row">
            <span style={{ color: mutedColor, fontSize:'13px' }}>Round Off</span>
            <span style={{ color: mutedColor, fontSize:'13px' }}>{billing.roundOff >= 0 ? '+' : ''}{billing.roundOff.toFixed(2)}</span>
          </div>

          {/* Net Payable */}
          <div style={{ marginTop:'16px', padding:'16px 20px', borderRadius:'12px', background:'linear-gradient(135deg, #1a3d6e, #2b5da8)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'16px', fontWeight:700, color:'white' }}>NET PAYABLE</span>
            <span style={{ fontFamily:'Outfit,sans-serif', fontSize:'24px', fontWeight:900, color:'#ffd166' }}>
              ₹ {billing.netPayable.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
