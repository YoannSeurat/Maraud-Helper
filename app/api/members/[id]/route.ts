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

const memberMaraudInclude = {
    author: {
        select: {
            id: true,
            name: true,
            picture: true,
        },
    },
    inscriptions: {
        select: {
            id: true,
            userId: true,
            maraudId: true,
        },
    },
    tasks: {
        select: {
            id: true,
            name: true,
            stockUsages: {
                select: {
                    id: true,
                    quantity: true,
                    completedCount: true,
                    stockItem: {
                        select: {
                            id: true,
                            name: true,
                            category: true,
                            unit: true,
                        },
                    },
                },
            },
        },
    },
};

function computeMemberStats(member: any) {
    const now = new Date();

    const maraudes = member.marauds.map((inscription: any) => inscription.maraud);

    const upcomingMaraudsCount = maraudes.filter((maraud: any) => {
        return !maraud.isFinished && new Date(maraud.endDate) >= now;
    }).length;

    const finishedMaraudsCount = maraudes.filter((maraud: any) => {
        return maraud.isFinished || new Date(maraud.endDate) < now;
    }).length;

    const totalTasksCount = maraudes.reduce((sum: number, maraud: any) => {
        return sum + maraud.tasks.length;
    }, 0);

    const totalStockUnitsPlanned = maraudes.reduce((sum: number, maraud: any) => {
        return (
            sum +
            maraud.tasks.reduce((taskSum: number, task: any) => {
                return (
                    taskSum +
                    task.stockUsages.reduce((usageSum: number, usage: any) => {
                        return usageSum + usage.quantity;
                    }, 0)
                );
            }, 0)
        );
    }, 0);

    const totalStockUnitsCompleted = maraudes.reduce((sum: number, maraud: any) => {
        return (
            sum +
            maraud.tasks.reduce((taskSum: number, task: any) => {
                return (
                    taskSum +
                    task.stockUsages.reduce((usageSum: number, usage: any) => {
                        return usageSum + Math.min(usage.completedCount, usage.quantity);
                    }, 0)
                );
            }, 0)
        );
    }, 0);

    return {
        inscriptionsCount: member.marauds.length,
        createdMaraudsCount: member.createdMarauds.length,
        upcomingMaraudsCount,
        finishedMaraudsCount,
        totalTasksCount,
        totalStockUnitsPlanned,
        totalStockUnitsCompleted,
    };
}

function formatMemberDetail(member: any) {
    const maraudes = member.marauds.map((inscription: any) => inscription.maraud);

    return {
        id: member.id,
        name: member.name,
        mail: member.mail,
        isAdmin: member.isAdmin,
        picture: member.picture,
        stats: computeMemberStats(member),
        maraudes,
        createdMarauds: member.createdMarauds,
    };
}

async function getMemberDetail(userId: number) {
    const member = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            name: true,
            mail: true,
            isAdmin: true,
            picture: true,
            marauds: {
                select: {
                    id: true,
                    maraud: {
                        include: memberMaraudInclude,
                    },
                },
                orderBy: {
                    maraud: {
                        date: "asc",
                    },
                },
            },
            createdMarauds: {
                include: memberMaraudInclude,
                orderBy: {
                    date: "asc",
                },
            },
        },
    });

    if (!member) return null;

    return formatMemberDetail(member);
}

export async function GET(_req: NextRequest, context: RouteContext) {
    try {
        const { id } = await getParams(context);
        const userId = Number(id);

        if (!Number.isInteger(userId)) {
            return NextResponse.json(
                { error: "Identifiant utilisateur invalide." },
                { status: 400 }
            );
        }

        const member = await getMemberDetail(userId);

        if (!member) {
            return NextResponse.json(
                { error: "Utilisateur introuvable." },
                { status: 404 }
            );
        }

        return NextResponse.json(member, { status: 200 });
    } catch (error) {
        console.error("[GET /api/members/[id]]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération du membre." },
            { status: 500 }
        );
    }
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