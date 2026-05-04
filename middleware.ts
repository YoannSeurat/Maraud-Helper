import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const secret = new TextEncoder().encode(JWT_SECRET);

const publicRoutes = [
  "/login",
  "/register",
  "/mobile-only",
  "/api/auth/login",
  "/api/auth/register",
];

const alwaysAllowedApiRoutes = [
  "/api/me",
  "/api/auth/logout",
  "/api/mobile",
  "/api/maraudes",
];

const assetPrefixes = [
  "/assets",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

function isMobileRequest(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "";

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
  );
}

function isAdminFromPayload(value: unknown) {
  return value === true || value === "true" || value === 1 || value === "1";
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
      publicRoutes.some((route) => pathname.startsWith(route)) ||
      assetPrefixes.some((prefix) => pathname.startsWith(prefix))
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("authToken")?.value;

  if (!token) {
    if (!pathname.startsWith("/api")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
    );
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    const isAdmin = isAdminFromPayload(payload.isAdmin);
    const isMobile = isMobileRequest(request);

    const isAlwaysAllowedApi = alwaysAllowedApiRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (isMobile && !pathname.startsWith("/mobile") && !pathname.startsWith("/api")) {
      return NextResponse.redirect(new URL("/mobile", request.url));
    }

    if (!isAdmin && !isMobile) {
      if (pathname.startsWith("/api")) {
        if (isAlwaysAllowedApi) {
          return NextResponse.next();
        }

        return NextResponse.json(
            { error: "Accès administrateur requis sur ordinateur." },
            { status: 403 }
        );
      }

      return NextResponse.redirect(new URL("/mobile-only", request.url));
    }

    if (isAdmin && pathname === "/mobile-only") {
      return NextResponse.redirect(new URL("/tableau-de-bord", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Token invalide:", error);

    if (!pathname.startsWith("/api")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};