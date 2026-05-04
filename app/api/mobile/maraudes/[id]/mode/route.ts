import { NextRequest, NextResponse } from "next/server";
import {
    formatMaraudForMobile,
    getCurrentUserFromRequest,
    mobileMaraudInclude,
} from "../../../_utils";

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

async function getParams(context: RouteContext) {
    return await context.params;
}

export async function GET(req: NextRequest, context: RouteContext) {
    try {
        const user = await getCurrentUserFromRequest(req);
        const { id } = await getParams(context);
        const maraudId = Number(id);

        if (!user) {
            return NextResponse.json(
                { error: "Authentification requise." },
                { status: 401 }
            );
        }

        if (!Number.isInteger(maraudId)) {
            return NextResponse.json(
                { error: "Identifiant de maraude invalide." },
                { status: 400 }
            );
        }

        const maraud = await prisma.maraud.findUnique({
            where: {
                id: maraudId,
            },
            include: mobileMaraudInclude,
        });

        if (!maraud) {
            return NextResponse.json(
                { error: "Maraude introuvable." },
                { status: 404 }
            );
        }

        const isRegistered = maraud.inscriptions.some(
            (inscription) => inscription.userId === user.id
        );

        if (!isRegistered) {
            return NextResponse.json(
                { error: "Tu n'es pas inscrit à cette maraude." },
                { status: 403 }
            );
        }

        return NextResponse.json(formatMaraudForMobile(maraud, user.id), {
            status: 200,
        });
    } catch (error) {
        console.error("[GET /api/mobile/maraudes/[id]/mode]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération du mode maraude." },
            { status: 500 }
        );
    }
}