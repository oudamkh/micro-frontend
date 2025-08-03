import Cookies from 'js-cookie';
import { JWTPayload, User } from '@/types/auth';

const TOKEN_KEY = 'auth_token';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const isTokenValid = (token: string): boolean => {
  const payload = decodeJWT(token);
  if (!payload) return false;
  
  const now = Date.now() / 1000;
  return payload.exp > now;
};

export const getStoredToken = (): string | null => {
  const token = Cookies.get(TOKEN_KEY);
  if (token && isTokenValid(token)) {
    return token;
  }
  
  if (token) {
    Cookies.remove(TOKEN_KEY);
  }
  
  return null;
};

export const setToken = (token: string): void => {
  Cookies.set(TOKEN_KEY, token, { 
    expires: 7,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
};

export const removeToken = (): void => {
  Cookies.remove(TOKEN_KEY);
};

export const getCurrentUser = (): User | null => {
  const token = getStoredToken();
  if (!token) return null;
  
  const payload = decodeJWT(token);
  if (!payload) return null;
  
  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    permissions: payload.permissions,
  };
};

export const login = async (email: string, password: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const { token } = await response.json();
  setToken(token);
  
  const user = getCurrentUser();
  if (!user) {
    throw new Error('Invalid token received');
  }
  
  return user;
};