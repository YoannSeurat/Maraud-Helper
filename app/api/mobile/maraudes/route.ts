import { NextRequest, NextResponse } from "next/server";
import {
    formatMaraudForMobile,
    getCurrentUserFromRequest,
    mobileMaraudInclude,
} from "../_utils";

const { prisma } = await import("@/lib/prisma");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(req);

        if (!user) {
            return NextResponse.json(
                { error: "Authentification requise." },
                { status: 401 }
            );
        }

        const now = new Date();

        const maraudes = await prisma.maraud.findMany({
            where: {
                isVisible: true,
                isFinished: false,
                date: {
                    gte: now,
                },
            },
            include: mobileMaraudInclude,
            orderBy: {
                date: "asc",
            },
        });

        return NextResponse.json(
            maraudes.map((maraud: any) => formatMaraudForMobile(maraud, user.id)),
            { status: 200 }
        );
    } catch (error) {
        console.error("[GET /api/mobile/maraudes]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération des maraudes." },
            { status: 500 }
        );
    }
}