
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // If user is authenticated but has no role, redirect to complete-registration
    if (token && !token.role && !pathname.startsWith('/auth/complete-registration') && !pathname.startsWith('/api/')) {
      const url = req.nextUrl.clone()
      url.pathname = '/auth/complete-registration'
      url.searchParams.set('email', (token.email as string) || '')
      return NextResponse.redirect(url)
    }

    // Require admin role for admin routes
    if (pathname.startsWith('/admin/') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    // Require organizer role for organizer routes
    if (pathname.startsWith('/organizer/') && token?.role !== 'ORGANIZER') {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    // Require goalkeeper role for goalkeeper routes
    if (pathname.startsWith('/goalkeeper/') && token?.role !== 'GOALKEEPER') {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        if (req.nextUrl.pathname.startsWith('/auth/') || 
            req.nextUrl.pathname === '/' ||
            req.nextUrl.pathname.startsWith('/api/auth/') ||
            req.nextUrl.pathname.startsWith('/api/signup') ||
            req.nextUrl.pathname.startsWith('/api/complete-google-registration') ||
            req.nextUrl.pathname.startsWith('/api/contact') ||
            req.nextUrl.pathname.startsWith('/api/beta/')) {
          return true
        }

        // Require authentication for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/organizer/:path*',
    '/goalkeeper/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
    '/auth/complete-registration'
  ]
}
