// ============================================
// 💾 Storage + 🔐 Auth (Re-export from auth.ts)
// ============================================
export { isAuthenticated, clearAuth, authenticateWithCode, saveResult, getResults } from "./auth";

// Тест нәтижелерін сақтау
export interface TestResult {
  testId: string;
  title: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: string;
  answers: { questionIndex: number; selected: number; correct: number }[];
}

export function saveResult(result: TestResult) {
  try {
    const existing: TestResult[] = JSON.parse(localStorage.getItem("bio_results") || "[]");
    existing.push(result);
    localStorage.setItem("bio_results", JSON.stringify(existing));
  } catch {
    // ignore
  }
}

export function getResults(): TestResult[] {
  try {
    return JSON.parse(localStorage.getItem("bio_results") || "[]");
  } catch {
    return [];
  }
}

export function deleteResult(index: number) {
  try {
    const results = getResults();
    results.splice(index, 1);
    localStorage.setItem("bio_results", JSON.stringify(results));
  } catch {
    // ignore
  }
}
