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

const stockInclude = {
    taskUsages: {
        where: {
            task: {
                maraud: {
                    isFinished: false,
                },
            },
        },
        include: {
            task: {
                select: {
                    id: true,
                    name: true,
                    maraudId: true,
                    maraud: {
                        select: {
                            id: true,
                            name: true,
                            date: true,
                            endDate: true,
                            isFinished: true,
                            stocksDeducted: true,
                        },
                    },
                },
            },
        },
    },
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

export async function GET(_req: NextRequest, context: RouteContext) {
    try {
        const { id } = await getParams(context);
        const stockId = Number(id);

        if (!Number.isInteger(stockId)) {
            return NextResponse.json(
                { error: "Identifiant de ressource invalide." },
                { status: 400 }
            );
        }

        const stock = await prisma.stockItem.findUnique({
            where: {
                id: stockId,
            },
            include: stockInclude,
        });

        if (!stock) {
            return NextResponse.json(
                { error: "Ressource introuvable." },
                { status: 404 }
            );
        }

        return NextResponse.json(stock, { status: 200 });
    } catch (error) {
        console.error("[GET /api/stocks/[id]]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération de la ressource." },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
    try {
        const { id } = await getParams(context);
        const stockId = Number(id);

        if (!Number.isInteger(stockId)) {
            return NextResponse.json(
                { error: "Identifiant de ressource invalide." },
                { status: 400 }
            );
        }

        const body = await req.json();

        const data: {
            name?: string;
            category?: string;
            currentCount?: number;
            unit?: string | null;
        } = {};

        if (typeof body.name === "string") {
            const name = body.name.trim();

            if (!name) {
                return NextResponse.json(
                    { error: "Le nom de la ressource est obligatoire." },
                    { status: 400 }
                );
            }

            data.name = name;
        }

        if (typeof body.category === "string") {
            const category = body.category.trim();

            if (!category) {
                return NextResponse.json(
                    { error: "La catégorie est obligatoire." },
                    { status: 400 }
                );
            }

            data.category = category;
        }

        if ("currentCount" in body) {
            const currentCount = Number(body.currentCount);

            if (!Number.isInteger(currentCount)) {
                return NextResponse.json(
                    { error: "La quantité doit être un entier." },
                    { status: 400 }
                );
            }

            data.currentCount = currentCount;
        }

        if ("unit" in body) {
            data.unit =
                typeof body.unit === "string" && body.unit.trim() !== ""
                    ? body.unit.trim()
                    : null;
        }

        const updatedStock = await prisma.stockItem.update({
            where: {
                id: stockId,
            },
            data,
            include: stockInclude,
        });

        return NextResponse.json(updatedStock, { status: 200 });
    } catch (error) {
        console.error("[PATCH /api/stocks/[id]]", error);

        if (isPrismaNotFoundError(error)) {
            return NextResponse.json(
                { error: "Ressource introuvable." },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Erreur serveur lors de la modification de la ressource." },
            { status: 500 }
        );
    }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
    try {
        const { id } = await getParams(context);
        const stockId = Number(id);

        if (!Number.isInteger(stockId)) {
            return NextResponse.json(
                { error: "Identifiant de ressource invalide." },
                { status: 400 }
            );
        }

        const stock = await prisma.stockItem.findUnique({
            where: {
                id: stockId,
            },
            select: {
                id: true,
                name: true,
            },
        });

        if (!stock) {
            return NextResponse.json(
                { error: "Ressource introuvable." },
                { status: 404 }
            );
        }

        await prisma.$transaction(async (tx) => {
            await tx.maraudTaskStock.deleteMany({
                where: {
                    stockItemId: stockId,
                },
            });

            await tx.stockItem.delete({
                where: {
                    id: stockId,
                },
            });
        });

        return NextResponse.json(
            {
                message:
                    "Ressource supprimée avec succès. Elle a aussi été retirée de toutes les tâches associées.",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("[DELETE /api/stocks/[id]]", error);

        if (isPrismaNotFoundError(error)) {
            return NextResponse.json(
                { error: "Ressource introuvable." },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Erreur serveur lors de la suppression de la ressource." },
            { status: 500 }
        );
    }
}