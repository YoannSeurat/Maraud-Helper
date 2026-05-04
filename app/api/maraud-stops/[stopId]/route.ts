import { NextRequest, NextResponse } from "next/server";

const { prisma } = await import("@/lib/prisma");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
    params:
        | {
        stopId: string;
    }
        | Promise<{
        stopId: string;
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

export async function PATCH(req: NextRequest, context: RouteContext) {
    try {
        const { stopId } = await getParams(context);
        const id = Number(stopId);

        if (!Number.isInteger(id)) {
            return NextResponse.json(
                { error: "Identifiant d'étape invalide." },
                { status: 400 }
            );
        }

        const body = await req.json();

        const stop = await prisma.maraudStop.findUnique({
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

        if (!stop) {
            return NextResponse.json(
                { error: "Étape introuvable." },
                { status: 404 }
            );
        }

        const data: {
            address?: string;
            city?: string | null;
            time?: Date;
            lat?: number | null;
            long?: number | null;
            order?: number;
        } = {};

        if (typeof body.address === "string") {
            data.address = body.address.trim();
        }

        if ("city" in body) {
            data.city =
                typeof body.city === "string" && body.city.trim() !== ""
                    ? body.city.trim()
                    : null;
        }

        if (!body.time) {
            return NextResponse.json(
                { error: "L'heure de l'étape est obligatoire." },
                { status: 400 }
            );
        }

        const parsedTime = new Date(body.time);

        if (Number.isNaN(parsedTime.getTime())) {
            return NextResponse.json(
                { error: "L'heure de l'étape est invalide." },
                { status: 400 }
            );
        }

        if (parsedTime < stop.maraud.date || parsedTime > stop.maraud.endDate) {
            return NextResponse.json(
                {
                    error:
                        "L'heure de l'étape doit être comprise dans la plage horaire de la maraude.",
                },
                { status: 400 }
            );
        }

        data.time = parsedTime;

        if ("lat" in body) {
            data.lat = typeof body.lat === "number" ? body.lat : null;
        }

        if ("long" in body) {
            data.long = typeof body.long === "number" ? body.long : null;
        }

        if (Number.isInteger(body.order)) {
            data.order = body.order;
        }

        await prisma.maraudStop.update({
            where: {
                id,
            },
            data,
        });

        const updatedMaraud = await prisma.maraud.findUnique({
            where: {
                id: stop.maraudId,
            },
            include: maraudInclude,
        });

        return NextResponse.json(updatedMaraud, { status: 200 });
    } catch (error) {
        console.error("[PATCH /api/maraud-stops/[stopId]]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la modification de l'étape." },
            { status: 500 }
        );
    }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
    try {
        const { stopId } = await getParams(context);
        const id = Number(stopId);

        if (!Number.isInteger(id)) {
            return NextResponse.json(
                { error: "Identifiant d'étape invalide." },
                { status: 400 }
            );
        }

        const stop = await prisma.maraudStop.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                maraudId: true,
            },
        });

        if (!stop) {
            return NextResponse.json(
                { error: "Étape introuvable." },
                { status: 404 }
            );
        }

        await prisma.maraudStop.delete({
            where: {
                id,
            },
        });

        const updatedMaraud = await prisma.maraud.findUnique({
            where: {
                id: stop.maraudId,
            },
            include: maraudInclude,
        });

        return NextResponse.json(updatedMaraud, { status: 200 });
    } catch (error) {
        console.error("[DELETE /api/maraud-stops/[stopId]]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la suppression de l'étape." },
            { status: 500 }
        );
    }
}