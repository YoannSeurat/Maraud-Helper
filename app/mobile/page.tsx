"use client";

import { useEffect, useState } from "react";
import {
    MobileMaraud,
    getMobileVisibleMaraudes,
    registerToMaraud,
    unregisterFromMaraud,
} from "@/lib/api/mobile";
import MobileMaraudCard from "@/components/mobile/MobileMaraudCard";

export default function MobileHomePage() {
    const [maraudes, setMaraudes] = useState<MobileMaraud[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchMaraudes = async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);

            const data = await getMobileVisibleMaraudes();

            setMaraudes(data);
        } catch (error) {
            console.error(error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Impossible de récupérer les maraudes."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMaraudes();
    }, []);

    const handleToggleRegister = async (maraud: MobileMaraud) => {
        try {
            setUpdatingId(maraud.id);
            setErrorMessage(null);

            const updated = maraud.isRegistered
                ? await unregisterFromMaraud(maraud.id)
                : await registerToMaraud(maraud.id);

            setMaraudes((prev) =>
                prev.map((item) => (item.id === updated.id ? updated : item))
            );
        } catch (error) {
            console.error(error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Erreur lors de la mise à jour de l'inscription."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <main className="px-8">
            <h1 className="mb-7 text-[25px] font-bold leading-tight text-text-main">
                Liste des prochaines maraudes
            </h1>

            {errorMessage && (
                <div className="mb-5 rounded-xl bg-secondary-500/10 px-4 py-3 text-sm text-secondary-700">
                    {errorMessage}
                </div>
            )}

            {isLoading ? (
                <p className="mt-12 text-center text-text-secondary">Chargement...</p>
            ) : maraudes.length === 0 ? (
                <div className="rounded-2xl bg-bg-2 px-5 py-8 text-center text-text-secondary">
                    Aucune maraude disponible.
                </div>
            ) : (
                <div className="space-y-5">
                    {maraudes.map((maraud) => (
                        <div
                            key={maraud.id}
                            className={updatingId === maraud.id ? "pointer-events-none opacity-70" : ""}
                        >
                            <MobileMaraudCard
                                maraud={maraud}
                                buttonLabel={maraud.isRegistered ? "Se désinscrire" : "S'inscrire"}
                                buttonVariant={maraud.isRegistered ? "outline" : "filled"}
                                onAction={handleToggleRegister}
                            />
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}