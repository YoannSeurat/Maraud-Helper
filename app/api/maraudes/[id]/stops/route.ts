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
        const { address, city, time, lat, long } = body;

        if (!address || typeof address !== "string") {
            return NextResponse.json(
                { error: "L'adresse de l'étape est obligatoire." },
                { status: 400 }
            );
        }

        if (!time) {
            return NextResponse.json(
                { error: "L'heure de l'étape est obligatoire." },
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

        const parsedTime = new Date(time);

        if (Number.isNaN(parsedTime.getTime())) {
            return NextResponse.json(
                { error: "L'heure de l'étape est invalide." },
                { status: 400 }
            );
        }

        if (parsedTime < maraud.date || parsedTime > maraud.endDate) {
            return NextResponse.json(
                {
                    error:
                        "L'heure de l'étape doit être comprise dans la plage horaire de la maraude.",
                },
                { status: 400 }
            );
        }

        const stopCount = await prisma.maraudStop.count({
            where: {
                maraudId,
            },
        });

        await prisma.maraudStop.create({
            data: {
                maraudId,
                order: stopCount,
                address: address.trim(),
                city:
                    typeof city === "string" && city.trim() !== "" ? city.trim() : null,
                time: parsedTime,
                lat: typeof lat === "number" ? lat : null,
                long: typeof long === "number" ? long : null,
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
        console.error("[POST /api/maraudes/[id]/stops]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la création de l'étape." },
            { status: 500 }
        );
    }
}