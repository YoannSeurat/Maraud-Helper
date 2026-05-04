import { NextRequest, NextResponse } from "next/server";

const { prisma } = await import("@/lib/prisma");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const userSelect = {
    id: true,
    name: true,
    mail: true,
    isAdmin: true,
    picture: true,
};

async function getUserFromRequest(req: NextRequest) {
    const token = req.cookies.get("authToken")?.value;

    if (!token) return null;

    return prisma.user.findUnique({
        where: {
            token,
        },
        select: userSelect,
    });
}

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                { error: "Utilisateur introuvable." },
                { status: 404 }
            );
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("[GET /api/me]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération de l'utilisateur." },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                { error: "Utilisateur introuvable." },
                { status: 404 }
            );
        }

        const body = await req.json();

        const data: {
            name?: string;
            mail?: string;
            picture?: string | null;
        } = {};

        if (typeof body.name === "string") {
            const name = body.name.trim();

            if (!name) {
                return NextResponse.json(
                    { error: "Le nom est obligatoire." },
                    { status: 400 }
                );
            }

            data.name = name;
        }

        if (typeof body.mail === "string") {
            const mail = body.mail.trim();

            if (!mail) {
                return NextResponse.json(
                    { error: "L'adresse email est obligatoire." },
                    { status: 400 }
                );
            }

            data.mail = mail;
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
            select: userSelect,
        });

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error("[PATCH /api/me]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la modification de l'utilisateur." },
            { status: 500 }
        );
    }
}