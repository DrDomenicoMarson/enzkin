import React, { useMemo } from 'react';
import {
  Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Line, ComposedChart,
} from 'recharts';
import type { Measurement, FitResult } from '../types/enzyme';

interface Props {
  measurements: Measurement[];
  fitResult: FitResult | null;
}

export const LineweaverBurkPlot: React.FC<Props> = ({ measurements, fitResult }) => {
  // Transform data to 1/v vs 1/[S]
  const lbData = useMemo(() => {
    return measurements
      .filter(m => m.substrate > 0 && m.rate > 0)
      .map(m => ({
        invS: 1 / m.substrate,
        invV: 1 / m.rate,
      }));
  }, [measurements]);

  // LB regression line from fit parameters (if available)
  const lbLine = useMemo(() => {
    if (!fitResult?.success) return [];

    // For MM: 1/v = (Km/Vmax)(1/[S]) + 1/Vmax
    // slope = Km / Vmax, intercept = 1 / Vmax
    const maxInvS = Math.max(...lbData.map(d => d.invS), 1);
    const slope = fitResult.Km / fitResult.Vmax;
    const intercept = 1 / fitResult.Vmax;

    const points: { invS: number; invV: number }[] = [];
    const nPoints = 100;
    // Extend the line slightly into negative x for pedagogical value
    const minX = -0.1 * maxInvS;
    const maxX = maxInvS * 1.15;

    for (let i = 0; i <= nPoints; i++) {
      const x = minX + (i / nPoints) * (maxX - minX);
      const y = slope * x + intercept;
      if (y > 0) {
        points.push({ invS: x, invV: y });
      }
    }
    return points;
  }, [fitResult, lbData]);

  if (measurements.length === 0) {
    return (
      <div className="plot-placeholder">
        <p>Collect data to see the Lineweaver–Burk plot.</p>
      </div>
    );
  }

  return (
    <div className="lb-plot">
      <h3>Lineweaver–Burk (Double Reciprocal) Plot</h3>
      <p className="plot-note">For visualization and teaching purposes only. Do not use for parameter estimation.</p>
      <ResponsiveContainer width="100%" height={380}>
        <ComposedChart margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid)" />
          <XAxis
            dataKey="invS"
            type="number"
            name="1/[S]"
            label={{ value: '1/[S] (1/mM)', position: 'bottom', offset: 0, style: { fill: 'var(--color-text-secondary)' } }}
            tick={{ fill: 'var(--color-text-secondary)' }}
          />
          <YAxis
            dataKey="invV"
            type="number"
            name="1/v"
            label={{ value: '1/v (min/µmol)', angle: -90, position: 'insideLeft', offset: -5, style: { fill: 'var(--color-text-secondary)' } }}
            tick={{ fill: 'var(--color-text-secondary)' }}
            domain={[0, 'auto']}
          />
          <Tooltip
            formatter={(value: number) => value.toPrecision(4)}
          />
          <Legend verticalAlign="top" />
          {lbLine.length > 0 && (
            <Line
              data={lbLine}
              dataKey="invV"
              name="LB line"
              stroke="var(--color-accent)"
              strokeWidth={2}
              dot={false}
              type="monotone"
              legendType="line"
            />
          )}
          <Scatter
            data={lbData}
            name="Data (1/v vs 1/[S])"
            fill="var(--color-point)"
            shape="circle"
            legendType="circle"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
