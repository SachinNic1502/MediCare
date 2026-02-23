import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicRoutes = ['/login', '/register', '/', '/doctors', '/services', '/contact'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the route is public
    const isPublicRoute = publicRoutes.some(route =>
        pathname === route || pathname.startsWith('/api/auth')
    );

    // Get token from header or cookie
    // Note: In this simple implementation, we check if user info exists in localStorage on the client
    // But for middleware, we should check cookies for SSR protection.
    const token = request.cookies.get('token')?.value;

    // 1. If trying to access protected route without token
    if (!token && !isPublicRoute && (pathname.startsWith('/admin') || pathname.startsWith('/patient'))) {
        const url = new URL('/login', request.url);
        url.searchParams.set('callbackUrl', encodeURI(pathname));
        return NextResponse.redirect(url);
    }

    // 2. Role-based protection
    // Note: Real middleware should decode the JWT here to check roles
    // For now, we allow the request but the API routes will have their own security

    return NextResponse.next();
}

// Specify which routes this middleware should run on
export const config = {
    matcher: [
        '/admin/:path*',
        '/patient/:path*',
        '/api/appointments/:path*',
        // Skip public files and api routes that don't need auth
        '/((?!_next/static|_next/image|favicon.ico|api/auth|api/doctors|services|contact|doctors).*)',
    ],
};
