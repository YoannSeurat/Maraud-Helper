import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");

    const token = req.cookies.get("authToken")?.value;

    if (token) {
      await prisma.user.updateMany({
        where: {
          token,
        },
        data: {
          token: null,
        },
      });
    }

    const response = NextResponse.json(
        { message: "Déconnexion réussie" },
        { status: 200 }
    );

    response.cookies.set("authToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Erreur logout:", error);

    return NextResponse.json(
        { error: "Erreur serveur" },
        { status: 500 }
    );
  }
}