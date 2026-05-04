"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    MobileMaraud,
    getMobileRegisteredMaraudes,
    unregisterFromMaraud,
} from "@/lib/api/mobile";
import MobileMaraudCard from "@/components/mobile/MobileMaraudCard";

const isMaraudInProgress = (maraud: MobileMaraud) => {
    const now = new Date().getTime();
    const start = new Date(maraud.date).getTime();
    const end = new Date(maraud.endDate).getTime();

    return now >= start && now <= end;
};

export default function MobileMesMaraudesPage() {
    const router = useRouter();

    const [maraudes, setMaraudes] = useState<MobileMaraud[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchMaraudes = async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);

            const data = await getMobileRegisteredMaraudes();

            setMaraudes(data);
        } catch (error) {
            console.error(error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Impossible de récupérer tes maraudes."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMaraudes();
    }, []);

    const inProgressMaraudes = useMemo(() => {
        return maraudes.filter(isMaraudInProgress);
    }, [maraudes]);

    const upcomingRegistered = useMemo(() => {
        return maraudes.filter((maraud) => !isMaraudInProgress(maraud));
    }, [maraudes]);

    const handleUnregister = async (maraud: MobileMaraud) => {
        try {
            setUpdatingId(maraud.id);
            setErrorMessage(null);

            await unregisterFromMaraud(maraud.id);

            setMaraudes((prev) => prev.filter((item) => item.id !== maraud.id));
        } catch (error) {
            console.error(error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Erreur lors de la désinscription."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <main className="px-8">
            {errorMessage && (
                <div className="mb-5 rounded-xl bg-secondary-500/10 px-4 py-3 text-sm text-secondary-700">
                    {errorMessage}
                </div>
            )}

            {isLoading ? (
                <p className="mt-12 text-center text-text-secondary">Chargement...</p>
            ) : (
                <div className="space-y-10">
                    {inProgressMaraudes.length > 0 && (
                        <section>
                            <div className="mb-5 flex items-center gap-3">
                                <i className="bi bi-broadcast-pin text-xl text-main-500"></i>
                                <h1 className="text-[25px] font-bold text-text-main">
                                    Maraudes en cours
                                </h1>
                            </div>

                            <div className="space-y-5">
                                {inProgressMaraudes.map((maraud) => (
                                    <div
                                        key={maraud.id}
                                        className={
                                            updatingId === maraud.id ? "pointer-events-none opacity-70" : ""
                                        }
                                    >
                                        <MobileMaraudCard
                                            maraud={maraud}
                                            buttonLabel="Passer en mode maraude"
                                            buttonVariant="filled"
                                            onAction={() =>
                                                router.push(`/mobile/maraudes/${maraud.id}/mode`)
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section>
                        <h2 className="mb-5 text-[25px] font-bold text-text-main">
                            Mes prochaines maraudes
                        </h2>

                        {upcomingRegistered.length === 0 ? (
                            <div className="rounded-2xl bg-bg-2 px-5 py-8 text-center text-text-secondary">
                                Tu n’es inscrit à aucune maraude à venir.
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {upcomingRegistered.map((maraud) => (
                                    <div
                                        key={maraud.id}
                                        className={
                                            updatingId === maraud.id ? "pointer-events-none opacity-70" : ""
                                        }
                                    >
                                        <MobileMaraudCard
                                            maraud={maraud}
                                            buttonLabel="Se désinscrire"
                                            buttonVariant="outline"
                                            onAction={handleUnregister}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}
        </main>
    );
}