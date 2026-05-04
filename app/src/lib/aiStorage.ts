export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const CHAT_KEY = "bio_ai_chat";

export function getChatHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveChatMessage(msg: ChatMessage): void {
  const history = getChatHistory();
  history.push(msg);
  if (history.length > 100) history.splice(0, history.length - 100);
  localStorage.setItem(CHAT_KEY, JSON.stringify(history));
}

export function clearChatHistory(): void {
  localStorage.removeItem(CHAT_KEY);
}
