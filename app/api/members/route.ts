import { NextResponse } from "next/server";

const { prisma } = await import("@/lib/prisma");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const members = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                mail: true,
                isAdmin: true,
                picture: true,
                marauds: {
                    select: {
                        id: true,
                        maraudId: true,
                    },
                },
                createdMarauds: {
                    select: {
                        id: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        const formattedMembers = members.map((member) => ({
            id: member.id,
            name: member.name,
            mail: member.mail,
            isAdmin: member.isAdmin,
            picture: member.picture,
            inscriptionsCount: member.marauds.length,
            createdMaraudsCount: member.createdMarauds.length,
        }));

        return NextResponse.json(formattedMembers, { status: 200 });
    } catch (error) {
        console.error("[GET /api/members]", error);

        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération des membres." },
            { status: 500 }
        );
    }
}