import { NextResponse, type NextRequest } from "next/server";

const ACCESS_TOKEN_COOKIE_NAME = "tc_access_token";

function isPublicPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")
  );
}

function isProtectedPath(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/settings")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname) || !isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value ?? "";
  if (!accessToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin")) {
    const roleUrl = new URL("/api/auth/role", request.url);
    const roleRes = await fetch(roleUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!roleRes.ok) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    const data = (await roleRes.json().catch(() => null)) as
      | { role?: string }
      | null;
    if (data?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/checkin/:path*",
    "/dashboard/:path*",
    "/settings/:path*",
  ],
};

