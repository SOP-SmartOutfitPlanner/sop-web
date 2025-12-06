import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper to decode JWT without verification (for middleware use only)
function decodeJWT(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect community routes - require authentication
  if (pathname.startsWith("/community") || pathname.startsWith("/wardrobe")) {
    const accessToken = request.cookies.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check if user is first-time user (needs onboarding)
    // First-time users should only access wardrobe page
    const isFirstTime = request.cookies.get("isFirstTime")?.value === "true";

    if (isFirstTime && !pathname.startsWith("/wardrobe")) {
      return NextResponse.redirect(new URL("/wardrobe", request.url));
    }
  }

  // Protect admin routes
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    // Get access token from localStorage (stored in cookies for server-side access)
    const accessToken = request.cookies.get("accessToken")?.value;

    // If no token, redirect to login
    if (!accessToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Decode token to check role
    const payload = decodeJWT(accessToken);
    
    if (!payload) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Extract role from JWT
    const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    // Check if user has admin role
    if (role !== "ADMIN" && role !== "SuperAdmin") {
      // Not an admin - redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // If already logged in as admin, don't allow access to admin login page
  if (pathname === "/admin/login") {
    const accessToken = request.cookies.get("accessToken")?.value;
    
    if (accessToken) {
      const payload = decodeJWT(accessToken);
      const role = payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      
      if (role === "ADMIN" || role === "SuperAdmin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    "/admin/:path*",
    "/community/:path*",
    "/wardrobe/:path*",
  ],
};

