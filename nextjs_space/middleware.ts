
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        if (req.nextUrl.pathname.startsWith('/auth/') || 
            req.nextUrl.pathname === '/' ||
            req.nextUrl.pathname.startsWith('/api/auth/') ||
            req.nextUrl.pathname.startsWith('/api/signup')) {
          return true
        }

        // Require admin role for admin routes
        if (req.nextUrl.pathname.startsWith('/admin/')) {
          return token?.role === 'ADMIN'
        }

        // Require authentication for protected routes
        if (req.nextUrl.pathname.startsWith('/organizer/')) {
          return token?.role === 'ORGANIZER'
        }
        
        if (req.nextUrl.pathname.startsWith('/goalkeeper/')) {
          return token?.role === 'GOALKEEPER'
        }

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
    '/dashboard/:path*'
  ]
}
