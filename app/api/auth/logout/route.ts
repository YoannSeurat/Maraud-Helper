import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json(
      { message: "Déconnexion réussie" },
      { status: 200 }
    );

    // Supprimer le cookie
    response.cookies.delete("authToken");

    return response;
  } catch (error) {
    console.error("Erreur logout:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
        {status: 500}
    );
  }
}

