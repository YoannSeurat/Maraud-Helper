import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "../_utils";

const { prisma } = await import("@/lib/prisma");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                { error: "Authentification requise." },
                { status: 401 }
            );
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("[GET /api/mobile/profile]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération du profil." },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                { error: "Authentification requise." },
                { status: 401 }
            );
        }

        const body = await req.json();

        const data: {
            name?: string;
            mail?: string;
            password?: string;
            picture?: string | null;
        } = {};

        if (typeof body.name === "string" && body.name.trim() !== "") {
            data.name = body.name.trim();
        }

        if (typeof body.mail === "string" && body.mail.trim() !== "") {
            data.mail = body.mail.trim();
        }

        if (typeof body.password === "string" && body.password.trim() !== "") {
            if (body.password.length < 6) {
                return NextResponse.json(
                    { error: "Le mot de passe doit contenir au moins 6 caractères." },
                    { status: 400 }
                );
            }

            data.password = await hash(body.password, 10);
        }

        if ("picture" in body) {
            data.picture =
                typeof body.picture === "string" && body.picture.trim() !== ""
                    ? body.picture.trim()
                    : null;
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: user.id,
            },
            data,
            select: {
                id: true,
                name: true,
                mail: true,
                isAdmin: true,
                picture: true,
            },
        });

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error("[PATCH /api/mobile/profile]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la modification du profil." },
            { status: 500 }
        );
    }
}