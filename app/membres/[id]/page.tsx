"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
    ApiMemberDetail,
    ApiMemberMaraud,
    getMemberDetail,
    unregisterMemberFromMaraud,
} from "@/lib/api/members";
import ConfirmDeleteModal from "@/components/maraudes/ConfirmDeleteModal";

const BUTTON_ANIMATION =
    "cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-95";

const ICON_BUTTON_ANIMATION =
    "cursor-pointer transition-all duration-150 hover:scale-110 active:scale-95";

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

const getInitial = (name: string) => {
    return name.trim().charAt(0).toUpperCase() || "?";
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
    });
};

const formatTime = (dateString: string) => {
    return new Date(dateString)
        .toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        })
        .replace(":", ".");
};

function getMaraudProgress(maraud: ApiMemberMaraud) {
    const usages = maraud.tasks.flatMap((task) => task.stockUsages);
    const total = usages.reduce((sum, usage) => sum + usage.quantity, 0);
    const done = usages.reduce(
        (sum, usage) => sum + Math.min(usage.completedCount, usage.quantity),
        0
    );

    if (total === 0) return 0;

    return Math.round((done / total) * 100);
}

function getMaraudUnits(maraud: ApiMemberMaraud) {
    const usages = maraud.tasks.flatMap((task) => task.stockUsages);
    const total = usages.reduce((sum, usage) => sum + usage.quantity, 0);
    const done = usages.reduce(
        (sum, usage) => sum + Math.min(usage.completedCount, usage.quantity),
        0
    );

    return { total, done };
}

type MaraudMemberRowProps = {
    maraud: ApiMemberMaraud;
    onOpen: () => void;
    onUnregister: () => void;
};

function MaraudMemberRow({
                             maraud,
                             onOpen,
                             onUnregister,
                         }: MaraudMemberRowProps) {
    const progress = getMaraudProgress(maraud);
    const { total, done } = getMaraudUnits(maraud);
    const authorImage = getImageSrc(maraud.author.picture);

    return (
        <div className="rounded-xl bg-bg-2 px-4 py-4">
            <div className="flex items-center justify-between gap-5">
                <button
                    type="button"
                    onClick={onOpen}
                    className="group flex min-w-0 flex-1 items-center gap-4 text-left"
                >
                    <div className="h-14 w-16 shrink-0 overflow-hidden rounded-md bg-bg">
                        {maraud.thumbnail ? (
                            <Image
                                src={maraud.thumbnail}
                                alt={maraud.name}
                                width={64}
                                height={56}
                                className="h-full w-full object-cover opacity-60"
                                unoptimized
                            />
                        ) : (
                            <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.14),transparent_20%),linear-gradient(135deg,rgba(255,255,255,0.10),rgba(255,255,255,0.02)),linear-gradient(45deg,#333,#111)] opacity-70" />
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase text-main-500">
                            {formatDate(maraud.date)}
                        </p>

                        <p className="truncate text-base font-bold text-text-main transition-colors group-hover:text-main-500">
                            {maraud.name}
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                            <div className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full bg-bg-4 text-[9px] font-bold text-text-main">
                                {authorImage ? (
                                    <Image
                                        src={authorImage}
                                        alt={maraud.author.name}
                                        width={16}
                                        height={16}
                                        className="h-full w-full object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    getInitial(maraud.author.name)
                                )}
                            </div>

                            <span className="text-xs text-text-secondary">
                {maraud.author.name}
              </span>
                        </div>
                    </div>
                </button>

                <div className="hidden min-w-[220px] items-center gap-3 text-text-secondary lg:flex">
                    <i className="bi bi-map text-sm"></i>
                    <span className="truncate text-sm">{maraud.location}</span>
                </div>

                <div className="hidden items-center gap-3 text-text-secondary xl:flex">
                    <i className="bi bi-clock text-sm"></i>
                    <span className="text-sm">
            {formatTime(maraud.date)} → {formatTime(maraud.endDate)}
          </span>
                </div>

                <div className="hidden w-[160px] xl:block">
                    <div className="mb-1 flex items-center justify-between text-xs text-text-secondary">
                        <span>Progression</span>
                        <span>{progress}%</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-bg-4">
                        <div
                            className="h-full rounded-full bg-main-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <p className="mt-1 text-right text-[10px] text-text-secondary">
                        {done}/{total} unités
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onUnregister}
                        className={`${BUTTON_ANIMATION} rounded-md bg-bg-3 px-3 py-2 text-xs font-semibold text-text-main hover:bg-secondary-500`}
                    >
                        Désinscrire
                    </button>

                    <button
                        type="button"
                        onClick={onOpen}
                        className={`${ICON_BUTTON_ANIMATION} flex h-9 w-9 items-center justify-center rounded-md bg-main-500 text-white hover:bg-main-600`}
                        aria-label="Voir la maraude"
                    >
                        <i className="bi bi-arrow-up-right text-sm"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MemberDetailPage() {
    const params = useParams();
    const router = useRouter();

    const memberId = Number(params.id);

    const [member, setMember] = useState<ApiMemberDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUnregistering, setIsUnregistering] = useState(false);
    const [maraudToUnregister, setMaraudToUnregister] =
        useState<ApiMemberMaraud | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchMember = async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);

            const data = await getMemberDetail(memberId);

            setMember(data);
        } catch (error) {
            console.error(error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Impossible de récupérer le membre."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (Number.isInteger(memberId)) {
            fetchMember();
        }
    }, [memberId]);

    const upcomingMaraudes = useMemo(() => {
        if (!member) return [];

        const now = new Date();

        return member.maraudes.filter((maraud) => {
            return !maraud.isFinished && new Date(maraud.endDate) >= now;
        });
    }, [member]);

    const finishedMaraudes = useMemo(() => {
        if (!member) return [];

        const now = new Date();

        return member.maraudes.filter((maraud) => {
            return maraud.isFinished || new Date(maraud.endDate) < now;
        });
    }, [member]);

    const handleConfirmUnregister = async () => {
        if (!member || !maraudToUnregister) return;

        try {
            setIsUnregistering(true);
            setErrorMessage(null);

            const updated = await unregisterMemberFromMaraud(
                member.id,
                maraudToUnregister.id
            );

            setMember(updated);
            setMaraudToUnregister(null);
        } catch (error) {
            console.error(error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Erreur lors de la désinscription."
            );
        } finally {
            setIsUnregistering(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-bg text-text-main">
                <p className="text-text-secondary">Chargement...</p>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-bg text-text-main">
                <div className="text-center">
                    <p className="mb-4 text-text-secondary">
                        {errorMessage ?? "Membre introuvable."}
                    </p>

                    <button
                        type="button"
                        onClick={() => router.push("/tableau-de-bord")}
                        className={`${BUTTON_ANIMATION} rounded-md bg-main-500 px-5 py-3 font-semibold text-white hover:bg-main-600`}
                    >
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    const pictureSrc = getImageSrc(member.picture);

    return (
        <div className="min-h-screen bg-bg pb-32 text-text-main">
            <main className="px-16 pt-6">
                <div className="mb-9">
                    <button
                        type="button"
                        onClick={() => router.push("/tableau-de-bord")}
                        className={`${ICON_BUTTON_ANIMATION} mb-4 text-text-main/85 hover:text-text-main`}
                        aria-label="Retour"
                    >
                        <i className="bi bi-arrow-left text-2xl"></i>
                    </button>

                    <p className="mb-2 text-sm font-bold uppercase tracking-wider text-main-500">
                        Gestion du membre
                    </p>

                    <div className="flex items-center gap-5">
                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-bg-2 text-2xl font-bold text-text-main">
                            {pictureSrc ? (
                                <Image
                                    src={pictureSrc}
                                    alt={member.name}
                                    width={80}
                                    height={80}
                                    className="h-full w-full object-cover"
                                    unoptimized
                                />
                            ) : (
                                getInitial(member.name)
                            )}
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-text-main">
                                {member.name}
                            </h1>

                            <p className="mt-1 text-base text-text-secondary">
                                {member.mail}
                            </p>

                            <p
                                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${
                                    member.isAdmin
                                        ? "bg-main-500/10 text-main-500"
                                        : "bg-bg-2 text-text-secondary"
                                }`}
                            >
                                {member.isAdmin ? "Admin" : "Membre"}
                            </p>
                        </div>
                    </div>
                </div>

                {errorMessage && (
                    <div className="mb-6 rounded-lg bg-secondary-500/10 px-5 py-4 text-sm text-secondary-700">
                        {errorMessage}
                    </div>
                )}

                <div className="mb-8 grid grid-cols-4 gap-6">
                    <div className="rounded-xl bg-bg-2 px-5 py-5">
                        <div className="flex items-center gap-3">
                            <i className="bi bi-person-walking text-2xl text-text-main/80"></i>
                            <p className="text-3xl font-bold text-text-main">
                                {member.stats.inscriptionsCount}
                            </p>
                        </div>
                        <p className="mt-1 text-[10px] font-medium text-text-secondary">
                            Maraudes suivies
                        </p>
                    </div>

                    <div className="rounded-xl bg-bg-2 px-5 py-5">
                        <div className="flex items-center gap-3">
                            <i className="bi bi-calendar-check text-2xl text-text-main/80"></i>
                            <p className="text-3xl font-bold text-text-main">
                                {member.stats.finishedMaraudsCount}
                            </p>
                        </div>
                        <p className="mt-1 text-[10px] font-medium text-text-secondary">
                            Maraudes terminées
                        </p>
                    </div>

                    <div className="rounded-xl bg-bg-2 px-5 py-5">
                        <div className="flex items-center gap-3">
                            <i className="bi bi-briefcase text-2xl text-text-main/80"></i>
                            <p className="text-3xl font-bold text-text-main">
                                {member.stats.totalTasksCount}
                            </p>
                        </div>
                        <p className="mt-1 text-[10px] font-medium text-text-secondary">
                            Tâches associées
                        </p>
                    </div>

                    <div className="rounded-xl bg-bg-2 px-5 py-5">
                        <div className="flex items-center gap-3">
                            <i className="bi bi-box-seam-fill text-2xl text-text-main/80"></i>
                            <p className="text-3xl font-bold text-text-main">
                                {member.stats.totalStockUnitsCompleted}/
                                {member.stats.totalStockUnitsPlanned}
                            </p>
                        </div>
                        <p className="mt-1 text-[10px] font-medium text-text-secondary">
                            Unités complétées
                        </p>
                    </div>
                </div>

                <section className="mb-10">
                    <h2 className="mb-4 text-2xl font-bold text-text-main">
                        Maraudes à venir
                    </h2>

                    <div className="space-y-3">
                        {upcomingMaraudes.length === 0 ? (
                            <div className="rounded-xl bg-bg-2 px-5 py-6 text-center text-text-secondary">
                                Ce membre n’est inscrit à aucune maraude à venir.
                            </div>
                        ) : (
                            upcomingMaraudes.map((maraud) => (
                                <MaraudMemberRow
                                    key={maraud.id}
                                    maraud={maraud}
                                    onOpen={() => router.push(`/maraudes/${maraud.id}`)}
                                    onUnregister={() => setMaraudToUnregister(maraud)}
                                />
                            ))
                        )}
                    </div>
                </section>

                <section>
                    <h2 className="mb-4 text-2xl font-bold text-text-main">
                        Maraudes passées
                    </h2>

                    <div className="space-y-3 opacity-75">
                        {finishedMaraudes.length === 0 ? (
                            <div className="rounded-xl bg-bg-2 px-5 py-6 text-center text-text-secondary">
                                Aucune maraude passée.
                            </div>
                        ) : (
                            finishedMaraudes.map((maraud) => (
                                <MaraudMemberRow
                                    key={maraud.id}
                                    maraud={maraud}
                                    onOpen={() => router.push(`/maraudes/${maraud.id}`)}
                                    onUnregister={() => setMaraudToUnregister(maraud)}
                                />
                            ))
                        )}
                    </div>
                </section>
            </main>

            {maraudToUnregister && (
                <ConfirmDeleteModal
                    title="Désinscrire le membre ?"
                    message={
                        <>
                            Cette action désinscrira{" "}
                            <span className="font-semibold text-text-main">
                {member.name}
              </span>{" "}
                            de la maraude{" "}
                            <span className="font-semibold text-text-main">
                {maraudToUnregister.name}
              </span>
                            .
                        </>
                    }
                    iconClassName="bi bi-person-dash"
                    iconContainerClassName="bg-secondary-500/10 text-secondary-600"
                    confirmLabel="Désinscrire"
                    loadingLabel="Désinscription..."
                    isLoading={isUnregistering}
                    onCancel={() => {
                        if (!isUnregistering) {
                            setMaraudToUnregister(null);
                        }
                    }}
                    onConfirm={handleConfirmUnregister}
                />
            )}
        </div>
    );
}