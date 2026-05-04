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

async function getUpdatedMaraud(maraudId: number, userId: number) {
    const maraud = await prisma.maraud.findUnique({
        where: {
            id: maraudId,
        },
        include: mobileMaraudInclude,
    });

    return formatMaraudForMobile(maraud, userId);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
    try {
        const user = await getCurrentUserFromRequest(req);
        const { id } = await getParams(context);
        const stockUsageId = Number(id);

        if (!user) {
            return NextResponse.json(
                { error: "Authentification requise." },
                { status: 401 }
            );
        }

        if (!Number.isInteger(stockUsageId)) {
            return NextResponse.json(
                { error: "Identifiant de stock invalide." },
                { status: 400 }
            );
        }

        const body = await req.json();
        const delta = Number(body.delta);

        if (!Number.isInteger(delta) || delta === 0) {
            return NextResponse.json(
                { error: "Delta invalide." },
                { status: 400 }
            );
        }

        const usage = await prisma.maraudTaskStock.findUnique({
            where: {
                id: stockUsageId,
            },
            include: {
                task: {
                    include: {
                        maraud: {
                            include: {
                                inscriptions: true,
                            },
                        },
                    },
                },
            },
        });

        if (!usage) {
            return NextResponse.json(
                { error: "Stock de tâche introuvable." },
                { status: 404 }
            );
        }

        const maraud = usage.task.maraud;
        const isRegistered = maraud.inscriptions.some(
            (inscription) => inscription.userId === user.id
        );

        if (!isRegistered) {
            return NextResponse.json(
                { error: "Tu n'es pas inscrit à cette maraude." },
                { status: 403 }
            );
        }

        const nextCompletedCount = Math.max(
            0,
            Math.min(usage.quantity, usage.completedCount + delta)
        );

        await prisma.maraudTaskStock.update({
            where: {
                id: stockUsageId,
            },
            data: {
                completedCount: nextCompletedCount,
            },
        });

        const updatedMaraud = await getUpdatedMaraud(maraud.id, user.id);

        globalThis.io
            ?.to(`maraud:${maraud.id}`)
            .emit("maraud-progress-updated", updatedMaraud);

        return NextResponse.json(updatedMaraud, { status: 200 });
    } catch (error) {
        console.error("[PATCH /api/mobile/task-stocks/[id]/progress]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la mise à jour de la progression." },
            { status: 500 }
        );
    }
}