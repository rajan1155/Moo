import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow these paths always
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Only gate home route
  if (pathname === "/") {
    const cookie = request.cookies.get("puzzle_unlocked")?.value;

    if (cookie !== "true") {
      const res = NextResponse.redirect(new URL("/puzzle", request.url));
      res.headers.set("x-gate", "checked");
      res.headers.set("x-path", pathname);
      res.headers.set("x-cookie", cookie ? "present" : "missing");
      return res;
    }
  }

  // Handle puzzle page when already unlocked
  if (pathname.startsWith("/puzzle")) {
    const cookie = request.cookies.get("puzzle_unlocked")?.value;
    if (cookie === "true") {
      const res = NextResponse.redirect(new URL("/", request.url));
      res.headers.set("x-gate", "checked");
      res.headers.set("x-path", pathname);
      res.headers.set("x-cookie", cookie ? "present" : "missing");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
