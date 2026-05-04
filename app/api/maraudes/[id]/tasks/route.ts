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
        const { id } = await getParams(context);
        const maraudId = Number(id);

        if (!Number.isInteger(maraudId)) {
            return NextResponse.json(
                { error: "Identifiant de maraude invalide." },
                { status: 400 }
            );
        }

        const body = await req.json();
        const { name, startTime, endTime, description } = body;

        if (!name || typeof name !== "string") {
            return NextResponse.json(
                { error: "Le nom de la tâche est obligatoire." },
                { status: 400 }
            );
        }

        if (!startTime) {
            return NextResponse.json(
                { error: "L'heure de début de la tâche est obligatoire." },
                { status: 400 }
            );
        }

        const maraud = await prisma.maraud.findUnique({
            where: {
                id: maraudId,
            },
            select: {
                id: true,
                date: true,
                endDate: true,
            },
        });

        if (!maraud) {
            return NextResponse.json(
                { error: "Maraude introuvable." },
                { status: 404 }
            );
        }

        const parsedStartTime = new Date(startTime);
        const parsedEndTime = endTime ? new Date(endTime) : null;

        if (Number.isNaN(parsedStartTime.getTime())) {
            return NextResponse.json(
                { error: "L'heure de début est invalide." },
                { status: 400 }
            );
        }

        if (parsedStartTime < maraud.date || parsedStartTime > maraud.endDate) {
            return NextResponse.json(
                {
                    error:
                        "L'heure de la tâche doit être comprise dans la plage horaire de la maraude.",
                },
                { status: 400 }
            );
        }

        if (parsedEndTime && parsedEndTime <= parsedStartTime) {
            return NextResponse.json(
                { error: "L'heure de fin doit être postérieure à l'heure de début." },
                { status: 400 }
            );
        }

        const taskCount = await prisma.maraudTask.count({
            where: {
                maraudId,
            },
        });

        await prisma.maraudTask.create({
            data: {
                maraudId,
                name: name.trim(),
                description:
                    typeof description === "string" && description.trim() !== ""
                        ? description.trim()
                        : null,
                startTime: parsedStartTime,
                endTime: parsedEndTime,
                order: taskCount,
            },
        });

        const updatedMaraud = await prisma.maraud.findUnique({
            where: {
                id: maraudId,
            },
            include: maraudInclude,
        });

        return NextResponse.json(updatedMaraud, { status: 201 });
    } catch (error) {
        console.error("[POST /api/maraudes/[id]/tasks]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la création de la tâche." },
            { status: 500 }
        );
    }
}