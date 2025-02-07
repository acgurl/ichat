import type { ChatMessage } from '../types/chat';

export interface ChatSession {
  id: string;
  name: string;
  model: string;
  messages: ChatMessage[];
  created: number;
  lastUpdated: number;
  icon?: string;  // 新增：会话图标
  pinned?: boolean;  // 新增：置顶状态
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

  getSession(id: string): ChatSession | undefined {
    return this.sessions.get(id);
  }

  saveSession(session: ChatSession) {
    this.sessions.set(session.id, session);
    this.saveSessions();
  }

  deleteSession(sessionId: string) {
    this.sessions.delete(sessionId);
    this.saveSessions();
  }

  renameSession(id: string, newName: string) {
    const session = this.sessions.get(id);
    if (session) {
      session.name = newName;
      session.lastUpdated = Date.now();
      this.saveSessions();
    }
  }

  togglePinSession(id: string) {
    const session = this.sessions.get(id);
    if (session) {
      session.pinned = !session.pinned;
      this.saveSessions();
    }
  }

  getSortedSessions(): ChatSession[] {
    return Array.from(this.sessions.values()).sort((a, b) => {
      // 优先按置顶状态排序
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      // 然后按最后更新时间排序
      return b.lastUpdated - a.lastUpdated;
    });
  }
}

export const sessionManager = new SessionManager();
