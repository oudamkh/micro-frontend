// host-shell/lib/auth-context.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  authToken: string | null
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
        setUser(userData.user)
        setAuthToken(token)
        
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
        const { user: userData, token } = await response.json()
        setUser(userData)
        setAuthToken(token)
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

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, authToken }}>
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