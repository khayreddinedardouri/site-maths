import { NextRequest, NextResponse } from "next/server";

const DEFAULT_ALLOWED_IPS = ["127.0.0.1", "::1", "::ffff:127.0.0.1"];

function normalizeIp(ip: string | null | undefined) {
  if (!ip) return "";

  const clean = ip.trim().toLowerCase().replace(/\[|\]/g, "");

  if (clean.startsWith("::ffff:")) {
    return clean.replace("::ffff:", "");
  }

  return clean;
}

function getAllowedIps() {
  const raw = process.env.ALLOWED_IPS || "";

  return Array.from(
    new Set(
      raw
        .split(",")
        .map((ip) => normalizeIp(ip))
        .filter(Boolean)
        .concat(DEFAULT_ALLOWED_IPS.map(normalizeIp))
    )
  );
}

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return normalizeIp(forwarded.split(",")[0]);
  }

  if (realIp) {
    return normalizeIp(realIp);
  }

  return "127.0.0.1";
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/tableau-de-bord" || pathname.startsWith("/tableau-de-bord/")) {
    const allowedIps = getAllowedIps();
    const clientIp = getClientIp(request);
    const hostname = request.nextUrl.hostname.toLowerCase();

    const isLocalHost = ["localhost", "127.0.0.1", "::1", "::ffff:127.0.0.1", "0.0.0.0"].includes(hostname);
    const isPrivateLocalHost =
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.");

    if (!allowedIps.includes(clientIp) && !isLocalHost && !isPrivateLocalHost) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tableau-de-bord/:path*", "/tableau-de-bord"],
};
