import { useState } from 'react';
import { useSession } from './hooks/useSession';
import { isNearDetectionLimit } from './engine/kinetics';
import { ExperimentControls } from './components/ExperimentControls';
import { DataTable } from './components/DataTable';
import { KineticsPlot } from './components/KineticsPlot';
import { FitPanel } from './components/FitPanel';
import { ResidualPlot } from './components/ResidualPlot';
import { LineweaverBurkPlot } from './components/LineweaverBurkPlot';
import { ExportDialog } from './components/ExportDialog';
import './App.css';

type TabId = 'kinetics' | 'residuals' | 'lineweaver-burk' | 'metadata';

const TABS: { id: TabId; label: string }[] = [
  { id: 'kinetics', label: 'Kinetics' },
  { id: 'residuals', label: 'Residuals' },
  { id: 'lineweaver-burk', label: 'Lineweaver–Burk' },
];

function App() {
  const {
    state,
    runExperiment,
    deleteMeasurement,
    performFit,
    resetExperiment,
    newExperiment,
  } = useSession();

  const [activeTab, setActiveTab] = useState<TabId>('kinetics');
  const [showExport, setShowExport] = useState(false);
  const [lastWarning, setLastWarning] = useState<string | undefined>();

  const handleRun = (substrate: number) => {
    if (state.entry && isNearDetectionLimit(state.entry, substrate)) {
      setLastWarning(
        'Substrate concentration very low: reaction likely near detection limit; measured rate may be unreliable.'
      );
    } else {
      setLastWarning(undefined);
    }
    runExperiment(substrate);
  };

  const hasData = state.measurements.length > 0;
  const hasEntry = state.entry !== null;

  return (
    <div className="app">
      {/* ─── Header ─── */}
      <header className="app-header">
        <div className="header-left">
          <h1>EnzLab</h1>
          <span className="header-subtitle">Enzyme Kinetics Simulator</span>
        </div>
        <div className="header-right">
          <span className="session-badge" title="Session ID">
            {state.sessionId}
          </span>
          <button className="btn-secondary btn-sm" onClick={resetExperiment} disabled={!hasData}>
            Reset data
          </button>
          <button className="btn-secondary btn-sm" onClick={newExperiment}>
            New experiment
          </button>
          <button
            className="btn-secondary btn-sm"
            onClick={() => setShowExport(true)}
            disabled={!hasData}
          >
            Export CSV
          </button>
        </div>
      </header>

      {/* ─── Main layout ─── */}
      <div className="main-layout">
        {/* Left sidebar – controls + data table */}
        <aside className="sidebar">
          {/* Unknown Code Display */}
          <div className="enzyme-selector">
            <span className="sidebar-label">UNKNOWN CODE</span>
            <div className="unknown-code-display" style={{ padding: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 600, color: '#0f172a', textAlign: 'center', marginBottom: '1rem', letterSpacing: '0.05em' }}>
              {state.entry?.id ?? '—'}
            </div>
            {hasData && (
              <p className="sidebar-hint">
                ↳ To change system, start a <strong>New experiment</strong>.
              </p>
            )}
          </div>

          <ExperimentControls
            onRun={handleRun}
            disabled={!hasEntry}
            warning={lastWarning}
          />

          <FitPanel
            fitResult={state.fitResult}
            onFit={performFit}
            canFit={state.measurements.length >= 2}
          />

          <DataTable
            measurements={state.measurements}
            onDelete={deleteMeasurement}
          />
        </aside>

        {/* Right panel – plots */}
        <section className="content">
          {/* Tabs */}
          <nav className="tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="tab-content">
            {activeTab === 'kinetics' && (
              <KineticsPlot
                measurements={state.measurements}
                fitResult={state.fitResult}
                entry={state.entry}
              />
            )}
            {activeTab === 'residuals' && (
              <ResidualPlot fitResult={state.fitResult} />
            )}
            {activeTab === 'lineweaver-burk' && (
              <LineweaverBurkPlot
                measurements={state.measurements}
                fitResult={state.fitResult}
              />
            )}
          </div>
        </section>
      </div>

      {/* Export modal */}
      {showExport && state.entry && (
        <ExportDialog
          measurements={state.measurements}
          entryId={state.entry.id}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}

export default App;
