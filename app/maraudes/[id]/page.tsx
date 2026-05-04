"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
    ApiMaraud,
    ApiMaraudStop,
    ApiStockItem,
    deleteMaraud,
    finishMaraud,
    getMaraud,
    toggleMaraudVisibility,
} from "@/lib/api/maraudes";
import { getStocks } from "@/lib/api/stocks";
import ConfirmDeleteModal from "@/components/maraudes/ConfirmDeleteModal";
import MapSettingsPanel from "@/components/maraudes/MapSettingsPanel";
import TaskManagerPanel from "@/components/maraudes/TaskManagerPanel";

const BUTTON_ANIMATION =
    "cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-95";

const ICON_BUTTON_ANIMATION =
    "cursor-pointer transition-all duration-150 hover:scale-110 active:scale-95";

const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
    });
};

const formatTime = (dateString: string) => {
    const date = new Date(dateString);

    return date
        .toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        })
        .replace(":", ".");
};

const sortStopsByTime = (stops: ApiMaraudStop[]) => {
    return [...stops].sort((a, b) => {
        const timeA = a.time ? new Date(a.time).getTime() : Number.MAX_SAFE_INTEGER;
        const timeB = b.time ? new Date(b.time).getTime() : Number.MAX_SAFE_INTEGER;

        if (timeA !== timeB) return timeA - timeB;

        return a.order - b.order;
    });
};

const getReservedQuantity = (stock?: ApiStockItem) => {
    if (!stock?.taskUsages) return 0;

    return stock.taskUsages.reduce((sum, usage) => sum + usage.quantity, 0);
};

export default function MaraudDetailPage() {
    const params = useParams();
    const router = useRouter();

    const maraudId = Number(params.id);

    const [maraud, setMaraud] = useState<ApiMaraud | null>(null);
    const [stockCatalog, setStockCatalog] = useState<ApiStockItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isFinishOpen, setIsFinishOpen] = useState(false);
    const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);
    const [isMapPanelOpen, setIsMapPanelOpen] = useState(false);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchMaraud = async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);

            const [maraudData, stocksData] = await Promise.all([
                getMaraud(maraudId),
                getStocks(),
            ]);

            setMaraud(maraudData);
            setStockCatalog(stocksData as ApiStockItem[]);
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
        if (Number.isInteger(maraudId)) {
            fetchMaraud();
        }
    }, [maraudId]);

    const totalStocksUsed = useMemo(() => {
        if (!maraud) return [];

        const stocks = new Map<
            number,
            {
                id: number;
                name: string;
                category: string;
                quantity: number;
                unit: string | null;
                currentCount: number;
                projectedRemaining: number;
                missing: number;
            }
        >();

        maraud.tasks.forEach((task) => {
            task.stockUsages.forEach((usage) => {
                const stockFromCatalog = stockCatalog.find(
                    (stock) => stock.id === usage.stockItemId
                );

                const reserved = getReservedQuantity(stockFromCatalog);
                const currentCount =
                    stockFromCatalog?.currentCount ?? usage.stockItem.currentCount;
                const projectedRemaining = currentCount - reserved;
                const missing = Math.max(0, -projectedRemaining);

                const existing = stocks.get(usage.stockItemId);

                if (existing) {
                    existing.quantity += usage.quantity;
                } else {
                    stocks.set(usage.stockItemId, {
                        id: usage.stockItemId,
                        name: usage.stockItem.name,
                        category: usage.stockItem.category,
                        quantity: usage.quantity,
                        unit: usage.stockItem.unit,
                        currentCount,
                        projectedRemaining,
                        missing,
                    });
                }
            });
        });

        return Array.from(stocks.values());
    }, [maraud, stockCatalog]);

    const displayedStops = useMemo(() => {
        if (!maraud) return [];

        if (maraud.stops.length > 0) {
            return sortStopsByTime(maraud.stops);
        }

        return [
            {
                id: -1,
                maraudId: maraud.id,
                order: 0,
                address: maraud.location,
                city: null,
                time: maraud.date,
                lat: null,
                long: null,
            },
        ];
    }, [maraud]);

    const sortedTasks = useMemo(() => {
        if (!maraud) return [];

        return [...maraud.tasks].sort(
            (a, b) =>
                new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
    }, [maraud]);

    const handleDelete = async () => {
        if (!maraud) return;

        try {
            setIsUpdating(true);
            setErrorMessage(null);

            await deleteMaraud(maraud.id);
            router.push("/");
        } catch (error) {
            console.error(error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Erreur lors de la suppression."
            );
        } finally {
            setIsUpdating(false);
        }
    };

    const handleToggleVisibility = async () => {
        if (!maraud) return;

        try {
            setIsUpdating(true);
            setErrorMessage(null);

            const updated = await toggleMaraudVisibility(
                maraud.id,
                !maraud.isVisible
            );

            setMaraud(updated);
        } catch (error) {
            console.error(error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Erreur lors du changement de visibilité."
            );
        } finally {
            setIsUpdating(false);
        }
    };

    const handleFinish = async () => {
        if (!maraud || maraud.isFinished) return;

        try {
            setIsUpdating(true);
            setErrorMessage(null);

            const updated = await finishMaraud(maraud.id);
            const stocksData = await getStocks();

            setMaraud(updated);
            setStockCatalog(stocksData as ApiStockItem[]);
            setIsFinishOpen(false);
        } catch (error) {
            console.error(error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Erreur lors du passage en terminé."
            );
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-bg text-text-main">
                <p className="text-text-secondary">Chargement...</p>
            </div>
        );
    }

    if (!maraud) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-bg text-text-main">
                <div className="text-center">
                    <p className="mb-4 text-text-secondary">Maraude introuvable.</p>
                    <button
                        onClick={() => router.push("/")}
                        className={`${BUTTON_ANIMATION} rounded-md bg-main-500 px-5 py-3 font-semibold text-white hover:bg-main-600`}
                    >
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg pb-28 font-sans text-text-main">
            <main className="mx-auto w-full max-w-[calc(100vw-2rem)] px-8 pt-6 lg:max-w-none lg:px-16">
                <div className="mb-9 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <button
                            type="button"
                            onClick={() => router.push("/")}
                            className={`${ICON_BUTTON_ANIMATION} mb-4 text-text-main/85 hover:text-text-main`}
                            aria-label="Retour"
                        >
                            <i className="bi bi-arrow-left text-2xl"></i>
                        </button>

                        <p className="mb-2 text-sm font-bold uppercase tracking-wider text-main-500">
                            Gestion de la maraude
                        </p>

                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-wide text-text-main">
                                {maraud.name}
                            </h1>

                            {!maraud.isVisible && (
                                <span className="rounded-full bg-bg-3 px-3 py-1 text-xs font-bold uppercase text-text-secondary">
                  Invisible
                </span>
                            )}

                            {maraud.isFinished && (
                                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold uppercase text-green-400">
                  Terminée
                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setIsDeleteOpen(true)}
                            disabled={isUpdating}
                            className={`${BUTTON_ANIMATION} flex items-center gap-2 rounded-md bg-main-500 px-4 py-2 text-sm font-semibold text-white hover:bg-main-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`}
                        >
                            <i className="bi bi-trash3-fill text-sm"></i>
                            Supprimer la maraude
                        </button>

                        <button
                            type="button"
                            onClick={handleToggleVisibility}
                            disabled={isUpdating}
                            className={`${BUTTON_ANIMATION} flex items-center gap-2 rounded-md bg-bg-2 px-4 py-2 text-sm font-semibold text-text-main hover:bg-bg-3 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`}
                        >
                            <i
                                className={`bi ${
                                    maraud.isVisible ? "bi-eye" : "bi-eye-slash"
                                } text-sm`}
                            ></i>
                            {maraud.isVisible ? "Rendre invisible" : "Rendre visible"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsFinishOpen(true)}
                            disabled={isUpdating || maraud.isFinished}
                            className={`${BUTTON_ANIMATION} flex items-center gap-2 rounded-md bg-bg-2 px-4 py-2 text-sm font-semibold text-text-main hover:bg-bg-3 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100`}
                        >
                            <i className="bi bi-check2-circle text-sm"></i>
                            Terminer
                        </button>
                    </div>
                </div>

                {errorMessage && (
                    <div className="mb-6 rounded-lg bg-secondary-500/10 px-5 py-4 text-sm text-secondary-700">
                        {errorMessage}
                    </div>
                )}

                <div className="mb-7 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl bg-bg-2 px-5 py-5">
                        <div className="flex items-center gap-3">
                            <i className="bi bi-person text-2xl text-text-main/80"></i>
                            <p className="text-3xl font-bold text-text-main">
                                {maraud.inscriptions.length}
                            </p>
                        </div>
                        <p className="mt-1 text-[10px] font-medium text-text-secondary">
                            Membres inscrit à la maraude
                        </p>
                    </div>

                    <div className="rounded-xl bg-bg-2 px-5 py-5">
                        <div className="flex items-center gap-3">
                            <i className="bi bi-calendar-event text-2xl text-text-main/80"></i>
                            <p className="text-3xl font-bold text-text-main">
                                {formatDateShort(maraud.date)}
                            </p>
                        </div>
                        <p className="mt-1 text-[10px] font-medium text-text-secondary">
                            Date de l'événement
                        </p>
                    </div>

                    <div className="rounded-xl bg-bg-2 px-5 py-5">
                        <div className="flex items-center gap-3">
                            <i className="bi bi-briefcase text-2xl text-text-main/80"></i>
                            <p className="text-3xl font-bold text-text-main">
                                {maraud.tasks.length}
                            </p>
                        </div>
                        <p className="mt-1 text-[10px] font-medium text-text-secondary">
                            Tâches
                        </p>
                    </div>

                    <div className="rounded-xl bg-bg-2 px-5 py-5">
                        <div className="flex items-center gap-3">
                            <i className="bi bi-map text-2xl text-text-main/80"></i>
                            <p className="text-3xl font-bold text-text-main">
                                {displayedStops.length}
                            </p>
                        </div>
                        <p className="mt-1 text-[10px] font-medium text-text-secondary">
                            Points de stop sur le parcours
                        </p>
                    </div>
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[310px_minmax(0,1fr)]">
                    <aside className="rounded-xl bg-bg-2 p-4">
                        <div className="h-[115px] w-full overflow-hidden rounded-lg bg-bg opacity-80">
                            <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.14),transparent_20%),linear-gradient(135deg,rgba(255,255,255,0.10),rgba(255,255,255,0.02)),linear-gradient(45deg,#333,#111)] opacity-70" />
                        </div>

                        <div className="mt-5">
                            <p className="text-sm font-bold uppercase text-main-500">
                                Point de rendez vous
                            </p>

                            <p className="mt-1 text-base font-bold leading-tight text-text-main">
                                {maraud.location}
                            </p>

                            {maraud.description && (
                                <p className="mt-5 text-sm leading-relaxed text-text-secondary">
                                    {maraud.description}
                                </p>
                            )}
                        </div>

                        <div className="mt-10 space-y-0">
                            {displayedStops.map((stop, index) => (
                                <div key={stop.id} className="flex gap-3">
                                    <div className="flex w-12 flex-col items-center">
                                        <p className="text-xs text-text-secondary">
                                            {stop.time ? formatTime(stop.time) : "--.--"}
                                        </p>

                                        <div className="mt-2 h-2 w-2 rounded-full bg-main-500" />

                                        {index < displayedStops.length - 1 && (
                                            <div className="h-12 w-[2px] bg-main-500" />
                                        )}
                                    </div>

                                    <p className="pb-5 text-xs leading-tight text-text-secondary">
                                        {stop.address}
                                        {stop.city ? `, ${stop.city}` : ""}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsMapPanelOpen(true)}
                                className={`${ICON_BUTTON_ANIMATION} flex h-9 w-9 items-center justify-center rounded-md bg-bg-3 text-text-main hover:bg-bg-4`}
                            >
                                <i className="bi bi-gear-fill text-sm"></i>
                            </button>

                            <button
                                type="button"
                                className={`${BUTTON_ANIMATION} flex items-center gap-2 rounded-md bg-main-500 px-4 py-2 text-sm font-semibold text-white hover:bg-main-600`}
                            >
                                <i className="bi bi-arrow-right text-base"></i>
                                Accéder à la carte
                            </button>
                        </div>
                    </aside>

                    <section className="min-w-0 space-y-5 overflow-hidden">
                        <div className="min-w-0 overflow-hidden rounded-xl bg-bg-2 p-4">
                            <div className="mb-5 flex min-w-0 items-center justify-between gap-4">
                                <h2 className="shrink-0 text-lg font-bold text-text-main">
                                    Gestionnaire de tâches
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => setIsTaskPanelOpen(true)}
                                    className={`${BUTTON_ANIMATION} shrink-0 whitespace-nowrap rounded-md bg-bg-3 px-3 py-2 text-sm font-semibold text-text-main hover:bg-bg-4`}
                                >
                                    <i className="bi bi-gear-fill mr-2 text-sm"></i>
                                    Gérer les tâches
                                </button>
                            </div>

                            <div className="dark-horizontal-scrollbar max-w-full overflow-x-auto overflow-y-hidden pb-3">
                                {sortedTasks.length === 0 ? (
                                    <div className="flex h-[118px] min-w-full items-center justify-center rounded-md bg-bg-3 text-sm text-text-secondary">
                                        Aucune tâche renseignée
                                    </div>
                                ) : (
                                    <div className="flex w-max min-w-full items-end px-2 pt-2">
                                        {sortedTasks.map((task, index) => (
                                            <div
                                                key={task.id}
                                                className="relative flex h-[118px] w-[210px] shrink-0 flex-col justify-end"
                                            >
                                                <div className="mb-5 flex flex-col items-end pr-1">
                                                    <p className="text-base font-bold text-text-main">
                                                        {formatTime(task.startTime)}
                                                    </p>
                                                    <p className="mt-1 max-w-[160px] truncate text-right text-xs font-semibold text-text-secondary">
                                                        {task.name}
                                                    </p>
                                                </div>

                                                <div className="flex items-center">
                                                    <div className="h-[3px] flex-1 rounded-full bg-main-500" />
                                                    <div className="h-3 w-3 rounded-full bg-main-500" />
                                                </div>

                                                {index === sortedTasks.length - 1 && (
                                                    <div className="absolute bottom-[4.5px] left-full h-[3px] w-12 rounded-full bg-main-500" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl bg-bg-2 p-4">
                            <h2 className="mb-4 text-lg font-bold text-text-main">
                                Stocks utilisé
                            </h2>

                            <div className="space-y-3">
                                {totalStocksUsed.length === 0 ? (
                                    <div className="rounded-md bg-bg-3 px-4 py-4 text-sm text-text-secondary">
                                        Aucun stock consommé par les tâches.
                                    </div>
                                ) : (
                                    totalStocksUsed.map((stock) => (
                                        <div
                                            key={stock.id}
                                            className="rounded-md bg-bg-3 px-4 py-3"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <p className="w-12 text-base font-bold text-text-main">
                                                        x{stock.quantity}
                                                    </p>

                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase leading-none text-main-500">
                                                            {stock.category}
                                                        </p>
                                                        <p className="text-sm font-semibold text-text-main">
                                                            {stock.name}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-xs text-text-secondary">
                                                        Stock actuel x{stock.currentCount}
                                                    </p>

                                                    {stock.missing > 0 ? (
                                                        <p className="text-sm font-bold text-secondary-500">
                                                            Il manque x{stock.missing}
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm font-bold text-green-400">
                                                            Après prévu x{stock.projectedRemaining}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {isTaskPanelOpen && (
                <TaskManagerPanel
                    maraud={maraud}
                    isUpdating={isUpdating}
                    setIsUpdating={setIsUpdating}
                    onClose={() => setIsTaskPanelOpen(false)}
                    onUpdated={setMaraud}
                />
            )}

            {isMapPanelOpen && (
                <MapSettingsPanel
                    maraud={maraud}
                    isUpdating={isUpdating}
                    setIsUpdating={setIsUpdating}
                    onClose={() => setIsMapPanelOpen(false)}
                    onUpdated={setMaraud}
                />
            )}

            {isDeleteOpen && (
                <ConfirmDeleteModal
                    title="Supprimer la maraude ?"
                    message={
                        <>
                            Cette action supprimera définitivement{" "}
                            <span className="font-semibold text-text-main">
                {maraud.name}
              </span>
                            , son parcours, ses tâches et les inscriptions associées.
                        </>
                    }
                    iconClassName="bi bi-trash3-fill"
                    iconContainerClassName="bg-secondary-500/10 text-secondary-600"
                    confirmLabel="Supprimer"
                    loadingLabel="Suppression..."
                    isLoading={isUpdating}
                    onCancel={() => setIsDeleteOpen(false)}
                    onConfirm={handleDelete}
                />
            )}

            {isFinishOpen && (
                <ConfirmDeleteModal
                    title="Terminer la maraude ?"
                    message={
                        <>
                            Cette action passera{" "}
                            <span className="font-semibold text-text-main">
                {maraud.name}
              </span>{" "}
                            en terminé et retirera définitivement des stocks les ressources
                            utilisées par ses tâches.
                        </>
                    }
                    iconClassName="bi bi-check2-circle"
                    iconContainerClassName="bg-green-500/10 text-green-400"
                    confirmLabel="Terminer"
                    loadingLabel="Finalisation..."
                    isLoading={isUpdating}
                    onCancel={() => setIsFinishOpen(false)}
                    onConfirm={handleFinish}
                />
            )}
        </div>
    );
}