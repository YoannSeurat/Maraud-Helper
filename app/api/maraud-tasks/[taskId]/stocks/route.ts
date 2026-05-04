import { NextRequest, NextResponse } from "next/server";

const { prisma } = await import("@/lib/prisma");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
    params:
        | {
        taskId: string;
    }
        | Promise<{
        taskId: string;
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

export async function POST(req: NextRequest, context: RouteContext) {
    try {
        const { taskId } = await getParams(context);
        const id = Number(taskId);

        if (!Number.isInteger(id)) {
            return NextResponse.json(
                { error: "Identifiant de tâche invalide." },
                { status: 400 }
            );
        }

        const body = await req.json();
        const stockItemId = Number(body.stockItemId);
        const quantity = Number(body.quantity);

        if (!Number.isInteger(stockItemId)) {
            return NextResponse.json(
                { error: "Stock sélectionné invalide." },
                { status: 400 }
            );
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return NextResponse.json(
                { error: "La quantité doit être supérieure à zéro." },
                { status: 400 }
            );
        }

        const task = await prisma.maraudTask.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                maraudId: true,
            },
        });

        if (!task) {
            return NextResponse.json(
                { error: "Tâche introuvable." },
                { status: 404 }
            );
        }

        const stock = await prisma.stockItem.findUnique({
            where: {
                id: stockItemId,
            },
        });

        if (!stock) {
            return NextResponse.json(
                { error: "Stock introuvable." },
                { status: 404 }
            );
        }

        if (quantity > stock.currentCount) {
            return NextResponse.json(
                {
                    error: `La quantité demandée dépasse le stock disponible (${stock.currentCount}).`,
                },
                { status: 400 }
            );
        }

        await prisma.maraudTaskStock.upsert({
            where: {
                maraudTaskId_stockItemId: {
                    maraudTaskId: id,
                    stockItemId,
                },
            },
            update: {
                quantity,
            },
            create: {
                maraudTaskId: id,
                stockItemId,
                quantity,
            },
        });

        const updatedMaraud = await prisma.maraud.findUnique({
            where: {
                id: task.maraudId,
            },
            include: maraudInclude,
        });

        return NextResponse.json(updatedMaraud, { status: 201 });
    } catch (error) {
        console.error("[POST /api/maraud-tasks/[taskId]/stocks]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de l'ajout du stock à la tâche." },
            { status: 500 }
        );
    }
}