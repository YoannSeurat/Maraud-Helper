"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { socket } from "@/lib/socket";
import { getMobileMaraudMode, MobileMaraud } from "@/lib/api/mobile";
import MobileModeProgress from "@/components/mobile/MobileModeProgress";
import MobileModeTaskCard from "@/components/mobile/MobileModeTaskCard";

function isTaskCompleted(task: MobileMaraud["tasks"][number]) {
    if (task.stockUsages.length === 0) return false;

    return task.stockUsages.every(
        (usage) => usage.completedCount >= usage.quantity
    );
}

function getMaraudProgress(maraud: MobileMaraud) {
    const usages = maraud.tasks.flatMap((task) => task.stockUsages);

    const total = usages.reduce((sum, usage) => sum + usage.quantity, 0);

    const done = usages.reduce(
        (sum, usage) => sum + Math.min(usage.completedCount, usage.quantity),
        0
    );

    if (total === 0) return 0;

    return Math.round((done / total) * 100);
}

function formatTime(dateString: string) {
    const date = new Date(dateString);

    return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function MobileMaraudModePage() {
    const params = useParams();
    const router = useRouter();

    const maraudId = Number(params.id);

    const [maraud, setMaraud] = useState<MobileMaraud | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchMaraud = async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);

            const data = await getMobileMaraudMode(maraudId);

            setMaraud(data);
        } catch (error) {
            console.error(error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Impossible de récupérer la maraude."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!Number.isInteger(maraudId)) return;

        fetchMaraud();

        socket.emit("join-maraud", maraudId);

        const onProgressUpdated = (updatedMaraud: MobileMaraud) => {
            if (updatedMaraud.id === maraudId) {
                setMaraud(updatedMaraud);
            }
        };

        socket.on("maraud-progress-updated", onProgressUpdated);

        return () => {
            socket.emit("leave-maraud", maraudId);
            socket.off("maraud-progress-updated", onProgressUpdated);
        };
    }, [maraudId]);

    const currentTasks = useMemo(() => {
        if (!maraud) return [];

        return maraud.tasks.filter((task) => !isTaskCompleted(task));
    }, [maraud]);

    const completedTasks = useMemo(() => {
        if (!maraud) return [];

        return maraud.tasks.filter(isTaskCompleted);
    }, [maraud]);

    if (isLoading) {
        return (
            <main className="px-8">
                <p className="mt-12 text-center text-text-secondary">Chargement...</p>
            </main>
        );
    }

    if (!maraud) {
        return (
            <main className="px-8">
                <p className="mt-12 text-center text-secondary-600">
                    {errorMessage ?? "Maraude introuvable."}
                </p>
            </main>
        );
    }

    return (
        <main className="px-6 pb-28">
            <MobileModeProgress percent={getMaraudProgress(maraud)} />

            <div className="mt-7 space-y-7">
                {currentTasks.map((task) => (
                    <div key={task.id}>
                        <p className="mb-3 text-lg text-text-secondary">
                            {formatTime(task.startTime)}
                        </p>

                        <MobileModeTaskCard
                            task={task}
                            onClick={() =>
                                router.push(`/mobile/maraudes/${maraud.id}/mode/${task.id}`)
                            }
                        />
                    </div>
                ))}

                {completedTasks.length > 0 && (
                    <section>
                        <h2 className="mb-3 text-xl font-bold uppercase text-text-secondary">
                            Passés
                        </h2>

                        <div className="space-y-4">
                            {completedTasks.map((task) => (
                                <MobileModeTaskCard
                                    key={task.id}
                                    task={task}
                                    onClick={() =>
                                        router.push(`/mobile/maraudes/${maraud.id}/mode/${task.id}`)
                                    }
                                />
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <p className="text-lg text-text-secondary">
                        {formatTime(maraud.date)} → {formatTime(maraud.endDate)}
                    </p>

                    <div className="mt-4 rounded-[22px] bg-bg-2 p-5">
                        <h2 className="text-xl font-bold text-text-main">
                            Marche de la maraude
                        </h2>

                        <p className="mt-2 text-lg leading-tight text-text-secondary">
                            Suivez en direct le déplacement du groupe et l’itinéraire sur la
                            carte
                        </p>

                        <div className="mt-5 flex h-[96px] items-center justify-center overflow-hidden rounded-md bg-bg">
              <span className="text-lg font-semibold text-text-secondary">
                Voir sur la carte
              </span>
                        </div>
                    </div>
                </section>
            </div>

            <div className="fixed bottom-6 left-1/2 z-40 flex w-[340px] -translate-x-1/2 items-center justify-between rounded-full bg-bg-2 px-5 py-3 shadow-2xl">
                <button
                    type="button"
                    onClick={() => router.push("/mobile/mes-maraudes")}
                    className="flex items-center gap-3 text-lg text-text-main"
                >
                    <i className="bi bi-chevron-left text-base"></i>
                    Revenir
                </button>

                <button
                    type="button"
                    className="rounded-full bg-main-500 px-5 py-2 text-base font-bold text-white"
                >
                    <i className="bi bi-person-walking mr-2 text-sm"></i>
                    Mode maraude
                </button>
            </div>
        </main>
    );
}