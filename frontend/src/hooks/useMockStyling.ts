"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  MOCK_STYLING_DURATION_MS,
  type StylingPhase,
  type StylingState,
} from "@/types/styling";

const INITIAL_STATE: StylingState = {
  phase: "idle",
  progress: 0,
  error: null,
};

export interface UseMockStylingReturn extends StylingState {
  isLoading: boolean;
  startStyling: () => void;
  resetStyling: () => void;
}

export function useMockStyling(): UseMockStylingReturn {
  const [state, setState] = useState<StylingState>(INITIAL_STATE);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetStyling = useCallback(() => {
    clearTimers();
    setState(INITIAL_STATE);
  }, [clearTimers]);

  const startStyling = useCallback(() => {
    clearTimers();

    const startedAt = Date.now();
    setState({ phase: "loading", progress: 0, error: null });

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(
        100,
        Math.round((elapsed / MOCK_STYLING_DURATION_MS) * 100),
      );
      setState((prev) =>
        prev.phase === "loading" ? { ...prev, progress } : prev,
      );
    }, 50);

    timeoutRef.current = setTimeout(() => {
      clearTimers();
      setState({ phase: "result", progress: 100, error: null });
    }, MOCK_STYLING_DURATION_MS);
  }, [clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  const isLoading = state.phase === "loading";

  return {
    ...state,
    isLoading,
    startStyling,
    resetStyling,
  };
}

export function getStepLabel(phase: StylingPhase): string {
  switch (phase) {
    case "loading":
      return "Step 2";
    case "result":
      return "Step 3";
    default:
      return "Step 1";
  }
}
