import React from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { FitResult } from '../types/enzyme';

interface Props {
  fitResult: FitResult | null;
}

export const ResidualPlot: React.FC<Props> = ({ fitResult }) => {
  if (!fitResult || !fitResult.success) {
    return (
      <div className="plot-placeholder">
        <p>Fit a model to see residuals.</p>
      </div>
    );
  }

  const data = fitResult.residuals.map(r => ({
    s: r.substrate,
    residual: r.residual,
  }));

  return (
    <div className="residual-plot">
      <h3>Residuals (Observed − Predicted)</h3>
      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid)" />
          <XAxis
            dataKey="s"
            type="number"
            name="[S]"
            label={{ value: '[S] (mM)', position: 'bottom', offset: 0, style: { fill: 'var(--color-text-secondary)' } }}
            tick={{ fill: 'var(--color-text-secondary)' }}
          />
          <YAxis
            dataKey="residual"
            type="number"
            name="Residual"
            label={{ value: 'Residual (µmol/min)', angle: -90, position: 'insideLeft', offset: -5, style: { fill: 'var(--color-text-secondary)' } }}
            tick={{ fill: 'var(--color-text-secondary)' }}
          />
          <ReferenceLine y={0} stroke="var(--color-text-muted)" strokeDasharray="4 4" />
          <Tooltip
            formatter={(value: number) => value.toPrecision(4)}
            labelFormatter={(label: number) => `[S] = ${label.toPrecision(4)} mM`}
          />
          <Scatter data={data} fill="var(--color-residual)" shape="circle" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
