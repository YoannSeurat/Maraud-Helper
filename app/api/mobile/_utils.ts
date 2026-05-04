import { NextRequest } from "next/server";

export async function getCurrentUserFromRequest(req: NextRequest) {
    const { prisma } = await import("@/lib/prisma");

    const token = req.cookies.get("authToken")?.value;

    if (!token) return null;

    return prisma.user.findUnique({
        where: {
            token,
        },
        select: {
            id: true,
            name: true,
            mail: true,
            isAdmin: true,
            picture: true,
        },
    });
}

export const mobileMaraudInclude = {
    author: {
        select: {
            id: true,
            name: true,
            picture: true,
        },
    },
    inscriptions: {
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    picture: true,
                },
            },
        },
    },
    tasks: {
        orderBy: {
            startTime: "asc",
        },
        include: {
            stockUsages: {
                include: {
                    stockItem: true,
                },
                orderBy: {
                    id: "asc",
                },
            },
        },
    },
};

export function formatMaraudForMobile(maraud: any, userId: number) {
    return {
        ...maraud,
        isRegistered: maraud.inscriptions.some(
            (inscription: any) => inscription.userId === userId
        ),
    };
}

export function isTaskCompleted(task: any) {
    if (!task.stockUsages || task.stockUsages.length === 0) return false;

    return task.stockUsages.every(
        (usage: any) => usage.completedCount >= usage.quantity
    );
}

export function getMaraudProgress(maraud: any) {
    const usages = maraud.tasks.flatMap((task: any) => task.stockUsages);

    const total = usages.reduce((sum: number, usage: any) => sum + usage.quantity, 0);

    const completed = usages.reduce(
        (sum: number, usage: any) =>
            sum + Math.min(usage.completedCount, usage.quantity),
        0
    );

    if (total === 0) return 0;

    return Math.round((completed / total) * 100);
}