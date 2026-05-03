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

export interface UserProfile {
  name: string;
  email: string;
  joinedAt: string;
  totalTestsTaken: number;
  averageScore: number;
  bestScore: number;
  streakDays: number;
}

const STORAGE_KEY = "bio_test_results";
const PROFILE_KEY = "bio_profile";
const AUTH_KEY = "bio_auth_token";

export function getResults(): TestResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveResult(result: TestResult): void {
  const results = getResults();
  results.unshift(result);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}

export function clearResults(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {
    name: "Қолданушы",
    email: "",
    joinedAt: new Date().toISOString(),
    totalTestsTaken: 0,
    averageScore: 0,
    bestScore: 0,
    streakDays: 0,
  };
}

export function updateProfile(profile: Partial<UserProfile>): void {
  const current = getProfile();
  const updated = { ...current, ...profile };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
}

export function getAuthToken(): string | null {
  return sessionStorage.getItem(AUTH_KEY);
}

export function setAuthToken(token: string): void {
  sessionStorage.setItem(AUTH_KEY, token);
}

export function clearAuth(): void {
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem("bio_auth");
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
