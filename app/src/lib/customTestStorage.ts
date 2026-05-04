export interface CustomQuestion {
  id: string;
  text: string;
  image?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface CustomTest {
  id: string;
  title: string;
  description: string;
  category: string;
  timeLimit: number;
  questions: CustomQuestion[];
  createdAt: string;
  updatedAt: string;
}

const CUSTOM_TESTS_KEY = "bio_custom_tests";

export function getCustomTests(): CustomTest[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TESTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getCustomTestById(id: string): CustomTest | undefined {
  return getCustomTests().find((t) => t.id === id);
}

export function saveCustomTest(test: CustomTest): void {
  const tests = getCustomTests().filter((t) => t.id !== test.id);
  tests.unshift(test);
  localStorage.setItem(CUSTOM_TESTS_KEY, JSON.stringify(tests));
}

export function deleteCustomTest(id: string): void {
  const tests = getCustomTests().filter((t) => t.id !== id);
  localStorage.setItem(CUSTOM_TESTS_KEY, JSON.stringify(tests));
}

export function importCustomTests(tests: CustomTest[]): void {
  const existing = getCustomTests();
  const merged = [...tests, ...existing];
  localStorage.setItem(CUSTOM_TESTS_KEY, JSON.stringify(merged));
}

export function exportCustomTests(): CustomTest[] {
  return getCustomTests();
}
