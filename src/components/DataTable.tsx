import React from 'react';
import type { Measurement } from '../types/enzyme';

interface Props {
  measurements: Measurement[];
  onDelete: (index: number) => void;
}

export const DataTable: React.FC<Props> = ({ measurements, onDelete }) => {
  if (measurements.length === 0) {
    return (
      <div className="data-table-empty">
        <p>No measurements yet. Set a substrate concentration and click <strong>Run experiment</strong>.</p>
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>[S] (mM)</th>
            <th>v (µmol/min)</th>
            <th>Flag</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {measurements.map(m => (
            <tr key={m.index} className={m.warning ? 'row-warning' : ''}>
              <td>{m.index}</td>
              <td>{m.substrate.toPrecision(4)}</td>
              <td>{m.rate.toPrecision(4)}</td>
              <td>{m.warning ? '⚠' : ''}</td>
              <td>
                <button
                  className="btn-delete"
                  onClick={() => onDelete(m.index)}
                  title="Delete measurement"
                  aria-label={`Delete measurement ${m.index}`}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
