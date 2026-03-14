import { useState, useCallback, useRef } from 'react';
import type { EnzymeSubstrateEntry, Measurement, FitResult, SessionState } from '../types/enzyme';
import { generateSessionId } from '../utils/session';
import { simulateMeasurement } from '../engine/noise';
import { fitKinetics } from '../engine/fitting';
import { loadDatabase } from '../data/database';

const db = loadDatabase();

function getRandomEntry(): EnzymeSubstrateEntry {
  const randomIndex = Math.floor(Math.random() * db.length);
  return db[randomIndex];
}

export function useSession() {
  const [state, setState] = useState<SessionState>(() => ({
    sessionId: generateSessionId(),
    entry: getRandomEntry(), // Changed to pick a random entry
    measurements: [],
    fitResult: null,
  }));

  // Track replicate counts per [S]
  const replicateCountRef = useRef<Map<number, number>>(new Map());
  const measurementCounter = useRef(0);

  const selectEntry = useCallback((id: string) => {
    const entry = db.find(e => e.id === id) ?? null; // Changed to use db
    replicateCountRef.current = new Map();
    measurementCounter.current = 0;
    setState({
      sessionId: generateSessionId(),
      entry,
      measurements: [],
      fitResult: null,
    });
  }, []); // Removed [entries] dependency as db is now global

  const runExperiment = useCallback((substrate: number) => {
    setState(prev => {
      if (!prev.entry) return prev;

      const { rate, warning } = simulateMeasurement(prev.entry, substrate);
      const replicates = replicateCountRef.current;
      const repCount = (replicates.get(substrate) ?? 0) + 1;
      replicates.set(substrate, repCount);
      measurementCounter.current += 1;

      const measurement: Measurement = {
        index: measurementCounter.current,
        substrate,
        rate,
        replicate: repCount,
        warning,
      };

      return {
        ...prev,
        measurements: [...prev.measurements, measurement],
        // Clear fit when new data is added (user must re-fit manually)
      };
    });
  }, []);

  const deleteMeasurement = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      measurements: prev.measurements.filter(m => m.index !== index),
      fitResult: null, // invalidate fit
    }));
  }, []);

  const performFit = useCallback(() => {
    setState(prev => {
      if (!prev.entry || prev.measurements.length < 2) return prev;
      const result: FitResult = fitKinetics(prev.measurements, prev.entry.modelType);
      return { ...prev, fitResult: result };
    });
  }, []);

  const resetExperiment = useCallback(() => {
    setState(prev => ({
      sessionId: prev.sessionId, // keep same session
      entry: prev.entry,
      measurements: [],
      fitResult: null,
    }));
    replicateCountRef.current = new Map();
    measurementCounter.current = 0;
  }, []);

  const newExperiment = useCallback(() => {
    replicateCountRef.current = new Map();
    measurementCounter.current = 0;
    setState({
      sessionId: generateSessionId(),
      entry: getRandomEntry(),
      measurements: [],
      fitResult: null,
    });
  }, []);

  return {
    state,
    selectEntry,
    runExperiment,
    deleteMeasurement,
    performFit,
    resetExperiment,
    newExperiment,
  };
}
