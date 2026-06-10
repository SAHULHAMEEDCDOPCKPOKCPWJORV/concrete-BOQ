import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth, useTheme } from '../context/AppContext';

const NAV = [
  { path: '/',          label: 'Dashboard', icon: '📊' },
  { path: '/estimator', label: 'Estimator', icon: '🧮' },
  { path: '/boq',       label: 'BOQ & Billing', icon: '📋' },
  { path: '/reports',   label: 'Reports',   icon: '📈' },
];

export default function MainLayout() {
  const { logout, userEmail } = useAuth();
  const { darkMode, toggleDark } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  const textColor  = darkMode ? '#f1f5f9' : '#1e293b';
  const mutedColor = darkMode ? '#64748b' : '#94a3b8';

  return (
    <div style={{ minHeight:'100vh', background: darkMode ? '#0f1923' : '#f1f5f9', display:'flex', flexDirection:'column' }}>
      {/* ── Navbar ── */}
      <nav className="navbar no-print">
        <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 20px', display:'flex', alignItems:'center', justifyContent:'space-between', height:'64px' }}>
          {/* Brand */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'linear-gradient(135deg,#f5a623,#d4890a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>🚧</div>
            <div>
              <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'16px', color: textColor }}>
                Concrete <span style={{ color:'#f5a623' }}>BOQ</span>
              </div>
              <div style={{ fontSize:'10px', color: mutedColor, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>Concrete ERP</div>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hide-mobile" style={{ display:'flex', gap:'4px' }}>
            {NAV.map(n => (
              <NavLink
                key={n.path}
                to={n.path}
                end={n.path === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <span>{n.icon}</span> {n.label}
              </NavLink>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <button
              onClick={toggleDark}
              style={{ background:'none', border:'none', cursor:'pointer', fontSize:'20px', padding:'6px', borderRadius:'8px', color: textColor }}
              title="Toggle Theme"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <div className="hide-mobile" style={{ display:'flex', alignItems:'center', gap:'8px', paddingLeft:'12px', borderLeft:'1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'#1a3d6e', border:'2px solid #f5a623', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'13px', fontWeight:700 }}>
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize:'12px', fontWeight:600, color: textColor }}>Engineer</div>
                <div style={{ fontSize:'10px', color: mutedColor, maxWidth:'140px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{userEmail}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-danger" style={{ padding:'8px 14px', fontSize:'13px' }}>
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── Page Content ── */}
      <main className="main-content" style={{ flex:1, maxWidth:'1280px', width:'100%', margin:'0 auto', padding:'24px 20px' }}>
        <Outlet />
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <div className="mobile-nav no-print">
        {NAV.map(n => (
          <NavLink
            key={n.path}
            to={n.path}
            end={n.path === '/'}
            style={({ isActive }) => ({
              display:'flex', flexDirection:'column', alignItems:'center',
              padding:'8px 12px', borderRadius:'8px', textDecoration:'none',
              color: isActive ? '#f5a623' : mutedColor,
              fontSize:'10px', fontWeight:600,
            })}
          >
            <span style={{ fontSize:'20px', marginBottom:'2px' }}>{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
