import { NextRequest, NextResponse } from "next/server";

const { prisma } = await import("@/lib/prisma");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const stocks = await prisma.stockItem.findMany({
            select: {
                category: true,
            },
            distinct: ["category"],
            orderBy: {
                category: "asc",
            },
        });

        const categories = stocks.map((stock) => stock.category);

        return NextResponse.json(categories, { status: 200 });
    } catch (error) {
        console.error("[GET /api/stock-categories]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération des catégories." },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const category =
            typeof body.category === "string" ? body.category.trim() : "";

        if (!category) {
            return NextResponse.json(
                { error: "Le nom de la catégorie est obligatoire." },
                { status: 400 }
            );
        }

        return NextResponse.json({ category }, { status: 201 });
    } catch (error) {
        console.error("[POST /api/stock-categories]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la création de la catégorie." },
            { status: 500 }
        );
    }
}