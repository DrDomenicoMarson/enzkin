import React, { useState } from 'react';
import type { Measurement } from '../types/enzyme';
import { buildCsv, downloadFile } from '../utils/csv';

interface Props {
  measurements: Measurement[];
  entryId: string;
  onClose: () => void;
}

export const ExportDialog: React.FC<Props> = ({
  measurements,
  entryId,
  onClose,
}) => {
  const [fieldSep, setFieldSep] = useState(',');
  const [decimalSep, setDecimalSep] = useState('.');
  const [filename, setFilename] = useState('');
  const [error, setError] = useState('');

  const handleExport = () => {
    if (fieldSep === decimalSep) {
      setError('Field separator and decimal separator must differ.');
      return;
    }
    if (measurements.length === 0) {
      setError('No data to export.');
      return;
    }
    setError('');

    const defaultName = `enzkin_${entryId}.csv`;
    const name = filename.trim() || defaultName;

    const csv = buildCsv(measurements, entryId, fieldSep, decimalSep);
    downloadFile(csv, name);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Export Data to CSV</h3>

        <div className="export-field">
          <label htmlFor="export-field-sep">Field separator</label>
          <select
            id="export-field-sep"
            value={fieldSep}
            onChange={e => setFieldSep(e.target.value)}
          >
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value="\t">Tab</option>
          </select>
        </div>

        <div className="export-field">
          <label htmlFor="export-decimal-sep">Decimal separator</label>
          <select
            id="export-decimal-sep"
            value={decimalSep}
            onChange={e => setDecimalSep(e.target.value)}
          >
            <option value=".">Period (.)</option>
            <option value=",">Comma (,)</option>
          </select>
        </div>

        <div className="export-field">
          <label htmlFor="export-filename">Filename (optional)</label>
          <input
            id="export-filename"
            type="text"
            placeholder={`enzkin_${entryId}.csv`}
            value={filename}
            onChange={e => setFilename(e.target.value)}
          />
        </div>

        {error && <p className="input-error">{error}</p>}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleExport}>Download CSV</button>
        </div>
      </div>
    </div>
  );
};
