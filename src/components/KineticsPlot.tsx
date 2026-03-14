import React, { useMemo } from 'react';
import {
  Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Line, ComposedChart,
} from 'recharts';
import type { Measurement, FitResult, EnzymeSubstrateEntry } from '../types/enzyme';


interface Props {
  measurements: Measurement[];
  fitResult: FitResult | null;
  entry: EnzymeSubstrateEntry | null;
}

export const KineticsPlot: React.FC<Props> = ({ measurements, fitResult, entry }) => {
  // Generate fitted curve data
  const curveData = useMemo(() => {
    if (!fitResult?.success || !entry) return [];

    const maxS = Math.max(...measurements.map(m => m.substrate), 1);
    const points: { s: number; v: number }[] = [];
    const nPoints = 200;

    for (let i = 0; i <= nPoints; i++) {
      const s = (i / nPoints) * maxS * 1.15;
      let v: number;

      if (fitResult.Ki != null) {
        v = (fitResult.Vmax * s) / (fitResult.Km + s + (s * s) / fitResult.Ki);
      } else {
        v = (fitResult.Vmax * s) / (fitResult.Km + s);
      }
      points.push({ s, v });
    }
    return points;
  }, [fitResult, measurements, entry]);

  // Scatter data
  const scatterData = measurements.map(m => ({ s: m.substrate, v: m.rate }));

  if (measurements.length === 0) {
    return (
      <div className="plot-placeholder">
        <p>Collect data to see the rate vs [S] plot.</p>
      </div>
    );
  }

  return (
    <div className="kinetics-plot">
      <h3>Rate vs Substrate Concentration</h3>
      <ResponsiveContainer width="100%" height={380}>
        <ComposedChart margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid)" />
          <XAxis
            dataKey="s"
            type="number"
            name="[S]"
            label={{ value: '[S] (mM)', position: 'bottom', offset: 0, style: { fill: 'var(--color-text-secondary)' } }}
            tick={{ fill: 'var(--color-text-secondary)' }}
            domain={[0, 'auto']}
          />
          <YAxis
            dataKey="v"
            type="number"
            name="v"
            label={{ value: 'v (µmol/min)', angle: -90, position: 'insideLeft', offset: -5, style: { fill: 'var(--color-text-secondary)' } }}
            tick={{ fill: 'var(--color-text-secondary)' }}
            domain={[0, 'auto']}
          />
          <Tooltip
            formatter={(value: number) => value.toPrecision(4)}
            labelFormatter={(label: number) => `[S] = ${label.toPrecision(4)} mM`}
          />
          <Legend verticalAlign="top" />
          {curveData.length > 0 && (
            <Line
              data={curveData}
              dataKey="v"
              name="Fitted curve"
              stroke="var(--color-accent)"
              strokeWidth={2}
              dot={false}
              type="monotone"
              legendType="line"
            />
          )}
          <Scatter
            data={scatterData}
            name="Raw data"
            fill="var(--color-point)"
            shape="circle"
            legendType="circle"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
