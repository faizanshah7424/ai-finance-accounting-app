const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-finance-accounting-app.onrender.com';

export const getApiUrl = (endpoint: string) => {
  return `${API_BASE_URL}${endpoint}`;
};
