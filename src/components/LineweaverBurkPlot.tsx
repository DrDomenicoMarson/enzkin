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
    const validMeasurements = measurements.filter(m => m.substrate > 0 && m.rate > 0);
    
    // Group by substrate
    const groups = new Map<number, number[]>();
    for (const m of validMeasurements) {
      if (!groups.has(m.substrate)) {
        groups.set(m.substrate, []);
      }
      groups.get(m.substrate)!.push(m.rate);
    }

    const individualPoints: { invS: number; invV: number }[] = [];
    const averagePoints: { invS: number; invV: number }[] = [];

    for (const [s, rates] of groups.entries()) {
      const invS = 1 / s;
      if (rates.length === 1) {
        averagePoints.push({ invS, invV: 1 / rates[0] });
      } else {
        const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
        averagePoints.push({ invS, invV: 1 / avgRate });
        for (const r of rates) {
          individualPoints.push({ invS, invV: 1 / r });
        }
      }
    }

    return { individualPoints, averagePoints };
  }, [measurements]);

  // LB regression line from fit parameters (if available)
  const lbLine = useMemo(() => {
    if (!fitResult?.success) return [];

    // For MM: 1/v = (Km/Vmax)(1/[S]) + 1/Vmax
    // slope = Km / Vmax, intercept = 1 / Vmax
    const maxInvS = Math.max(...lbData.averagePoints.map(d => d.invS), 1);
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
          {lbData.individualPoints.length > 0 && (
            <Scatter
              data={lbData.individualPoints}
              name="Individual replicates"
              fill="rgba(156, 163, 175, 0.5)"
              shape="circle"
              legendType="none"
            />
          )}
          <Scatter
            data={lbData.averagePoints}
            name="Data (Average or Single)"
            fill="var(--color-point)"
            shape="circle"
            legendType="circle"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
