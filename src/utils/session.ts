import type { ChatMessage } from '../types/chat';

interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  model: string;
  lastUpdated: number;
}

const SESSION_KEY = 'chat_sessions';

export const sessionManager = {
  getSessions(): ChatSession[] {
    const sessions = localStorage.getItem(SESSION_KEY);
    return sessions ? JSON.parse(sessions) : [];
  },

  saveSession(session: ChatSession) {
    const sessions = this.getSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessions));
  },

  deleteSession(sessionId: string) {
    const sessions = this.getSessions().filter(s => s.id !== sessionId);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessions));
  },

  createSession(model: string): ChatSession {
    return {
      id: Date.now().toString(),
      name: `对话 ${new Date().toLocaleString()}`,
      messages: [],
      model,
      lastUpdated: Date.now()
    };
  }
};
