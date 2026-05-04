"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
    ApiMaraud,
    ApiMaraudStop,
    deleteMaraudStop,
    updateMaraudLocation,
} from "@/lib/api/maraudes";
import StopFormModal from "./StopFormModal";

const BUTTON_ANIMATION =
    "cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-95";

const ICON_BUTTON_ANIMATION =
    "cursor-pointer transition-all duration-150 hover:scale-110 active:scale-95";

type MapSettingsPanelProps = {
    maraud: ApiMaraud;
    isUpdating: boolean;
    setIsUpdating: (value: boolean) => void;
    onClose: () => void;
    onUpdated: (maraud: ApiMaraud) => void;
};

const getInitial = (name: string) => {
    return name.trim().charAt(0).toUpperCase() || "?";
};

const getImageSrc = (picture?: string | null) => {
    if (!picture) return null;

    if (
        picture.startsWith("data:image") ||
        picture.startsWith("http://") ||
        picture.startsWith("https://") ||
        picture.startsWith("/")
    ) {
        return picture;
    }

    return `data:image/png;base64,${picture}`;
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

export default function MapSettingsPanel({
                                             maraud,
                                             isUpdating,
                                             setIsUpdating,
                                             onClose,
                                             onUpdated,
                                         }: MapSettingsPanelProps) {
    const [isStopFormOpen, setIsStopFormOpen] = useState(false);
    const [editingStop, setEditingStop] = useState<ApiMaraudStop | null>(null);
    const [mapPanelError, setMapPanelError] = useState<string | null>(null);

    const [mapForm, setMapForm] = useState({
        location: maraud.location,
    });

    const sortedStops = useMemo(
        () => sortStopsByTime(maraud.stops),
        [maraud.stops]
    );

    const saveMapSettings = async () => {
        try {
            setIsUpdating(true);
            setMapPanelError(null);

            if (!mapForm.location.trim()) {
                setMapPanelError("Le point de rendez-vous est obligatoire.");
                return;
            }

            const updated = await updateMaraudLocation(maraud.id, mapForm.location);
            onUpdated(updated);
            onClose();
        } catch (error) {
            console.error(error);
            setMapPanelError(
                error instanceof Error
                    ? error.message
                    : "Erreur lors de l'enregistrement de la carte."
            );
        } finally {
            setIsUpdating(false);
        }
    };

    const openCreateStopPanel = () => {
        setEditingStop(null);
        setMapPanelError(null);
        setIsStopFormOpen(true);
    };

    const openEditStopPanel = (stop: ApiMaraudStop) => {
        setEditingStop(stop);
        setMapPanelError(null);
        setIsStopFormOpen(true);
    };

    const handleDeleteStop = async (stop: ApiMaraudStop) => {
        try {
            setIsUpdating(true);
            setMapPanelError(null);

            const updated = await deleteMaraudStop(stop.id);
            onUpdated(updated);
        } catch (error) {
            console.error(error);
            setMapPanelError(
                error instanceof Error
                    ? error.message
                    : "Erreur lors de la suppression de l'étape."
            );
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-16 py-12 backdrop-blur-md">
                <div className="flex max-h-[calc(100vh-96px)] w-full max-w-[1760px] flex-col bg-bg-2 px-7 py-6 shadow-2xl">
                    <div className="mb-7 shrink-0">
                        <p className="text-sm font-bold uppercase tracking-wide text-main-500">
                            {maraud.name}
                        </p>
                        <h2 className="mt-1 text-3xl font-bold text-text-main">
                            Détails de la carte
                        </h2>
                    </div>

                    {mapPanelError && (
                        <div className="mb-5 shrink-0 rounded-md bg-secondary-500/10 px-4 py-3 text-sm text-secondary-700">
                            {mapPanelError}
                        </div>
                    )}

                    <div className="grid min-h-0 flex-1 grid-cols-[560px_1fr] gap-7">
                        <div className="relative h-full min-h-[420px] overflow-hidden rounded-md bg-bg">
                            <Image
                                src="/assets/map-preview.png"
                                alt="Carte"
                                fill
                                className="object-cover opacity-40"
                            />

                            <div className="absolute inset-0 bg-black/20" />

                            <svg
                                viewBox="0 0 560 460"
                                className="absolute inset-0 h-full w-full"
                                fill="none"
                            >
                                <path
                                    d="M90 250 C95 330 175 322 235 330 C285 336 330 356 365 318 C405 273 412 255 420 232"
                                    stroke="#F93A59"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    opacity="0.95"
                                />
                            </svg>

                            <div className="absolute left-[86px] top-[245px] flex items-center gap-2">
                                <div className="h-4 w-4 rounded-full bg-main-500 shadow-[0_0_22px_rgba(249,58,89,0.75)]" />
                                <p className="text-xs font-bold uppercase text-main-500">
                                    Étape n°1
                                </p>
                            </div>

                            <div className="absolute left-[300px] top-[335px] flex items-center gap-2">
                                <div className="h-4 w-4 rounded-full bg-main-500 shadow-[0_0_22px_rgba(249,58,89,0.75)]" />
                                <p className="text-xs font-bold uppercase text-main-500">
                                    Étape n°2
                                </p>
                            </div>

                            <div className="absolute right-[140px] top-[230px] flex items-center gap-2">
                                <div className="h-4 w-4 rounded-full bg-main-500 shadow-[0_0_22px_rgba(249,58,89,0.75)]" />
                                <p className="text-xs font-bold uppercase text-main-500">
                                    Étape n°3
                                </p>
                            </div>
                        </div>

                        <div className="flex min-h-0 flex-col">
                            <div className="grid shrink-0 grid-cols-2 gap-5">
                                <div>
                                    <label className="mb-3 block text-lg font-bold text-text-main">
                                        Point de rendez vous
                                    </label>

                                    <input
                                        value={mapForm.location}
                                        onChange={(event) =>
                                            setMapForm({
                                                ...mapForm,
                                                location: event.target.value,
                                            })
                                        }
                                        className="w-full rounded-md bg-bg-3 px-4 py-3 text-sm font-semibold text-text-main outline-none placeholder:text-text-secondary/40 focus:bg-bg-4"
                                        placeholder="30-32 avenue de la République, Villejuif"
                                    />
                                </div>

                                <div>
                                    <label className="mb-3 block text-lg font-bold text-text-main">
                                        Membre à localiser
                                    </label>

                                    <div className="flex items-center justify-between rounded-md bg-bg-3 px-4 py-3">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-bg-4 text-sm font-bold text-text-main">
                                                {getImageSrc(maraud.author.picture) ? (
                                                    <Image
                                                        src={getImageSrc(maraud.author.picture) as string}
                                                        alt={maraud.author.name}
                                                        width={40}
                                                        height={40}
                                                        className="h-full w-full object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    getInitial(maraud.author.name)
                                                )}
                                            </div>

                                            <div>
                                                <p className="text-sm font-bold text-text-main">
                                                    {maraud.author.name}
                                                </p>
                                                <p className="text-[10px] font-bold uppercase text-main-500">
                                                    Membre
                                                </p>
                                            </div>
                                        </div>

                                        <i className="bi bi-chevron-down text-text-secondary"></i>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-7 flex shrink-0 items-center justify-between">
                                <h3 className="text-xl font-bold text-text-main">
                                    Parcour à suivre
                                </h3>

                                <button
                                    type="button"
                                    onClick={openCreateStopPanel}
                                    disabled={isUpdating}
                                    className={`${BUTTON_ANIMATION} flex items-center gap-2 rounded-md bg-main-500 px-4 py-2 text-sm font-semibold text-white hover:bg-main-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`}
                                >
                                    <i className="bi bi-plus-lg text-sm"></i>
                                    Ajouter une étape
                                </button>
                            </div>

                            <div className="dark-vertical-scrollbar mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
                                {sortedStops.length === 0 ? (
                                    <div className="rounded-md bg-bg-3 px-4 py-4 text-sm text-text-secondary">
                                        Aucune étape renseignée.
                                    </div>
                                ) : (
                                    sortedStops.map((stop, index) => (
                                        <div
                                            key={stop.id}
                                            className="flex items-center justify-between rounded-md bg-bg-3 px-4 py-3"
                                        >
                                            <div className="flex items-center gap-5">
                                                <p className="w-12 text-base font-bold text-text-main">
                                                    {stop.time ? formatTime(stop.time) : "--.--"}
                                                </p>

                                                <div>
                                                    <p className="text-[10px] font-bold uppercase text-main-500">
                                                        Étape n°{index + 1}
                                                    </p>
                                                    <p className="text-sm font-bold text-text-main">
                                                        {stop.address}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteStop(stop)}
                                                    disabled={isUpdating}
                                                    className={`${ICON_BUTTON_ANIMATION} flex h-9 w-9 items-center justify-center rounded-md bg-bg-4 text-text-main hover:bg-main-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`}
                                                >
                                                    <i className="bi bi-trash3-fill text-sm"></i>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => openEditStopPanel(stop)}
                                                    disabled={isUpdating}
                                                    className={`${ICON_BUTTON_ANIMATION} flex h-9 w-9 items-center justify-center rounded-md bg-bg-4 text-text-main hover:bg-bg-5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`}
                                                >
                                                    <i className="bi bi-pencil text-sm"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-7 flex shrink-0 justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isUpdating}
                                    className={`${BUTTON_ANIMATION} rounded-md bg-bg-3 px-5 py-3 text-sm font-semibold text-text-main hover:bg-bg-4 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`}
                                >
                                    Annuler
                                </button>

                                <button
                                    type="button"
                                    onClick={saveMapSettings}
                                    disabled={isUpdating}
                                    className={`${BUTTON_ANIMATION} flex items-center gap-2 rounded-md bg-main-500 px-5 py-3 text-sm font-semibold text-white hover:bg-main-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`}
                                >
                                    <i className="bi bi-save text-sm"></i>
                                    Enregistrer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isStopFormOpen && (
                <StopFormModal
                    maraud={maraud}
                    stop={editingStop}
                    isUpdating={isUpdating}
                    setIsUpdating={setIsUpdating}
                    onClose={() => {
                        setIsStopFormOpen(false);
                        setEditingStop(null);
                    }}
                    onUpdated={(updated) => {
                        onUpdated(updated);
                        setIsStopFormOpen(false);
                        setEditingStop(null);
                    }}
                    onError={setMapPanelError}
                />
            )}
        </>
    );
}