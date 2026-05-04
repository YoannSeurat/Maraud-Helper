import { NextRequest, NextResponse } from "next/server";

const { prisma } = await import("@/lib/prisma");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
    params:
        | {
        id: string;
    }
        | Promise<{
        id: string;
    }>;
};

async function getParams(context: RouteContext) {
    return await context.params;
}

function isPrismaNotFoundError(error: unknown) {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2025"
    );
}

export async function PATCH(req: NextRequest, context: RouteContext) {
    try {
        const { id } = await getParams(context);
        const userId = Number(id);

        if (!Number.isInteger(userId)) {
            return NextResponse.json(
                { error: "Identifiant utilisateur invalide." },
                { status: 400 }
            );
        }

        const body = await req.json();

        const data: {
            isAdmin?: boolean;
        } = {};

        if (typeof body.isAdmin === "boolean") {
            data.isAdmin = body.isAdmin;
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data,
            select: {
                id: true,
                name: true,
                mail: true,
                isAdmin: true,
                picture: true,
                marauds: {
                    select: {
                        id: true,
                    },
                },
                createdMarauds: {
                    select: {
                        id: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                id: updatedUser.id,
                name: updatedUser.name,
                mail: updatedUser.mail,
                isAdmin: updatedUser.isAdmin,
                picture: updatedUser.picture,
                inscriptionsCount: updatedUser.marauds.length,
                createdMaraudsCount: updatedUser.createdMarauds.length,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("[PATCH /api/members/[id]]", error);

        if (isPrismaNotFoundError(error)) {
            return NextResponse.json(
                { error: "Utilisateur introuvable." },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Erreur serveur lors de la modification du membre." },
            { status: 500 }
        );
    }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
    try {
        const { id } = await getParams(context);
        const userId = Number(id);

        if (!Number.isInteger(userId)) {
            return NextResponse.json(
                { error: "Identifiant utilisateur invalide." },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                createdMarauds: {
                    select: {
                        id: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Utilisateur introuvable." },
                { status: 404 }
            );
        }

        if (user.createdMarauds.length > 0) {
            return NextResponse.json(
                {
                    error:
                        "Cet utilisateur a créé une ou plusieurs maraudes. Il ne peut pas être supprimé.",
                },
                { status: 409 }
            );
        }

        await prisma.$transaction([
            prisma.maraudTaskUser.deleteMany({
                where: {
                    userId,
                },
            }),
            prisma.itemTaskUser.deleteMany({
                where: {
                    userId,
                },
            }),
            prisma.maraudInscription.deleteMany({
                where: {
                    userId,
                },
            }),
            prisma.user.delete({
                where: {
                    id: userId,
                },
            }),
        ]);

        return NextResponse.json(
            { message: "Utilisateur supprimé avec succès." },
            { status: 200 }
        );
    } catch (error) {
        console.error("[DELETE /api/members/[id]]", error);

        if (isPrismaNotFoundError(error)) {
            return NextResponse.json(
                { error: "Utilisateur introuvable." },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Erreur serveur lors de la suppression du membre." },
            { status: 500 }
        );
    }
}