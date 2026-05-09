// ============================================
// 🔐 КОД ДОСТУП ЖҮЙЕСІ (Cookie + LocalStorage)
// ============================================

const ACCESS_CODE = "NKT2026"; // Сіз өзгерте аласыз
const COOKIE_NAME = "nkt_access";
const AUTH_KEY = "nkt_auth";

// Cookie Utils
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

function setCookie(name: string, value: string, days: number) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Strict`;
}

export function isAuthenticated(): boolean {
  const cookie = getCookie(COOKIE_NAME);
  const local = localStorage.getItem(AUTH_KEY);
  return cookie === ACCESS_CODE || local === "true";
}

export function authenticateWithCode(code: string): boolean {
  if (code.trim() === ACCESS_CODE) {
    setCookie(COOKIE_NAME, ACCESS_CODE, 7); // 7 күн
    localStorage.setItem(AUTH_KEY, "true");
    return true;
  }
  return false;
}

export function clearAuth() {
  document.cookie = `${COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  localStorage.removeItem(AUTH_KEY);
}

// Eski storage.ts function compatibility
export function saveResult(result: any) {
  try {
    const key = "bio_results";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push(result);
    localStorage.setItem(key, JSON.stringify(existing));
  } catch {
    // ignore
  }
}

export function getResults(): any[] {
  try {
    return JSON.parse(localStorage.getItem("bio_results") || "[]");
  } catch {
    return [];
  }
}
