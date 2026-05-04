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

const mobileAllowedApiRoutes = [
  "/api/mobile",
  "/api/me",
  "/api/auth/logout",
];

const assetPrefixes = [
  "/assets",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/socket.io",
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

function isPublicRoute(pathname: string) {
  return publicRoutes.some((route) => pathname.startsWith(route));
}

function isAssetRoute(pathname: string) {
  return assetPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function isMobileAllowedApi(pathname: string) {
  return mobileAllowedApiRoutes.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api");
  const isMobile = isMobileRequest(request);

  if (isPublicRoute(pathname) || isAssetRoute(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("authToken")?.value;

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json(
          { error: "Authentification requise." },
          { status: 401 }
      );
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const isAdmin = isAdminFromPayload(payload.isAdmin);

    /**
     * MOBILE
     * Tous les utilisateurs connectés, admin ou membre, doivent aller vers l'interface mobile.
     * On bloque les API de gestion desktop sur mobile.
     */
    if (isMobile) {
      if (isApiRoute) {
        if (isMobileAllowedApi(pathname)) {
          return NextResponse.next();
        }

        return NextResponse.json(
            { error: "Cette route API est réservée à l'interface de gestion desktop." },
            { status: 403 }
        );
      }

      if (!pathname.startsWith("/mobile")) {
        return NextResponse.redirect(new URL("/mobile", request.url));
      }

      return NextResponse.next();
    }

    /**
     * DESKTOP
     * Toutes les routes de gestion desktop et toutes les API de gestion sont réservées aux admins.
     */
    if (!isAdmin) {
      if (isApiRoute) {
        return NextResponse.json(
            { error: "Accès administrateur requis." },
            { status: 403 }
        );
      }

      if (pathname !== "/mobile-only") {
        return NextResponse.redirect(new URL("/mobile-only", request.url));
      }

      return NextResponse.next();
    }

    /**
     * ADMIN DESKTOP
     * Accès complet au site de gestion et aux APIs.
     */
    if (pathname.startsWith("/mobile")) {
      return NextResponse.redirect(new URL("/tableau-de-bord", request.url));
    }

    if (pathname === "/mobile-only") {
      return NextResponse.redirect(new URL("/tableau-de-bord", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Token invalide:", error);

    if (isApiRoute) {
      return NextResponse.json(
          { error: "Token invalide." },
          { status: 401 }
      );
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};