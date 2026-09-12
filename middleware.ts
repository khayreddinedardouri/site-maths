import { NextRequest, NextResponse } from "next/server";

const DEFAULT_ALLOWED_IPS = ["127.0.0.1", "::1"];

function getAllowedIps() {
  const raw = process.env.ALLOWED_IPS || "";

  return raw
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean)
    .concat(DEFAULT_ALLOWED_IPS);
}

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  return "127.0.0.1";
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/tableau-de-bord" || pathname.startsWith("/tableau-de-bord/")) {
    const allowedIps = getAllowedIps();
    const clientIp = getClientIp(request);

    if (!allowedIps.includes(clientIp)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tableau-de-bord/:path*", "/tableau-de-bord"],
};
