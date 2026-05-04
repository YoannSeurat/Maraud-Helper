"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
    MobileUser,
    getMobileProfile,
    updateMobileProfile,
} from "@/lib/api/mobile";

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

export default function MobileProfilPage() {
    const [user, setUser] = useState<MobileUser | null>(null);
    const [form, setForm] = useState({
        name: "",
        mail: "",
        password: "",
        picture: "",
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);

            const data = await getMobileProfile();

            setUser(data);
            setForm({
                name: data.name,
                mail: data.mail,
                password: "",
                picture: data.picture ?? "",
            });
        } catch (error) {
            console.error(error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Impossible de récupérer ton profil."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handlePictureFile = (file: File | null) => {
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result;

            if (typeof result === "string") {
                setForm((prev) => ({
                    ...prev,
                    picture: result,
                }));
            }
        };

        reader.readAsDataURL(file);
    };

    const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            setIsSaving(true);
            setMessage(null);
            setErrorMessage(null);

            const payload: {
                name?: string;
                mail?: string;
                password?: string;
                picture?: string | null;
            } = {};

            if (form.name.trim() && form.name.trim() !== user?.name) {
                payload.name = form.name.trim();
            }

            if (form.mail.trim() && form.mail.trim() !== user?.mail) {
                payload.mail = form.mail.trim();
            }

            if (form.password.trim()) {
                payload.password = form.password;
            }

            if (form.picture !== (user?.picture ?? "")) {
                payload.picture = form.picture || null;
            }

            const updated = await updateMobileProfile(payload);

            setUser(updated);
            setForm({
                name: updated.name,
                mail: updated.mail,
                password: "",
                picture: updated.picture ?? "",
            });

            setMessage("Profil sauvegardé.");
        } catch (error) {
            console.error(error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Erreur lors de la sauvegarde du profil."
            );
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <main className="px-8">
                <p className="mt-12 text-center text-text-secondary">Chargement...</p>
            </main>
        );
    }

    const imageSrc = getImageSrc(form.picture);

    return (
        <main className="px-8">
            {errorMessage && (
                <div className="mb-5 rounded-xl bg-secondary-500/10 px-4 py-3 text-sm text-secondary-700">
                    {errorMessage}
                </div>
            )}

            {message && (
                <div className="mb-5 rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-400">
                    {message}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-10">
                <div className="flex items-center gap-7 pt-2">
                    <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full bg-text-main text-bg text-xl font-bold">
                        {imageSrc ? (
                            <Image
                                src={imageSrc}
                                alt={form.name}
                                width={72}
                                height={72}
                                className="h-full w-full object-cover"
                                unoptimized
                            />
                        ) : (
                            getInitial(form.name)
                        )}
                    </div>

                    <label className="rounded-md bg-main-500 px-5 py-3 text-lg font-medium text-white active:scale-95">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) =>
                                handlePictureFile(event.target.files?.[0] ?? null)
                            }
                        />
                        Changer la photo
                    </label>
                </div>

                <div>
                    <label className="mb-3 block text-xl font-bold text-text-main">
                        Nom
                    </label>
                    <input
                        value={form.name}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                name: event.target.value,
                            })
                        }
                        className="h-11 w-full rounded-md bg-bg-3 px-4 text-base text-text-main outline-none placeholder:text-text-secondary/40 focus:bg-bg-4"
                    />
                </div>

                <div>
                    <label className="mb-3 block text-xl font-bold text-text-main">
                        Email
                    </label>
                    <input
                        type="email"
                        value={form.mail}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                mail: event.target.value,
                            })
                        }
                        className="h-11 w-full rounded-md bg-bg-3 px-4 text-base text-text-main outline-none placeholder:text-text-secondary/40 focus:bg-bg-4"
                    />
                </div>

                <div>
                    <label className="mb-3 block text-xl font-bold text-text-main">
                        Nouveau mot de passe
                    </label>
                    <input
                        type="password"
                        value={form.password}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                password: event.target.value,
                            })
                        }
                        placeholder="****"
                        className="h-11 w-full rounded-md bg-bg-3 px-4 text-base text-text-main outline-none placeholder:text-text-secondary/60 focus:bg-bg-4"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="h-11 w-full rounded-md bg-main-500 text-base font-semibold text-white transition-all duration-150 active:scale-95 disabled:opacity-60"
                >
                    {isSaving ? "Sauvegarde..." : "Sauvegarder"}
                </button>
            </form>
        </main>
    );
}