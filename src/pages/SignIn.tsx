import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AppContext';

export default function SignIn() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400)); // brief animation delay
    const ok = login(email, password);
    setLoading(false);
    if (ok) {
      navigate('/', { replace: true });
    } else {
      setError('Invalid email or password. Access denied.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f1923 0%, #1a2535 50%, #1a3d6e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow blobs */}
      <div style={{ position:'absolute', top:'-100px', right:'-100px', width:'400px', height:'400px', borderRadius:'50%', background:'rgba(245,166,35,0.08)', filter:'blur(80px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-100px', left:'-100px', width:'400px', height:'400px', borderRadius:'50%', background:'rgba(43,93,168,0.12)', filter:'blur(80px)', pointerEvents:'none' }} />

      <div className="glass-card animate-fade-up" style={{ width:'100%', maxWidth:'440px', padding:'48px 40px' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'36px' }}>
          <div className="animate-pulse-glow" style={{
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            width:'72px', height:'72px', borderRadius:'20px',
            background:'linear-gradient(135deg, #f5a623, #d4890a)',
            marginBottom:'20px', fontSize:'32px',
          }}>🚧</div>
          <h1 style={{ fontFamily:'Outfit,sans-serif', fontSize:'28px', fontWeight:800, color:'#f1f5f9', marginBottom:'6px' }}>
            Concrete BOQ
          </h1>
          <p style={{ color:'#64748b', fontSize:'14px' }}>Professional ERP &amp; Billing Module</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:'20px' }}>
            <label className="label">Email Address</label>
            <input
              type="email"
              required
              className="c-input"
              placeholder="engineer@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div style={{ marginBottom:'24px' }}>
            <label className="label">Password</label>
            <input
              type="password"
              required
              className="c-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div style={{
              background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.4)',
              borderRadius:'8px', padding:'12px 16px', marginBottom:'20px',
              color:'#f87171', fontSize:'14px',
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width:'100%', justifyContent:'center', fontSize:'16px', padding:'14px' }}
          >
            {loading ? '⏳ Authenticating...' : '🔒 Secure Sign In'}
          </button>
        </form>

        <div style={{ marginTop:'32px', textAlign:'center', borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:'20px', color:'#475569', fontSize:'12px' }}>
          <p>© {new Date().getFullYear()} Concrete BOQ Pro</p>
          <p style={{ marginTop:'4px' }}>Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  );
}
