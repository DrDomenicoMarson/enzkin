import { StrictMode, useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { loadDatabase } from './data/database';
import type { EnzymeSubstrateEntry } from './types/enzyme';
import './index.css';

function DecoderApp() {
  const db = useMemo(() => loadDatabase(), []);
  const [inputCode, setInputCode] = useState('');
  const [result, setResult] = useState<EnzymeSubstrateEntry | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const handleDecode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = inputCode.trim();
    if (!cleanInput) return;

    const entry = db.find(e => e.id === cleanInput);
    if (entry) {
      setResult(entry);
      setErrorStatus(null);
    } else {
      setResult(null);
      setErrorStatus(`Unknown code "${cleanInput}" not found in database.`);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>EnzLab Decoder</h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Lookup tool for Enzyme Kinetics experiment unknowns.</p>
      </header>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
        <form onSubmit={handleDecode} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Enter your Unknown Code (e.g. hex-glc-1)"
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontFamily: 'monospace'
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
          >
            Decode Unknown
          </button>
        </form>

        {errorStatus && (
          <div style={{ padding: '1rem', background: '#fef2f2', color: '#b91c1c', borderRadius: '6px', border: '1px solid #fecaca' }}>
            {errorStatus}
          </div>
        )}

        {result && (
          <div className="metadata-panel" style={{ marginTop: '2rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1.5rem', fontWeight: 600 }}>Decoded Identity: {result.id}</h2>
            
            <table className="metadata-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, width: '30%' }}>ENZYME</th>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>{result.enzymeName}</td>
                </tr>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>SUBSTRATE</th>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>{result.substrateName}</td>
                </tr>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>KINETIC MODEL</th>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>
                    {result.modelType === 'mm' ? 'Michaelis–Menten' : 'Substrate Inhibition'}
                  </td>
                </tr>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0', color: '#16a34a', fontWeight: 600 }}>TRUE K<sub>m</sub></th>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', color: '#0f172a', fontFamily: 'monospace', fontWeight: 600 }}>{result.Km} mM</td>
                </tr>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0', color: '#16a34a', fontWeight: 600 }}>TRUE V<sub>max</sub></th>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', color: '#0f172a', fontFamily: 'monospace', fontWeight: 600 }}>{result.Vmax} µmol/min</td>
                </tr>
                {result.Ki !== undefined && (
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0', color: '#16a34a', fontWeight: 600 }}>TRUE K<sub>i</sub></th>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', color: '#0f172a', fontFamily: 'monospace', fontWeight: 600 }}>{result.Ki} mM</td>
                  </tr>
                )}
                {result.metadata && Object.entries(result.metadata).map(([key, value]) => (
                  <tr key={key}>
                    <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </th>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DecoderApp />
  </StrictMode>,
);
