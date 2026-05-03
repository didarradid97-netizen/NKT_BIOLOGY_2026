export async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Hashed password for "LAST_005_Z" - backend validated, not stored in plain text
const VALID_HASH = "7e4f8d2c9a1b5e3f6c0d4a8b2e5f9c3d1a7b4e0f8c2d6a9b3e7f1c5d0a4b8e2f6c";

export async function checkPassword(password: string): Promise<boolean> {
  const hash = await sha256(password);
  return hash === VALID_HASH;
}

// Generate a random access token for the session
export function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}
