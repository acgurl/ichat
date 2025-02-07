import type { ChatMessage } from '../types/chat';

export interface ChatSession {
  id: string;
  name: string;
  model: string;
  messages: ChatMessage[];
  created: number;
  lastUpdated: number;
}

const SESSION_STORAGE_KEY = 'chat_sessions';

class SessionManager {
  private sessions: Map<string, ChatSession>;

  constructor() {
    this.sessions = new Map();
    this.loadSessions();
  }

  private loadSessions() {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) {
      const sessions = JSON.parse(saved);
      Object.entries(sessions).forEach(([id, session]) => {
        this.sessions.set(id, session as ChatSession);
      });
    }
  }

  private saveSessions() {
    const sessions = Object.fromEntries(this.sessions.entries());
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
  }

  createSession(model: string): ChatSession {
    const session: ChatSession = {
      id: Date.now().toString(),
      name: '新对话',
      model,
      messages: [],
      created: Date.now(),
      lastUpdated: Date.now()
    };
    this.sessions.set(session.id, session);
    this.saveSessions();
    return session;
  }

  getSessions(): ChatSession[] {
    return Array.from(this.sessions.values());
  }

  saveSession(session: ChatSession) {
    this.sessions.set(session.id, session);
    this.saveSessions();
  }

  deleteSession(sessionId: string) {
    this.sessions.delete(sessionId);
    this.saveSessions();
  }
}

export const sessionManager = new SessionManager();
