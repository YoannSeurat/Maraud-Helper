import { NextRequest, NextResponse } from "next/server";

const { prisma } = await import("@/lib/prisma");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
    params:
        | {
        id: string;
        maraudId: string;
    }
        | Promise<{
        id: string;
        maraudId: string;
    }>;
};

async function getParams(context: RouteContext) {
    return await context.params;
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

export async function DELETE(_req: NextRequest, context: RouteContext) {
    try {
        const { id, maraudId } = await getParams(context);

        const userId = Number(id);
        const parsedMaraudId = Number(maraudId);

        if (!Number.isInteger(userId) || !Number.isInteger(parsedMaraudId)) {
            return NextResponse.json(
                { error: "Identifiants invalides." },
                { status: 400 }
            );
        }

        await prisma.maraudInscription.deleteMany({
            where: {
                userId,
                maraudId: parsedMaraudId,
            },
        });

        const member = await getMemberDetail(userId);

        if (!member) {
            return NextResponse.json(
                { error: "Utilisateur introuvable." },
                { status: 404 }
            );
        }

        return NextResponse.json(member, { status: 200 });
    } catch (error) {
        console.error("[DELETE /api/members/[id]/maraudes/[maraudId]]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la désinscription." },
            { status: 500 }
        );
    }
}