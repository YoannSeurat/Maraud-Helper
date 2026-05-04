import { NextRequest, NextResponse } from "next/server";

const { prisma } = await import("@/lib/prisma");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function GET() {
    try {
        const maraudes = await prisma.maraud.findMany({
            include: maraudInclude,
            orderBy: {
                date: "asc",
            },
        });

        return NextResponse.json(maraudes, { status: 200 });
    } catch (error) {
        console.error("[GET /api/maraudes]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération des maraudes." },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            name,
            location,
            date,
            endDate,
            description,
            authorId,
            thumbnail,
            stops,
            tasks,
        } = body;

        if (!name || typeof name !== "string") {
            return NextResponse.json(
                { error: "Le nom de la maraude est obligatoire." },
                { status: 400 }
            );
        }

        if (!location || typeof location !== "string") {
            return NextResponse.json(
                { error: "Le lieu de la maraude est obligatoire." },
                { status: 400 }
            );
        }

        if (!date) {
            return NextResponse.json(
                { error: "La date de début est obligatoire." },
                { status: 400 }
            );
        }

        if (!endDate) {
            return NextResponse.json(
                { error: "La date de fin est obligatoire." },
                { status: 400 }
            );
        }

        const parsedStartDate = new Date(date);
        const parsedEndDate = new Date(endDate);

        if (Number.isNaN(parsedStartDate.getTime())) {
            return NextResponse.json(
                { error: "La date de début fournie est invalide." },
                { status: 400 }
            );
        }

        if (Number.isNaN(parsedEndDate.getTime())) {
            return NextResponse.json(
                { error: "La date de fin fournie est invalide." },
                { status: 400 }
            );
        }

        if (parsedEndDate <= parsedStartDate) {
            return NextResponse.json(
                { error: "La date de fin doit être postérieure à la date de début." },
                { status: 400 }
            );
        }

        const parsedAuthorId = Number(authorId);

        if (!Number.isInteger(parsedAuthorId)) {
            return NextResponse.json(
                { error: "L'identifiant de l'auteur est invalide." },
                { status: 400 }
            );
        }

        const author = await prisma.user.findUnique({
            where: {
                id: parsedAuthorId,
            },
            select: {
                id: true,
            },
        });

        if (!author) {
            return NextResponse.json(
                { error: "L'utilisateur créateur est introuvable." },
                { status: 404 }
            );
        }

        const newMaraud = await prisma.maraud.create({
            data: {
                name: name.trim(),
                location: location.trim(),
                date: parsedStartDate,
                endDate: parsedEndDate,
                description:
                    typeof description === "string" ? description.trim() : "",
                thumbnail:
                    typeof thumbnail === "string" && thumbnail.trim() !== ""
                        ? thumbnail.trim()
                        : null,
                isFinished: false,
                isVisible: true,
                authorId: parsedAuthorId,
                stops: Array.isArray(stops)
                    ? {
                        create: stops.map((stop, index) => ({
                            order: Number.isInteger(stop.order) ? stop.order : index,
                            address: String(stop.address ?? "").trim(),
                            city:
                                typeof stop.city === "string" && stop.city.trim() !== ""
                                    ? stop.city.trim()
                                    : null,
                            time: stop.time ? new Date(stop.time) : null,
                            lat:
                                typeof stop.lat === "number"
                                    ? stop.lat
                                    : null,
                            long:
                                typeof stop.long === "number"
                                    ? stop.long
                                    : null,
                        })),
                    }
                    : undefined,
                tasks: Array.isArray(tasks)
                    ? {
                        create: tasks.map((task, index) => ({
                            name: String(task.name ?? "").trim(),
                            description:
                                typeof task.description === "string"
                                    ? task.description.trim()
                                    : null,
                            startTime: new Date(task.startTime),
                            endTime: task.endTime ? new Date(task.endTime) : null,
                            order: Number.isInteger(task.order) ? task.order : index,
                        })),
                    }
                    : undefined,
            },
            include: maraudInclude,
        });

        return NextResponse.json(newMaraud, { status: 201 });
    } catch (error) {
        console.error("[POST /api/maraudes]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la création de la maraude." },
            { status: 500 }
        );
    }
}