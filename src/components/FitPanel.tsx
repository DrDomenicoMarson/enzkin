import React from 'react';
import type { FitResult } from '../types/enzyme';

interface Props {
  fitResult: FitResult | null;
  onFit: () => void;
  canFit: boolean;
}

export const FitPanel: React.FC<Props> = ({ fitResult, onFit, canFit }) => {
  return (
    <div className="fit-panel">
      <div className="fit-header">
        <button
          id="fit-curve-btn"
          onClick={onFit}
          disabled={!canFit}
          className="btn-primary"
          title={canFit ? 'Fit the kinetic model to collected data' : 'Need at least 2 measurements to fit'}
        >
          ◉ Fit curve
        </button>
      </div>

      {fitResult && (
        <div className={`fit-results ${fitResult.success ? 'fit-success' : 'fit-failure'}`}>
          {fitResult.success ? (
            <div className="fit-params">
              <div className="param-row">
                <span className="param-label">K<sub>m</sub></span>
                <span className="param-value">{fitResult.Km.toPrecision(4)} mM</span>
              </div>
              <div className="param-row">
                <span className="param-label">V<sub>max</sub></span>
                <span className="param-value">{fitResult.Vmax.toPrecision(4)} µmol/min</span>
              </div>
            </div>
          ) : (
            <p className="fit-error">Fit did not converge.</p>
          )}

          {fitResult.warnings.length > 0 && (
            <div className="fit-warnings">
              {fitResult.warnings.map((w, i) => (
                <p key={i} className="fit-warning">⚠ {w}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
