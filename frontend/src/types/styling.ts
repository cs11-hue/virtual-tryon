export type StylingPhase = "idle" | "loading" | "result";

export interface StylingState {
  phase: StylingPhase;
  progress: number;
  error: string | null;
}

export const MOCK_STYLING_DURATION_MS = 3000;

export const STYLING_LOADING_MESSAGE =
  "AI가 체형을 분석하고 옷을 매칭 중입니다...";
