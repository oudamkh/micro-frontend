export interface User {
  id: string
  email: string
  name: string
  role: string
  permissions: string[]
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
    role: string;
  permissions: string[];
  exp: number;
  iat: number;
}