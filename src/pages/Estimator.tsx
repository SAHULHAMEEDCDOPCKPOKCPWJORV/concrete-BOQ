import { useState, useEffect } from 'react';
import { useTheme } from '../context/AppContext';
import {
  calculateConcrete,
  CONCRETE_GRADES,
  WC_RATIO_TABLE,
  ADMIXTURE_TYPES,
  ADMIXTURE_MANUFACTURERS,
} from '../utils/concreteCalc';
import type { ConcreteInput, ConcreteResult } from '../utils/concreteCalc';

const DEFAULT_INPUT: ConcreteInput = {
  grade: 'M20',
  wetVolume: 10,
  wcRatio: 0.50,
  admixture: { required: false, type: 'Plasticizer', manufacturer: 'Fosroc', dosagePercent: 0.5 },
};

export default function Estimator() {
  const { darkMode } = useTheme();
  const [input, setInput]   = useState<ConcreteInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<ConcreteResult | null>(null);

  const textColor  = darkMode ? '#f1f5f9' : '#1e293b';
  const mutedColor = darkMode ? '#64748b' : '#94a3b8';
  const cardBg     = darkMode ? 'rgba(26,37,53,0.85)' : '#fff';
  const cardBorder = darkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0';

  const isNominal = ['M5','M7.5','M10','M15','M20'].includes(input.grade);

  // Auto-update W/C ratio when grade changes
  useEffect(() => {
    setInput(prev => ({
      ...prev,
      wcRatio: WC_RATIO_TABLE[prev.grade],
      designMixInput: isNominal ? undefined : (prev.designMixInput ?? { cementKgPerM3: 400, fineAggKgPerM3: 700, coarseAggKgPerM3: 1100 }),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input.grade]);

  const handleCalculate = () => {
    const res = calculateConcrete(input);
    setResult(res);
    localStorage.setItem('ceb_latest_result', JSON.stringify(res));
  };

  return (
    <div>
      <div className="animate-fade-up" style={{ marginBottom:'24px' }}>
        <h2 style={{ fontFamily:'Outfit,sans-serif', fontSize:'28px', fontWeight:800, color: textColor, marginBottom:'6px' }}>🧮 Concrete Estimator</h2>
        <p style={{ color: mutedColor, fontSize:'14px' }}>Calculate exact material requirements as per IS 456 &amp; IS 10262.</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'320px 1fr', gap:'20px', alignItems:'start' }}>
        {/* ── Input Panel ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {/* Basic Parameters */}
          <div className="card animate-fade-up delay-1" style={{ background: cardBg, border:`1px solid ${cardBorder}` }}>
            <div className="section-header" style={{ marginBottom:'16px' }}>
              <h3 style={{ fontWeight:700, color: textColor }}>Basic Parameters</h3>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div>
                <label className="label">Concrete Grade</label>
                <select className="c-input" value={input.grade} onChange={e => setInput(p => ({ ...p, grade: e.target.value as any }))}>
                  {CONCRETE_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div style={{ padding:'10px 14px', background:'rgba(245,166,35,0.08)', border:'1px solid rgba(245,166,35,0.25)', borderRadius:'8px', fontSize:'13px', color:'#f5a623', fontWeight:600 }}>
                Mix Type: {isNominal ? '🔵 Nominal Mix' : '🟠 Design Mix (IS 10262)'}
              </div>

              <div>
                <label className="label">Concrete Volume (m³)</label>
                <input type="number" className="c-input" min="0.1" step="0.1" value={input.wetVolume} onChange={e => setInput(p => ({ ...p, wetVolume: Number(e.target.value) }))} />
              </div>

              <div>
                <label className="label">W/C Ratio (Auto-filled, editable)</label>
                <input type="number" className="c-input" step="0.01" min="0.1" max="0.9" value={input.wcRatio} onChange={e => setInput(p => ({ ...p, wcRatio: Number(e.target.value) }))} />
              </div>

              {/* Design Mix Inputs */}
              {!isNominal && (
                <div style={{ padding:'14px', background: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderRadius:'10px', border:`1px solid ${cardBorder}` }}>
                  <p style={{ fontSize:'12px', fontWeight:700, color:'#f5a623', marginBottom:'12px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Design Mix Inputs (kg/m³)</p>
                  {[
                    { key:'cementKgPerM3',   label:'Cement', def:400 },
                    { key:'fineAggKgPerM3',  label:'Fine Aggregate', def:700 },
                    { key:'coarseAggKgPerM3',label:'Coarse Aggregate', def:1100 },
                  ].map(f => (
                    <div key={f.key} style={{ marginBottom:'10px' }}>
                      <label className="label">{f.label}</label>
                      <input
                        type="number" className="c-input" style={{ padding:'8px 12px', fontSize:'13px' }}
                        value={(input.designMixInput as any)?.[f.key] ?? f.def}
                        onChange={e => setInput(p => ({
                          ...p,
                          designMixInput: { ...( p.designMixInput ?? { cementKgPerM3:400, fineAggKgPerM3:700, coarseAggKgPerM3:1100 }), [f.key]: Number(e.target.value) }
                        }))}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Admixture */}
          <div className="card animate-fade-up delay-2" style={{ background: cardBg, border:`1px solid ${cardBorder}` }}>
            <div className="section-header" style={{ marginBottom:'16px' }}>
              <h3 style={{ fontWeight:700, color: textColor }}>Admixture</h3>
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', marginBottom:'14px', color: textColor, fontSize:'14px', fontWeight:500 }}>
              <input type="checkbox" checked={input.admixture.required} onChange={e => setInput(p => ({ ...p, admixture: { ...p.admixture, required: e.target.checked } }))} />
              Is Admixture Required?
            </label>
            {input.admixture.required && (
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                <div>
                  <label className="label">Type</label>
                  <select className="c-input" value={input.admixture.type} onChange={e => setInput(p => ({ ...p, admixture: { ...p.admixture, type: e.target.value } }))}>
                    {ADMIXTURE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Manufacturer</label>
                  <select className="c-input" value={input.admixture.manufacturer} onChange={e => setInput(p => ({ ...p, admixture: { ...p.admixture, manufacturer: e.target.value } }))}>
                    {ADMIXTURE_MANUFACTURERS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Dosage (% of cement weight)</label>
                  <input type="number" className="c-input" step="0.1" min="0" max="5" value={input.admixture.dosagePercent} onChange={e => setInput(p => ({ ...p, admixture: { ...p.admixture, dosagePercent: Number(e.target.value) } }))} />
                </div>
              </div>
            )}
          </div>

          {/* Calculate Button */}
          <button className="btn-primary animate-fade-up delay-3" onClick={handleCalculate} style={{ width:'100%', justifyContent:'center', fontSize:'16px', padding:'14px' }}>
            ⚡ Calculate Materials
          </button>
        </div>

        {/* ── Results Panel ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {result ? (
            <>
              {/* Result KPI cards */}
              <div className="animate-fade-in" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'12px' }}>
                {[
                  { label:'Cement Bags',        value: result.cementBags,                          unit:'Bags',  sub: result.cementWeightKg.toFixed(2)+' kg',    icon:'🧱', color:'#f5a623' },
                  { label:'Cement Weight',       value: result.cementWeightKg.toFixed(1),           unit:'kg',    sub: result.cementVolume.toFixed(4)+' m³',      icon:'⚖️', color:'#f59e0b' },
                  { label:'Fine Aggregate',      value: result.fineAggregateVolume.toFixed(2),      unit:'m³',    sub: result.fineAggregateWeight.toFixed(1)+' kg',icon:'🏔️', color:'#8b5cf6' },
                  { label:'Coarse Aggregate',    value: result.coarseAggregateVolume.toFixed(2),    unit:'m³',    sub: result.coarseAggregateWeight.toFixed(1)+' kg',icon:'🪨', color:'#6366f1' },
                  { label:'Water Required',      value: result.waterLitres.toFixed(1),              unit:'Litres',sub: result.waterKL.toFixed(3)+' kL',           icon:'💧', color:'#0ea5e9' },
                  { label:'Dry Volume',          value: result.dryVolume.toFixed(3),                unit:'m³',    sub: 'Wet Vol × 1.54',                          icon:'📦', color:'#10b981' },
                  ...(result.admixture.required ? [{ label:'Admixture', value: result.admixture.quantityKg.toFixed(2), unit:'kg', sub: result.admixture.type, icon:'🧪', color:'#ef4444' }] : []),
                ].map((k, i) => (
                  <div key={k.label} className={`kpi-card delay-${i+1}`} style={{ background: cardBg, border:`1px solid ${cardBorder}`, position:'relative', overflow:'hidden' }}>
                    <div style={{ position:'absolute', top:0, left:0, width:'3px', height:'100%', background: k.color }} />
                    <div style={{ paddingLeft:'6px' }}>
                      <div style={{ fontSize:'20px', marginBottom:'4px' }}>{k.icon}</div>
                      <p style={{ fontSize:'10px', color: mutedColor, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.3px' }}>{k.label}</p>
                      <p style={{ fontSize:'22px', fontWeight:800, color: textColor, fontFamily:'Outfit,sans-serif' }}>
                        {k.value} <span style={{ fontSize:'11px', fontWeight:600, color: mutedColor }}>{k.unit}</span>
                      </p>
                      <p style={{ fontSize:'11px', color: mutedColor }}>{k.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mix Ratio Banner */}
              <div className="animate-fade-in" style={{ padding:'16px 20px', borderRadius:'12px', background:'linear-gradient(135deg, rgba(26,61,110,0.5), rgba(43,93,168,0.3))', border:'1px solid rgba(74,144,217,0.2)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ fontSize:'11px', color:'#94a3b8', fontWeight:600, textTransform:'uppercase', marginBottom:'4px' }}>Mix Ratio / Type</p>
                  <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'18px', fontWeight:700, color:'#f5a623' }}>{result.mixRatio}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontSize:'11px', color:'#94a3b8', fontWeight:600, textTransform:'uppercase', marginBottom:'4px' }}>W/C Ratio</p>
                  <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'18px', fontWeight:700, color:'#10b981' }}>{result.wcRatio.toFixed(2)}</p>
                </div>
              </div>

              {/* Calculation Steps */}
              <div className="card animate-fade-in" style={{ background: cardBg, border:`1px solid ${cardBorder}` }}>
                <div className="section-header" style={{ marginBottom:'16px' }}>
                  <h3 style={{ fontWeight:700, color: textColor }}>Step-by-Step Calculation</h3>
                </div>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                  <thead>
                    <tr style={{ borderBottom:`2px solid ${darkMode ? 'rgba(255,255,255,0.08)' : '#f1f5f9'}` }}>
                      <th style={{ textAlign:'left', padding:'8px 4px', color: mutedColor, fontWeight:600, fontSize:'11px', textTransform:'uppercase' }}>Parameter</th>
                      <th style={{ textAlign:'left', padding:'8px 4px', color: mutedColor, fontWeight:600, fontSize:'11px', textTransform:'uppercase' }}>Formula</th>
                      <th style={{ textAlign:'right', padding:'8px 4px', color: mutedColor, fontWeight:600, fontSize:'11px', textTransform:'uppercase' }}>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.steps.map((s, i) => (
                      <tr key={i} className="step-row">
                        <td style={{ padding:'9px 4px', fontWeight:600, color: textColor }}>{s.label}</td>
                        <td style={{ padding:'9px 4px', fontFamily:'monospace', fontSize:'12px', color: mutedColor }}>{s.formula}</td>
                        <td style={{ padding:'9px 4px', textAlign:'right', fontWeight:700, color:'#f5a623' }}>
                          {s.value} <span style={{ fontSize:'11px', fontWeight:400, color: mutedColor }}>{s.unit}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="card animate-fade-in" style={{
              background: cardBg, border:`2px dashed ${cardBorder}`,
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              minHeight:'400px', textAlign:'center',
            }}>
              <div style={{ fontSize:'80px', marginBottom:'20px', opacity:0.4 }}>🧮</div>
              <h3 style={{ color: textColor, fontWeight:700, marginBottom:'8px' }}>No Results Yet</h3>
              <p style={{ color: mutedColor, fontSize:'14px' }}>Set the parameters on the left and click<br/><strong>"Calculate Materials"</strong> to see results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
