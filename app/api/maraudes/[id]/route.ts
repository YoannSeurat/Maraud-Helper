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
        orderBy: [{ time: "asc" }, { order: "asc" }],
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
        const maraudId = Number(id);

        if (!Number.isInteger(maraudId)) {
            return NextResponse.json(
                { error: "Identifiant de maraude invalide." },
                { status: 400 }
            );
        }

        const maraud = await prisma.maraud.findUnique({
            where: {
                id: maraudId,
            },
            include: maraudInclude,
        });

        if (!maraud) {
            return NextResponse.json(
                { error: "Maraude introuvable." },
                { status: 404 }
            );
        }

        return NextResponse.json(maraud, { status: 200 });
    } catch (error) {
        console.error("[GET /api/maraudes/[id]]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération de la maraude." },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
    try {
        const { id } = await getParams(context);
        const maraudId = Number(id);

        if (!Number.isInteger(maraudId)) {
            return NextResponse.json(
                { error: "Identifiant de maraude invalide." },
                { status: 400 }
            );
        }

        const body = await req.json();

        const currentMaraud = await prisma.maraud.findUnique({
            where: {
                id: maraudId,
            },
            include: {
                tasks: {
                    include: {
                        stockUsages: {
                            include: {
                                stockItem: true,
                            },
                        },
                    },
                },
            },
        });

        if (!currentMaraud) {
            return NextResponse.json(
                { error: "Maraude introuvable." },
                { status: 404 }
            );
        }

        const wantsToFinish =
            typeof body.isFinished === "boolean" && body.isFinished === true;

        /*
          Important :
          On ne bloque plus la clôture si le stock disponible est insuffisant.
          Le stock peut devenir négatif, ce qui permet d'afficher ensuite
          le manque dans l'inventaire.
        */
        if (
            wantsToFinish &&
            !currentMaraud.isFinished &&
            !currentMaraud.stocksDeducted
        ) {
            const usageByStock = new Map<number, number>();

            currentMaraud.tasks.forEach((task) => {
                task.stockUsages.forEach((usage) => {
                    usageByStock.set(
                        usage.stockItemId,
                        (usageByStock.get(usage.stockItemId) ?? 0) + usage.quantity
                    );
                });
            });

            const transactionOperations = Array.from(usageByStock.entries()).map(
                ([stockItemId, quantity]) =>
                    prisma.stockItem.update({
                        where: {
                            id: stockItemId,
                        },
                        data: {
                            currentCount: {
                                decrement: quantity,
                            },
                        },
                    })
            );

            transactionOperations.push(
                prisma.maraud.update({
                    where: {
                        id: maraudId,
                    },
                    data: {
                        isFinished: true,
                        isVisible: false,
                        stocksDeducted: true,
                    },
                })
            );

            await prisma.$transaction(transactionOperations);

            const updatedMaraud = await prisma.maraud.findUnique({
                where: {
                    id: maraudId,
                },
                include: maraudInclude,
            });

            return NextResponse.json(updatedMaraud, { status: 200 });
        }

        const data: {
            name?: string;
            location?: string;
            date?: Date;
            endDate?: Date;
            description?: string;
            thumbnail?: string | null;
            isFinished?: boolean;
            isVisible?: boolean;
        } = {};

        if (typeof body.name === "string") {
            data.name = body.name.trim();
        }

        if (typeof body.location === "string") {
            data.location = body.location.trim();
        }

        if (body.date) {
            const parsedDate = new Date(body.date);

            if (Number.isNaN(parsedDate.getTime())) {
                return NextResponse.json(
                    { error: "La date de début fournie est invalide." },
                    { status: 400 }
                );
            }

            data.date = parsedDate;
        }

        if (body.endDate) {
            const parsedEndDate = new Date(body.endDate);

            if (Number.isNaN(parsedEndDate.getTime())) {
                return NextResponse.json(
                    { error: "La date de fin fournie est invalide." },
                    { status: 400 }
                );
            }

            data.endDate = parsedEndDate;
        }

        const finalStartDate = data.date ?? currentMaraud.date;
        const finalEndDate = data.endDate ?? currentMaraud.endDate;

        if (finalEndDate <= finalStartDate) {
            return NextResponse.json(
                { error: "La date de fin doit être postérieure à la date de début." },
                { status: 400 }
            );
        }

        if (typeof body.description === "string") {
            data.description = body.description.trim();
        }

        if (typeof body.thumbnail === "string") {
            data.thumbnail =
                body.thumbnail.trim() !== "" ? body.thumbnail.trim() : null;
        }

        if (typeof body.isFinished === "boolean") {
            data.isFinished = body.isFinished;
        }

        if (typeof body.isVisible === "boolean") {
            data.isVisible = body.isVisible;
        }

        const updatedMaraud = await prisma.maraud.update({
            where: {
                id: maraudId,
            },
            data,
            include: maraudInclude,
        });

        return NextResponse.json(updatedMaraud, { status: 200 });
    } catch (error) {
        console.error("[PATCH /api/maraudes/[id]]", error);

        if (isPrismaNotFoundError(error)) {
            return NextResponse.json(
                { error: "Maraude introuvable." },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Erreur serveur lors de la modification de la maraude." },
            { status: 500 }
        );
    }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
    try {
        const { id } = await getParams(context);
        const maraudId = Number(id);

        if (!Number.isInteger(maraudId)) {
            return NextResponse.json(
                { error: "Identifiant de maraude invalide." },
                { status: 400 }
            );
        }

        await prisma.$transaction([
            prisma.maraudTaskUser.deleteMany({
                where: {
                    task: {
                        maraudId,
                    },
                },
            }),
            prisma.maraudTaskStock.deleteMany({
                where: {
                    task: {
                        maraudId,
                    },
                },
            }),
            prisma.maraudTask.deleteMany({
                where: {
                    maraudId,
                },
            }),
            prisma.maraudStop.deleteMany({
                where: {
                    maraudId,
                },
            }),
            prisma.maraudInscription.deleteMany({
                where: {
                    maraudId,
                },
            }),
            prisma.maraud.delete({
                where: {
                    id: maraudId,
                },
            }),
        ]);

        return NextResponse.json(
            { message: "Maraude supprimée avec succès." },
            { status: 200 }
        );
    } catch (error) {
        console.error("[DELETE /api/maraudes/[id]]", error);

        if (isPrismaNotFoundError(error)) {
            return NextResponse.json(
                { error: "Maraude introuvable." },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Erreur serveur lors de la suppression de la maraude." },
            { status: 500 }
        );
    }
}