// account-management-mfe/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl
  
  // Allow health check endpoint
  if (pathname === '/api/health') {
    return NextResponse.next()
  }
  
  // Allow access only from host shell (port 3000) or when embedded in iframe
  const referer = request.headers.get('referer')
  const xFrameOptions = request.headers.get('x-requested-with')
  
  // Check if request comes from host shell
  const isFromHostShell = referer?.includes('localhost:3000') || 
                         referer?.includes('your-host-domain.com')
  
  // Check if it's an iframe request (has parent)
  const isIframeRequest = request.headers.get('sec-fetch-dest') === 'iframe' ||
                         request.headers.get('sec-fetch-mode') === 'navigate'
  
  // Check for auth token passed from host shell
  const authToken = request.cookies.get('host_auth_token')?.value ||
                   request.headers.get('x-auth-token')
  
  // Redirect to host shell login if direct access
  if (!isFromHostShell && !authToken) {
    return NextResponse.redirect('http://localhost:3000/login?redirect=' + encodeURIComponent(pathname))
  }
  
  // Validate auth token if present
  if (authToken && !isValidAuthToken(authToken)) {
    return NextResponse.redirect('http://localhost:3000/login?error=invalid_token')
  }
  
  // Set security headers for iframe embedding
  const response = NextResponse.next()
  
  // Only allow embedding from host shell
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('Content-Security-Policy', 
    "frame-ancestors 'self' localhost:3000 your-host-domain.com")
  
  return response
}

function isValidAuthToken(token: string): boolean {
  try {
    // Implement your token validation logic here
    // This could be JWT verification, session validation, etc.
    const decoded = JSON.parse(atob(token.split('.')[1])) // JWT example
    return decoded.exp > Date.now() / 1000
  } catch {
    return false
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/health (health check)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/health|_next/static|_next/image|favicon.ico).*)',
  ],
}