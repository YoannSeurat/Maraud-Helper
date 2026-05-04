import { NextResponse } from "next/server";

const { prisma } = await import("@/lib/prisma");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
    params:
        | {
        stockUsageId: string;
    }
        | Promise<{
        stockUsageId: string;
    }>;
};

const maraudInclude = {
    author: {
        select: {
            id: true,
            name: true,
            mail: true,
            picture: true,
            isAdmin: true,
        },
    },
    inscriptions: {
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    mail: true,
                    picture: true,
                    isAdmin: true,
                },
            },
        },
    },
    stops: {
        orderBy: {
            order: "asc",
        },
    },
    tasks: {
        orderBy: {
            startTime: "asc",
        },
        include: {
            contributors: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            mail: true,
                            picture: true,
                            isAdmin: true,
                        },
                    },
                },
            },
            stockUsages: {
                include: {
                    stockItem: true,
                },
            },
        },
    },
};

async function getParams(context: RouteContext) {
    return await context.params;
}

export async function DELETE(_req: Request, context: RouteContext) {
    try {
        const { stockUsageId } = await getParams(context);
        const id = Number(stockUsageId);

        if (!Number.isInteger(id)) {
            return NextResponse.json(
                { error: "Identifiant d'étape invalide." },
                { status: 400 }
            );
        }

        const stockUsage = await prisma.maraudTaskStock.findUnique({
            where: {
                id,
            },
            include: {
                task: {
                    select: {
                        maraudId: true,
                    },
                },
            },
        });

        if (!stockUsage) {
            return NextResponse.json(
                { error: "Étape de stock introuvable." },
                { status: 404 }
            );
        }

        await prisma.maraudTaskStock.delete({
            where: {
                id,
            },
        });

        const updatedMaraud = await prisma.maraud.findUnique({
            where: {
                id: stockUsage.task.maraudId,
            },
            include: maraudInclude,
        });

        return NextResponse.json(updatedMaraud, { status: 200 });
    } catch (error) {
        console.error("[DELETE /api/maraud-task-stocks/[stockUsageId]]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la suppression de l'étape." },
            { status: 500 }
        );
    }
}