import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const secret = new TextEncoder().encode(JWT_SECRET);

// Routes publiques (sans authentification requise)
const publicRoutes = ["/login", "/register", "/api/auth/login", "/api/auth/register"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Autoriser l'accès aux routes publiques
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Vérifier le token dans les cookies
  const token = request.cookies.get("authToken")?.value;

  if (!token) {
    // Si pas de token et pas sur une route publique, rediriger vers le login
    if (!pathname.startsWith("/api")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Pour les routes API, retourner une erreur 401
    return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
    );
  }

  // Vérifier la validité du token (compatible Edge)
  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (error) {
    console.error("Token invalide:", error);

    if (!pathname.startsWith("/api")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.json(
        { error: "Token invalide" },
        { status: 401 }
    );
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
