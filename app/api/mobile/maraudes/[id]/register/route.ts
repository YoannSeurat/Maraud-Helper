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

export async function POST(req: NextRequest, context: RouteContext) {
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
            select: {
                id: true,
                isVisible: true,
                isFinished: true,
            },
        });

        if (!maraud) {
            return NextResponse.json(
                { error: "Maraude introuvable." },
                { status: 404 }
            );
        }

        if (!maraud.isVisible || maraud.isFinished) {
            return NextResponse.json(
                { error: "Cette maraude n'est pas disponible à l'inscription." },
                { status: 400 }
            );
        }

        await prisma.maraudInscription.upsert({
            where: {
                userId_maraudId: {
                    userId: user.id,
                    maraudId,
                },
            },
            update: {},
            create: {
                userId: user.id,
                maraudId,
            },
        });

        const updatedMaraud = await prisma.maraud.findUnique({
            where: {
                id: maraudId,
            },
            include: mobileMaraudInclude,
        });

        return NextResponse.json(
            formatMaraudForMobile(updatedMaraud, user.id),
            { status: 200 }
        );
    } catch (error) {
        console.error("[POST /api/mobile/maraudes/[id]/register]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de l'inscription." },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
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

        await prisma.maraudInscription.deleteMany({
            where: {
                userId: user.id,
                maraudId,
            },
        });

        const updatedMaraud = await prisma.maraud.findUnique({
            where: {
                id: maraudId,
            },
            include: mobileMaraudInclude,
        });

        return NextResponse.json(
            formatMaraudForMobile(updatedMaraud, user.id),
            { status: 200 }
        );
    } catch (error) {
        console.error("[DELETE /api/mobile/maraudes/[id]/register]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la désinscription." },
            { status: 500 }
        );
    }
}