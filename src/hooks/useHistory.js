import { useCallback, useState } from 'react';

/**
 * State with undo / redo. `set(next, { record:false })` updates the present
 * without creating a history entry (used while a vertex is being dragged);
 * `commit(prevSnapshot)` then records the whole drag as one step.
 */
export function useHistory(initial) {
  const [state, setState] = useState({ past: [], present: initial, future: [] });

  const set = useCallback((next, { record = true } = {}) => {
    setState((s) => {
      const value = typeof next === 'function' ? next(s.present) : next;
      if (!record) return { ...s, present: value };
      return { past: [...s.past, s.present].slice(-200), present: value, future: [] };
    });
  }, []);

  /** Record `before` as a history entry while keeping the current present. */
  const commit = useCallback((before) => {
    setState((s) => (before === s.present ? s : { past: [...s.past, before].slice(-200), present: s.present, future: [] }));
  }, []);

  const undo = useCallback(() => {
    setState((s) => (s.past.length
      ? { past: s.past.slice(0, -1), present: s.past[s.past.length - 1], future: [s.present, ...s.future] }
      : s));
  }, []);

  const redo = useCallback(() => {
    setState((s) => (s.future.length
      ? { past: [...s.past, s.present], present: s.future[0], future: s.future.slice(1) }
      : s));
  }, []);

  return {
    value: state.present,
    set,
    commit,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
