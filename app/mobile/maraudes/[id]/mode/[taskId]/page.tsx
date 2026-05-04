"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { socket } from "@/lib/socket";
import {
    getMobileMaraudMode,
    MobileMaraud,
    MobileMaraudTaskStock,
    updateMobileTaskStockProgress,
} from "@/lib/api/mobile";

function isUsageCompleted(usage: MobileMaraudTaskStock) {
    return usage.completedCount >= usage.quantity;
}

export default function MobileTaskDetailPage() {
    const params = useParams();
    const router = useRouter();

    const maraudId = Number(params.id);
    const taskId = Number(params.taskId);

    const [maraud, setMaraud] = useState<MobileMaraud | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [multiAddUsage, setMultiAddUsage] =
        useState<MobileMaraudTaskStock | null>(null);
    const [multiQuantity, setMultiQuantity] = useState("1");
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
                    : "Impossible de récupérer la tâche."
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

    const task = useMemo(() => {
        return maraud?.tasks.find((item) => item.id === taskId) ?? null;
    }, [maraud, taskId]);

    const currentUsages = useMemo(() => {
        return task?.stockUsages.filter((usage) => !isUsageCompleted(usage)) ?? [];
    }, [task]);

    const completedUsages = useMemo(() => {
        return task?.stockUsages.filter(isUsageCompleted) ?? [];
    }, [task]);

    const handleProgress = async (usage: MobileMaraudTaskStock, delta: number) => {
        try {
            setUpdatingId(usage.id);
            setErrorMessage(null);

            const updated = await updateMobileTaskStockProgress(usage.id, delta);

            setMaraud(updated);
        } catch (error) {
            console.error(error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Erreur lors de la mise à jour."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const handleMultiAdd = async () => {
        if (!multiAddUsage) return;

        const quantity = Number(multiQuantity);

        if (!Number.isInteger(quantity) || quantity <= 0) {
            setErrorMessage("Quantité invalide.");
            return;
        }

        await handleProgress(multiAddUsage, quantity);
        setMultiAddUsage(null);
        setMultiQuantity("1");
    };

    if (isLoading) {
        return (
            <main className="px-8">
                <p className="mt-12 text-center text-text-secondary">Chargement...</p>
            </main>
        );
    }

    if (!task || !maraud) {
        return (
            <main className="px-8">
                <p className="mt-12 text-center text-secondary-600">
                    {errorMessage ?? "Tâche introuvable."}
                </p>
            </main>
        );
    }

    const total = task.stockUsages.reduce((sum, usage) => sum + usage.quantity, 0);
    const done = task.stockUsages.reduce(
        (sum, usage) => sum + Math.min(usage.completedCount, usage.quantity),
        0
    );

    return (
        <main className="px-6">
            {errorMessage && (
                <div className="mb-5 rounded-xl bg-secondary-500/10 px-4 py-3 text-sm text-secondary-700">
                    {errorMessage}
                </div>
            )}

            <section>
                <p className="mb-4 text-xl font-bold uppercase text-main-500">
                    {task.name}
                </p>

                <div className="space-y-6">
                    {currentUsages.map((usage) => {
                        const ratio =
                            usage.quantity === 0
                                ? 0
                                : Math.round((usage.completedCount / usage.quantity) * 100);

                        return (
                            <article
                                key={usage.id}
                                className={`rounded-[22px] bg-bg-2 p-6 ${
                                    updatingId === usage.id ? "pointer-events-none opacity-70" : ""
                                }`}
                            >
                                <h2 className="text-2xl font-bold text-text-main">
                                    {usage.stockItem.name}
                                </h2>

                                <div className="mt-6">
                                    <div className="h-4 overflow-hidden rounded-full bg-bg-4">
                                        <div
                                            className="h-full rounded-full bg-main-500"
                                            style={{ width: `${ratio}%` }}
                                        />
                                    </div>

                                    <p className="mt-2 text-right text-base font-semibold text-text-main">
                                        {usage.completedCount}/{usage.quantity}
                                    </p>
                                </div>

                                <div className="mt-7 grid grid-cols-[54px_1fr_54px] gap-4">
                                    <button
                                        type="button"
                                        onClick={() => handleProgress(usage, -1)}
                                        className="flex h-14 items-center justify-center rounded-md bg-bg-4 text-2xl font-bold text-text-main active:scale-95"
                                    >
                                        -
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleProgress(usage, 1)}
                                        className="flex h-14 items-center justify-center rounded-md bg-main-500 text-lg font-bold text-white active:scale-95"
                                    >
                                        <i className="bi bi-plus-lg mr-2"></i>
                                        valider un nouveau
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setMultiAddUsage(usage)}
                                        className="flex h-14 items-center justify-center rounded-md bg-bg-4 text-xl font-bold text-text-main active:scale-95"
                                    >
                                        <i className="bi bi-plus-lg"></i>
                                        <span className="-ml-1 text-sm">+</span>
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            {completedUsages.length > 0 && (
                <section className="mt-10">
                    <h2 className="mb-4 text-xl font-bold uppercase text-text-secondary">
                        Passés
                    </h2>

                    <div className="space-y-5">
                        {completedUsages.map((usage) => (
                            <article key={usage.id} className="rounded-[22px] bg-bg-2 p-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-text-main">
                                        {usage.stockItem.name}
                                    </h2>

                                    <p className="text-xl font-bold text-text-secondary">
                                        x{usage.completedCount}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleProgress(usage, -1)}
                                    className="mt-5 h-11 w-full rounded-md bg-bg-4 text-lg font-bold text-text-main active:scale-95"
                                >
                                    - Retirer un
                                </button>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            <div className="fixed bottom-6 left-1/2 z-40 flex w-[360px] -translate-x-1/2 items-center justify-between rounded-full bg-bg-2 px-5 py-3 shadow-2xl">
                <button
                    type="button"
                    onClick={() => router.push(`/mobile/maraudes/${maraud.id}/mode`)}
                    className="flex items-center gap-3 text-xl text-text-main"
                >
                    <i className="bi bi-chevron-left text-lg"></i>
                    Revenir
                </button>

                <p className="text-xl font-bold text-main-500">
                    {done}/{total}
                </p>
            </div>

            {multiAddUsage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-md">
                    <div className="w-full max-w-sm rounded-[22px] bg-bg-2 p-6">
                        <h2 className="text-xl font-bold text-text-main">
                            Ajouter plusieurs unités
                        </h2>

                        <p className="mt-2 text-sm text-text-secondary">
                            {multiAddUsage.stockItem.name}
                        </p>

                        <input
                            type="number"
                            min={1}
                            max={multiAddUsage.quantity - multiAddUsage.completedCount}
                            value={multiQuantity}
                            onChange={(event) => setMultiQuantity(event.target.value)}
                            className="mt-6 h-12 w-full rounded-md bg-bg-3 px-4 text-lg text-text-main outline-none"
                        />

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setMultiAddUsage(null)}
                                className="h-11 rounded-md bg-bg-4 text-text-main"
                            >
                                Annuler
                            </button>

                            <button
                                type="button"
                                onClick={handleMultiAdd}
                                className="h-11 rounded-md bg-main-500 text-white"
                            >
                                Ajouter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}