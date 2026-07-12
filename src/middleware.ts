import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

// In-memory rate limiting map
// Tracks: key = IP, value = { count: number, resetTime: number }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const LIMIT_WINDOW_MS = 60 * 1000; // 1 Minute window
const MAX_REQUESTS = 100; // Max 100 requests per minute

export function middleware(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
  const now = Date.now();

  // 1. Rate Limiting Check (Only apply to API endpoints to prevent API abuse)
  if (request.nextUrl.pathname.startsWith('/api')) {
    const rateData = rateLimitMap.get(ip);
    
    if (!rateData) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + LIMIT_WINDOW_MS });
    } else {
      if (now > rateData.resetTime) {
        // Reset window
        rateLimitMap.set(ip, { count: 1, resetTime: now + LIMIT_WINDOW_MS });
      } else {
        rateData.count++;
        if (rateData.count > MAX_REQUESTS) {
          return new NextResponse(
            JSON.stringify({ error: 'Too Many Requests. API Rate limit exceeded. Try again in a minute.' }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': Math.ceil((rateData.resetTime - now) / 1000).toString(),
              },
            }
          );
        }
      }
    }
  }

  // 2. Gateway Router Check (Redirect to login if accessing dashboard without session)
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isOnboardingRoute = request.nextUrl.pathname.startsWith('/onboarding');
  const sessionToken = request.cookies.get('proventa_session')?.value;

  if ((isDashboardRoute || isOnboardingRoute) && !sessionToken) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Inject Security Headers
  const response = NextResponse.next();
  
  // Content Security Policy (CSP)
  // Allows self, fonts, styles, images and safe connections
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data:Blob:;
    connect-src 'self' https: wss:;
    frame-ancestors 'none';
    object-src 'none';
    base-uri 'self';
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY'); // Prevents Clickjacking
  response.headers.set('X-Content-Type-Options', 'nosniff'); // Prevents MIME Sniffing
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Enforce HSTS (Strict-Transport-Security) in production environments
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  
  // Cross-Origin policies
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');

  return response;
}

// Map path triggers
export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/api/:path*'],
};
