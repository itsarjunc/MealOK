import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthRoute = req.nextUrl.pathname.startsWith('/login');
  const isPublicRoute = req.nextUrl.pathname === '/today';
  
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/home', req.url));
    }
    return NextResponse.next();
  }

  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  if (!isLoggedIn && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // Basic RBAC for cook vs resident routes
  const role = req.auth?.user.role;
  if (req.nextUrl.pathname.startsWith('/cook') && role !== 'COOK' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/home', req.url));
  }
  
  // Since all resident routes are under /(resident) conceptually, we shouldn't block by URL directly unless they start with specific path.
  // We'll assume cook only goes to /cook
  if (req.nextUrl.pathname === '/home' && role === 'COOK') {
    return NextResponse.redirect(new URL('/cook', req.url));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|icon-).*)"],
};
