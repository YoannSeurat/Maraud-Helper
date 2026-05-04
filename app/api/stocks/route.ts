import { NextRequest, NextResponse } from "next/server";

const { prisma } = await import("@/lib/prisma");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query")?.trim() ?? "";

        const stocks = await prisma.stockItem.findMany({
            where: query
                ? {
                    OR: [
                        {
                            name: {
                                contains: query,
                            },
                        },
                        {
                            category: {
                                contains: query,
                            },
                        },
                    ],
                }
                : undefined,
            include: stockInclude,
            orderBy: [
                {
                    category: "asc",
                },
                {
                    name: "asc",
                },
            ],
        });

        return NextResponse.json(stocks, { status: 200 });
    } catch (error) {
        console.error("[GET /api/stocks]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération des stocks." },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const name = typeof body.name === "string" ? body.name.trim() : "";
        const category =
            typeof body.category === "string" ? body.category.trim() : "";
        const currentCount = Number(body.currentCount);
        const unit = typeof body.unit === "string" ? body.unit.trim() : "";

        if (!name) {
            return NextResponse.json(
                { error: "Le nom de la ressource est obligatoire." },
                { status: 400 }
            );
        }

        if (!category) {
            return NextResponse.json(
                { error: "La catégorie est obligatoire." },
                { status: 400 }
            );
        }

        if (!Number.isInteger(currentCount) || currentCount < 0) {
            return NextResponse.json(
                { error: "La quantité doit être un entier positif ou nul." },
                { status: 400 }
            );
        }

        const createdStock = await prisma.stockItem.create({
            data: {
                name,
                category,
                currentCount,
                unit: unit || null,
            },
            include: stockInclude,
        });

        return NextResponse.json(createdStock, { status: 201 });
    } catch (error) {
        console.error("[POST /api/stocks]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la création de la ressource." },
            { status: 500 }
        );
    }
}