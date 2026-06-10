import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/AppContext';

const KPI_DATA = [
  { label:'Total Volume',    value:'450', unit:'m³',    icon:'🏗️', color:'#2b5da8' },
  { label:'Cement Bags',     value:'3,150',unit:'Bags', icon:'🧱', color:'#f5a623' },
  { label:'Water Required',  value:'95k',  unit:'Litres',icon:'💧', color:'#0ea5e9' },
  { label:'Estimated Cost',  value:'₹12.5',unit:'Lakhs',icon:'💰', color:'#10b981' },
  { label:'Fine Aggregate',  value:'112',  unit:'m³',   icon:'🏔️', color:'#8b5cf6' },
  { label:'Coarse Aggregate',value:'225',  unit:'m³',   icon:'🪨', color:'#f59e0b' },
  { label:'Cement Weight',   value:'157k', unit:'kg',   icon:'⚖️', color:'#ef4444' },
  { label:'Projects Active', value:'5',    unit:'Nos',  icon:'📁', color:'#06b6d4' },
];

export default function Dashboard() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const textColor  = darkMode ? '#f1f5f9' : '#1e293b';
  const mutedColor = darkMode ? '#64748b' : '#94a3b8';
  const cardBg     = darkMode ? 'rgba(26,37,53,0.85)' : '#fff';
  const cardBorder = darkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0';

  return (
    <div>
      {/* Hero */}
      <div className="animate-fade-up" style={{ marginBottom:'28px' }}>
        <h2 style={{ fontFamily:'Outfit,sans-serif', fontSize:'28px', fontWeight:800, color: textColor, marginBottom:'6px' }}>
          📊 Project Dashboard
        </h2>
        <p style={{ color: mutedColor, fontSize:'14px' }}>Welcome to Concrete BOQ Pro — Your Engineering Command Center</p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:'16px', marginBottom:'28px' }}>
        {KPI_DATA.map((k, i) => (
          <div
            key={k.label}
            className={`kpi-card animate-fade-up delay-${Math.min(i+1,8)}`}
            style={{ background: cardBg, border:`1px solid ${cardBorder}`, position:'relative', overflow:'hidden' }}
          >
            <div style={{ position:'absolute', top:0, left:0, width:'4px', height:'100%', background: k.color, borderRadius:'16px 0 0 16px' }} />
            <div style={{ paddingLeft:'8px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <p style={{ fontSize:'11px', color: mutedColor, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'4px' }}>{k.label}</p>
                  <div style={{ display:'flex', alignItems:'baseline', gap:'4px' }}>
                    <span style={{ fontSize:'26px', fontWeight:800, color: textColor, fontFamily:'Outfit,sans-serif' }}>{k.value}</span>
                    <span style={{ fontSize:'12px', color: mutedColor, fontWeight:600 }}>{k.unit}</span>
                  </div>
                </div>
                <div style={{ width:'44px', height:'44px', borderRadius:'12px', background: k.color + '22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>{k.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lower Row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
        {/* Recent Activity */}
        <div className="card animate-fade-up delay-5" style={{ background: cardBg, border:`1px solid ${cardBorder}` }}>
          <div className="section-header" style={{ marginBottom:'16px' }}>
            <h3 style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color: textColor }}>Recent Activity</h3>
          </div>
          {[
            { title:'M25 Slab — 120 m³ estimated', time:'2 hrs ago', grade:'M25' },
            { title:'BOQ updated — Column Foundation', time:'5 hrs ago', grade:'M30' },
            { title:'PDF Report generated — Block A', time:'Yesterday', grade:'M20' },
          ].map((a, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom: i < 2 ? `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}` : 'none' }}>
              <div>
                <p style={{ fontSize:'13px', fontWeight:600, color: textColor, marginBottom:'2px' }}>{a.title}</p>
                <p style={{ fontSize:'11px', color: mutedColor }}>{a.time}</p>
              </div>
              <span className="result-badge">{a.grade}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="card animate-fade-up delay-6" style={{
          background: darkMode
            ? 'linear-gradient(135deg, rgba(26,61,110,0.5), rgba(43,93,168,0.3))'
            : 'linear-gradient(135deg, #eff6ff, #dbeafe)',
          border:`1px solid ${darkMode ? 'rgba(74,144,217,0.2)' : '#bfdbfe'}`,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', minHeight:'220px',
        }}>
          <div style={{ fontSize:'56px', marginBottom:'16px' }}>🧮</div>
          <h3 style={{ fontFamily:'Outfit,sans-serif', fontSize:'20px', fontWeight:700, color: textColor, marginBottom:'8px' }}>Start New Estimation</h3>
          <p style={{ color: mutedColor, fontSize:'13px', marginBottom:'24px', maxWidth:'260px' }}>
            Calculate precise material quantities, generate BOQs, and analyze costs instantly.
          </p>
          <button className="btn-primary" onClick={() => navigate('/estimator')}>
            🚀 Open Estimator
          </button>
        </div>
      </div>
    </div>
  );
}
