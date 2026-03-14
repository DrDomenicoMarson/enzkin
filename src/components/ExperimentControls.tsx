import React, { useState } from 'react';

interface Props {
  onRun: (substrate: number) => void;
  disabled: boolean;
  warning?: string;
}

export const ExperimentControls: React.FC<Props> = ({ onRun, disabled, warning }) => {
  const [value, setValue] = useState('');
  const [inputError, setInputError] = useState('');

  const handleRun = () => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      setInputError('Enter a positive number for [S] in mM.');
      return;
    }
    setInputError('');
    onRun(num);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRun();
  };

  return (
    <div className="experiment-controls">
      <label htmlFor="substrate-input">[S] (mM)</label>
      <div className="controls-row">
        <input
          id="substrate-input"
          type="number"
          step="any"
          min="0"
          placeholder="e.g. 0.5"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button
          id="run-experiment-btn"
          onClick={handleRun}
          disabled={disabled}
          className="btn-primary"
        >
          ▶ Run experiment
        </button>
      </div>
      {inputError && <p className="input-error">{inputError}</p>}
      {warning && <p className="detection-warning">⚠ {warning}</p>}
    </div>
  );
};
