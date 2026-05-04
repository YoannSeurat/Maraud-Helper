import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
          { error: "Username et password requis" },
          { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        mail: username,
      },
    });

    if (!user) {
      return NextResponse.json(
          { error: "Identifiants invalides" },
          { status: 401 }
      );
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
          { error: "Identifiants invalides" },
          { status: 401 }
      );
    }

    const isAdmin = Boolean(user.isAdmin);

    const token = sign(
        {
          userId: user.id,
          mail: user.mail,
          name: user.name,
          isAdmin,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        token,
      },
    });

    const response = NextResponse.json(
        {
          message: "Connexion réussie",
          user: {
            id: user.id,
            name: user.name,
            mail: user.mail,
            isAdmin,
            picture: user.picture,
          },
        },
        { status: 200 }
    );

    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
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