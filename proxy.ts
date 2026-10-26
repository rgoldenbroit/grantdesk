import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// Pages anyone can open without signing in.
const PUBLIC_PATHS = ["/login", "/proposal"];

export async function proxy(request: NextRequest) {
  // (Kept from the eve scaffold) keeps `vercel dev` on its own host.
  const routerHost = process.env.VERCEL_URL;
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (process.env.__VERCEL_DEV_RUNNING === "1" && routerHost && forwardedHost !== routerHost) {
    const target = request.nextUrl.clone();
    target.protocol = "http:";
    target.host = routerHost;
    return NextResponse.redirect(target);
  }

  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  // DECISION: the page guard and the agent's channel auth check the same signed cookie,
  // so a page and the agent can never disagree about who is signed in.
  const user = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}

export const config = {
  // Skip static assets and the agent's own routes (/eve/*), which do their own auth.
  matcher: ["/((?!_next/|eve/|\\.well-known/|favicon|icon|apple-icon).*)"],
};
