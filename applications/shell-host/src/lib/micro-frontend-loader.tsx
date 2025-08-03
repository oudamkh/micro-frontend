// host-shell/lib/micro-frontend-loader.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useRef, useState } from 'react'

interface MFEConfig {
  name: string
  host: string
  fallbackComponent?: React.ComponentType
}

interface MicroFrontendLoaderProps {
  config: MFEConfig
  fallback?: React.ReactNode
  className?: string
  onLoad?: () => void;
  onError?: (error: any) => void;
}

export function MicroFrontendLoader({ config, fallback, onLoad, onError, className }: MicroFrontendLoaderProps) {
  const { authToken, user } = useAuth()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isHealthy, setIsHealthy] = useState(false)

  // Check MFE health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`/mfe/account-management/api/health`, {
          method: 'GET',
          headers: {
            'x-auth-token': authToken || '',
          }
        })
        console.log('re: ', response);
        setIsHealthy(response.ok);
        setIsLoading(false);
      } catch {
        setIsHealthy(false)
      }
    }

    if (authToken) {
      checkHealth()
    }
  }, [config.host, authToken])

  // Setup iframe communication
  useEffect(() => {
    if (!authToken || !isHealthy) return

    const iframe = iframeRef.current
    if (!iframe) return

    const handleLoad = () => {
      setIsLoading(false)
      
      // Send auth context to MFE
      iframe.contentWindow?.postMessage({
        type: 'AUTH_CONTEXT',
        payload: {
          user,
          token: authToken
        }
      }, config.host)
    }

    const handleError = () => {
      setIsLoading(false)
      setHasError(true)
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== new URL(config.host).origin) return
      
      if (event.data.type === 'MFE_READY') {
        // MFE is ready, send auth context again
        iframe.contentWindow?.postMessage({
          type: 'AUTH_CONTEXT',
          payload: {
            user,
            token: authToken
          }
        }, config.host)
      }
      
      if (event.data.type === 'MFE_ERROR') {
        setHasError(true)
      }
      
      if (event.data.type === 'NAVIGATE') {
        // Handle navigation requests from MFE
        window.location.href = event.data.url
      }
    }

    iframe.addEventListener('load', handleLoad)
    iframe.addEventListener('error', handleError)
    window.addEventListener('message', handleMessage)

    return () => {
      iframe.removeEventListener('load', handleLoad)
      iframe.removeEventListener('error', handleError)
      window.removeEventListener('message', handleMessage)
    }
  }, [config.host, authToken, user, isHealthy])

  // Don't render if not authenticated
  if (!authToken || !user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please log in to access this feature.</p>
        </div>
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading {config.name}...</span>
      </div>
    )
  }

  // Show error state
  if (hasError || !isHealthy) {
    const FallbackComponent = config.fallbackComponent
    
    if (FallbackComponent) {
      return <FallbackComponent />
    }
    
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-red-600">
            {config.name} Unavailable
          </h3>
          <p className="text-gray-600 mb-4">
            The service is currently unavailable. Please try again later.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Render authenticated iframe
  return (
    <iframe
      ref={iframeRef}
      src={`${config.host}?token=${encodeURIComponent(authToken)}`}
      className={`w-full h-full border-0 ${className || ''}`}
      title={config.name}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      allow="clipboard-read; clipboard-write"
    />
  )
}

// HOC for protecting MFE routes
export function withMFEAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function AuthenticatedMFE(props: P) {
    const { user, isLoading } = useAuth()
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )
    }
    
    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
            <p className="text-gray-600">Please log in to access this page.</p>
          </div>
        </div>
      )
    }
    
    return <WrappedComponent {...props} />
  }
}