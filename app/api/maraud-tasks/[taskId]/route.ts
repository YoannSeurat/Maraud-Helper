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

export async function PATCH(req: NextRequest, context: RouteContext) {
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

        const task = await prisma.maraudTask.findUnique({
            where: {
                id,
            },
            include: {
                maraud: {
                    select: {
                        id: true,
                        date: true,
                        endDate: true,
                    },
                },
            },
        });

        if (!task) {
            return NextResponse.json(
                { error: "Tâche introuvable." },
                { status: 404 }
            );
        }

        const data: {
            name?: string;
            description?: string | null;
            startTime?: Date;
            endTime?: Date | null;
        } = {};

        if (typeof body.name === "string") {
            data.name = body.name.trim();
        }

        if (typeof body.description === "string") {
            data.description = body.description.trim() || null;
        }

        if (body.startTime) {
            const parsedStartTime = new Date(body.startTime);

            if (Number.isNaN(parsedStartTime.getTime())) {
                return NextResponse.json(
                    { error: "L'heure de début est invalide." },
                    { status: 400 }
                );
            }

            if (
                parsedStartTime < task.maraud.date ||
                parsedStartTime > task.maraud.endDate
            ) {
                return NextResponse.json(
                    {
                        error:
                            "L'heure de la tâche doit être comprise dans la plage horaire de la maraude.",
                    },
                    { status: 400 }
                );
            }

            data.startTime = parsedStartTime;
        }

        if ("endTime" in body) {
            if (!body.endTime) {
                data.endTime = null;
            } else {
                const parsedEndTime = new Date(body.endTime);

                if (Number.isNaN(parsedEndTime.getTime())) {
                    return NextResponse.json(
                        { error: "L'heure de fin est invalide." },
                        { status: 400 }
                    );
                }

                data.endTime = parsedEndTime;
            }
        }

        const finalStartTime = data.startTime ?? task.startTime;
        const finalEndTime = data.endTime ?? task.endTime;

        if (finalEndTime && finalEndTime <= finalStartTime) {
            return NextResponse.json(
                { error: "L'heure de fin doit être postérieure à l'heure de début." },
                { status: 400 }
            );
        }

        await prisma.maraudTask.update({
            where: {
                id,
            },
            data,
        });

        const updatedMaraud = await prisma.maraud.findUnique({
            where: {
                id: task.maraudId,
            },
            include: maraudInclude,
        });

        return NextResponse.json(updatedMaraud, { status: 200 });
    } catch (error) {
        console.error("[PATCH /api/maraud-tasks/[taskId]]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la modification de la tâche." },
            { status: 500 }
        );
    }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
    try {
        const { taskId } = await getParams(context);
        const id = Number(taskId);

        if (!Number.isInteger(id)) {
            return NextResponse.json(
                { error: "Identifiant de tâche invalide." },
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

        await prisma.$transaction([
            prisma.maraudTaskUser.deleteMany({
                where: {
                    maraudTaskId: id,
                },
            }),
            prisma.maraudTaskStock.deleteMany({
                where: {
                    maraudTaskId: id,
                },
            }),
            prisma.maraudTask.delete({
                where: {
                    id,
                },
            }),
        ]);

        const updatedMaraud = await prisma.maraud.findUnique({
            where: {
                id: task.maraudId,
            },
            include: maraudInclude,
        });

        return NextResponse.json(updatedMaraud, { status: 200 });
    } catch (error) {
        console.error("[DELETE /api/maraud-tasks/[taskId]]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la suppression de la tâche." },
            { status: 500 }
        );
    }
}