// 'use client';

// import React, { createContext, useContext, useEffect, useState } from 'react';
// import jwt from 'jsonwebtoken';
// import Cookies from 'js-cookie';

// interface User {
//   id: string;
//   email: string;
//   name: string;
//   permissions: string[];
//   role: string;
// }

// interface AuthContextType {
//   user: User | null;
//   isAuthenticated: boolean;
//   login: (email: string, password: string) => Promise<boolean>;
//   logout: () => void;
//   token: string | null;
//   hasPermission: (permission: string) => boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const MOCK_USERS = [
//   {
//     id: '1',
//     email: 'admin@example.com',
//     password: 'admin123',
//     name: 'Admin User',
//     role: 'admin',
//     permissions: ['users.read', 'users.write', 'users.delete', 'dashboard.read', 'settings.write']
//   },
//   {
//     id: '2', 
//     email: 'user@example.com',
//     password: 'user123',
//     name: 'Regular User',
//     role: 'user',
//     permissions: ['users.read', 'dashboard.read']
//   }
// ];

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     // Check for existing token on mount
//     const savedToken = Cookies.get('auth_token');
//     if (savedToken) {
//       try {
//         const decoded = jwt.decode(savedToken) as any;
//         if (decoded && decoded.exp > Date.now() / 1000) {
//           setToken(savedToken);
//           setUser({
//             id: decoded.id,
//             email: decoded.email,
//             name: decoded.name,
//             permissions: decoded.permissions,
//             role: decoded.role
//           });
//         } else {
//           Cookies.remove('auth_token');
//         }
//       } catch (error) {
//         console.error('Invalid token:', error);
//         Cookies.remove('auth_token');
//       }
//     }
//     setIsLoading(false);
//   }, []);

//   const login = async (email: string, password: string): Promise<boolean> => {
//     try {
//       // Mock authentication - replace with real API call
//       console.log('mcok: ', email, password);
//       const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password);
      
//       if (!mockUser) {
//         return false;
//       }

//       // Create JWT token (in production, this should be done by your backend)
//       const tokenPayload = {
//         id: mockUser.id,
//         email: mockUser.email,
//         name: mockUser.name,
//         role: mockUser.role,
//         permissions: mockUser.permissions,
//         exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
//       };

//       // In production, use a proper secret from environment variables
//       const newToken = jwt.sign(tokenPayload, 'your-secret-key');
      
//       setToken(newToken);
//       setUser({
//         id: mockUser.id,
//         email: mockUser.email,
//         name: mockUser.name,
//         permissions: mockUser.permissions,
//         role: mockUser.role
//       });

//       // Store token in cookie
//       Cookies.set('auth_token', newToken, { expires: 1 }); // 1 day

//       return true;
//     } catch (error) {
//       console.error('Login error:', error);
//       return false;
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     Cookies.remove('auth_token');
//   };

//   const hasPermission = (permission: string): boolean => {
//     return user?.permissions.includes(permission) || false;
//   };

//   const value: AuthContextType = {
//     user,
//     isAuthenticated: !!user,
//     login,
//     logout,
//     token,
//     hasPermission
//   };

//   if (isLoading) {
//     return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
//   }

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/types/auth';

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  authToken: string | null
  isAuthenticated: boolean
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing auth token on mount
    const token = localStorage.getItem('auth_token')
    if (token) {
      validateAndSetAuth(token)
    } else {
      setIsLoading(false)
    }
  }, [])

  const validateAndSetAuth = async (token: string) => {
    try {
      const response = await fetch('/api/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user);
        setAuthToken(token);
        
        // Set cookie for MFE access
        document.cookie = `host_auth_token=${token}; path=/; secure; samesite=strict`
      } else {
        localStorage.removeItem('auth_token')
        document.cookie = 'host_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      }
    } catch (error) {
      console.error('Auth validation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const {token, user} = await response.json();
        setAuthToken(token);
        setUser(user);
        localStorage.setItem('auth_token', token)
        // Set cookie for MFE access
        document.cookie = `host_auth_token=${token}; path=/; secure; samesite=strict`
        
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setAuthToken(null)
    localStorage.removeItem('auth_token')
    document.cookie = 'host_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    router.push('/login')
  }

  const hasPermission = (permission: string): boolean => {
    console.log('user: ', user, permission);
    return user?.permissions.includes(permission) || false;
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, authToken, isAuthenticated, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}