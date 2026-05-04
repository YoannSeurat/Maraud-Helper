"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/api/user";

const BUTTON_ANIMATION =
    "cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-95";

export default function MobileOnlyPage() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error(error);
        } finally {
            router.push("/login");
            router.refresh();
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-bg px-6 py-8 text-text-main">
            <div className="mb-12 flex items-center gap-3">
                <Image
                    src="/assets/logo.svg"
                    alt="logo"
                    width={31}
                    height={31}
                    style={{
                        width: "31px",
                        height: "31px",
                    }}
                />

                <p className="text-2xl font-bold tracking-tight text-text-main">
                    Maraud <span className="text-main-500">Helper</span>
                </p>
            </div>

            <div className="flex flex-1 items-center justify-center">
                <div className="w-full max-w-lg rounded-2xl bg-bg-2 p-8 text-center shadow-2xl">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-main-500/10 text-main-500">
                        <i className="bi bi-phone text-3xl"></i>
                    </div>

                    <h1 className="text-2xl font-bold text-text-main">
                        Interface membre disponible sur mobile
                    </h1>

                    <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                        Ton compte est configuré avec le rôle membre. L’interface de gestion
                        sur ordinateur est réservée aux administrateurs. Pour accéder à ton
                        espace membre, connecte-toi depuis ton téléphone.
                    </p>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className={`${BUTTON_ANIMATION} mt-8 rounded-md bg-main-500 px-5 py-3 text-sm font-semibold text-white hover:bg-main-600`}
                    >
                        Se déconnecter
                    </button>
                </div>
            </div>
        </div>
    );
}