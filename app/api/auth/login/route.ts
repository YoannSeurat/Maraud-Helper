import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { username, password } = await req.json();

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username et password requis" },
        { status: 400 }
      );
    }

    // Chercher l'utilisateur par email (on utilise mail comme identifiant)
    const user = await prisma.user.findUnique({
      where: { mail: username },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    // Comparer les mots de passe
    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    // Générer le token JWT
    const token = sign(
      {
        userId: user.id,
        mail: user.mail,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Sauvegarder le token dans la base de données
    await prisma.user.update({
      where: { id: user.id },
      data: { token },
    });

    // Créer la réponse avec le token en cookie
    const response = NextResponse.json(
      { message: "Connexion réussie", user: { id: user.id, name: user.name, mail: user.mail } },
      { status: 200 }
    );

    // Ajouter le token en cookie (httpOnly, Secure)
    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 jours
    });

    return response;
  } catch (error) {
    console.error("Erreur login:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}


