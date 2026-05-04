"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
    ApiCurrentUser,
    getCurrentUser,
    logoutUser,
    updateCurrentUser,
} from "@/lib/api/user";

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

export default function UserCard() {
    const router = useRouter();

    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<ApiCurrentUser | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: "",
        mail: "",
        picture: "",
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetchUser = async () => {
        try {
            const data = await getCurrentUser();

            setUser(data);
            setForm({
                name: data.name,
                mail: data.mail,
                picture: data.picture ?? "",
            });
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await logoutUser();
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error(error);
            router.push("/login");
        }
    };

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

    const handleSubmitProfile = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        try {
            setIsLoading(true);
            setProfileError(null);

            const updated = await updateCurrentUser({
                name: form.name,
                mail: form.mail,
                picture: form.picture || null,
            });

            setUser(updated);
            setIsProfileOpen(false);
        } catch (error) {
            console.error(error);
            setProfileError(
                error instanceof Error
                    ? error.message
                    : "Erreur lors de la modification du profil."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const imageSrc = getImageSrc(user?.picture);

    const profileModal =
        isProfileOpen && mounted
            ? createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
                    <div className="w-full max-w-md rounded-2xl bg-bg-2 p-7 shadow-2xl">
                        <h2 className="mb-6 text-xl font-bold text-text-main">
                            Informations personnelles
                        </h2>

                        {profileError && (
                            <div className="mb-4 rounded-lg bg-secondary-500/10 px-4 py-3 text-sm text-secondary-700">
                                {profileError}
                            </div>
                        )}

                        <form onSubmit={handleSubmitProfile} className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-bg-4 text-lg font-bold text-text-main">
                                    {getImageSrc(form.picture) ? (
                                        <Image
                                            src={getImageSrc(form.picture) as string}
                                            alt="Profil"
                                            width={64}
                                            height={64}
                                            className="h-full w-full object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        getInitial(form.name)
                                    )}
                                </div>

                                <label
                                    className={`${BUTTON_ANIMATION} rounded-md bg-bg-4 px-4 py-2 text-sm font-semibold text-text-main hover:bg-bg-5`}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(event) =>
                                            handlePictureFile(event.target.files?.[0] ?? null)
                                        }
                                    />
                                    Importer une photo
                                </label>
                            </div>

                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase text-main-500">
                                    Nom
                                </label>
                                <input
                                    required
                                    value={form.name}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            name: event.target.value,
                                        })
                                    }
                                    className="w-full rounded-md bg-bg-3 px-4 py-3 text-sm text-text-main outline-none placeholder:text-text-secondary/40 focus:bg-bg-4"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase text-main-500">
                                    Email
                                </label>
                                <input
                                    required
                                    type="email"
                                    value={form.mail}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            mail: event.target.value,
                                        })
                                    }
                                    className="w-full rounded-md bg-bg-3 px-4 py-3 text-sm text-text-main outline-none placeholder:text-text-secondary/40 focus:bg-bg-4"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => setIsProfileOpen(false)}
                                    className={`${BUTTON_ANIMATION} flex-1 rounded-md bg-bg-3 px-4 py-3 text-sm font-semibold text-text-main hover:bg-bg-4 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`}
                                >
                                    Annuler
                                </button>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`${BUTTON_ANIMATION} flex-1 rounded-md bg-main-500 px-4 py-3 text-sm font-semibold text-white hover:bg-main-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`}
                                >
                                    {isLoading ? "Enregistrement..." : "Enregistrer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )
            : null;

    return (
        <>
            <div className="flex items-center gap-4 rounded-full bg-bg-2 px-5 py-3">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-text-main text-bg text-base font-bold">
                    {imageSrc ? (
                        <Image
                            src={imageSrc}
                            alt={user?.name ?? "Profil"}
                            width={44}
                            height={44}
                            className="h-full w-full object-cover"
                            unoptimized
                        />
                    ) : (
                        getInitial(user?.name ?? "U")
                    )}
                </div>

                <div className="pr-4">
                    <p className="text-base font-bold text-text-main">
                        {user?.name ?? "Utilisateur"}
                    </p>
                    <p className="text-sm font-medium text-main-500">
                        {user?.isAdmin ? "Admin" : "Membre"}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsProfileOpen(true)}
                    className={`${ICON_BUTTON_ANIMATION} text-text-main/85 hover:text-text-main`}
                    aria-label="Modifier mon profil"
                >
                    <i className="bi bi-gear-fill text-xl"></i>
                </button>

                <button
                    type="button"
                    onClick={handleLogout}
                    className={`${ICON_BUTTON_ANIMATION} text-main-500 hover:text-main-400`}
                    aria-label="Déconnexion"
                >
                    <i className="bi bi-door-open text-xl"></i>
                </button>
            </div>

            {profileModal}
        </>
    );
}