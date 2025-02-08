const API_KEY_STORAGE_KEY = 'chat_api_key';
const API_URL_STORAGE_KEY = 'chat_api_url';
const HIGHLIGHT_STYLE_STORAGE_KEY = 'highlight_style';

const storage = {
  getApiKey: () => {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || import.meta.env.VITE_API_KEY;
  },

  setApiKey: (apiKey: string) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
  },

  removeApiKey: () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  },

  getApiUrl: () => {
    return localStorage.getItem(API_URL_STORAGE_KEY) || import.meta.env.VITE_API_BASE_URL;
  },

  setApiUrl: (url: string) => {
    localStorage.setItem(API_URL_STORAGE_KEY, url);
  },

  removeApiUrl: () => {
    localStorage.removeItem(API_URL_STORAGE_KEY);
  },

  getHighlightStyle: () => {
    return localStorage.getItem(HIGHLIGHT_STYLE_STORAGE_KEY) || 'github-dark';
  },

  setHighlightStyle: (style: string) => {
    localStorage.setItem(HIGHLIGHT_STYLE_STORAGE_KEY, style);
  }
};

export default storage;
