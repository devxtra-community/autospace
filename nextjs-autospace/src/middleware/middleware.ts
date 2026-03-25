import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken");

  const protectedRoutes = [
    "/admin",
    "/booking",
    "/company",
    "/valet",
    "/garage",
  ];

  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route),
  );

  //  Not logged in → block access
  if (isProtected && !accessToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/booking/:path*",
    "/company/:path*",
    "/valet/:path*",
    "/garage/:path",
  ],
};
