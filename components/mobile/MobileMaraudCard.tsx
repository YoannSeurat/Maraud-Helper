"use client";

import Image from "next/image";
import { MobileMaraud } from "@/lib/api/mobile";

type MobileMaraudCardProps = {
    maraud: MobileMaraud;
    buttonLabel: string;
    buttonVariant?: "filled" | "outline";
    onAction: (maraud: MobileMaraud) => void;
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

const getInitial = (name: string) => {
    return name.trim().charAt(0).toUpperCase() || "?";
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "2-digit",
    }).toUpperCase();
};

const formatTime = (dateString: string) => {
    const date = new Date(dateString);

    return date
        .toLocaleTimeString("fr-FR", {
            hour: "numeric",
            minute: "2-digit",
        })
        .replace(":", " ");
};

export default function MobileMaraudCard({
                                             maraud,
                                             buttonLabel,
                                             buttonVariant = "filled",
                                             onAction,
                                         }: MobileMaraudCardProps) {
    const previewUsers = maraud.inscriptions.slice(0, 2);

    return (
        <article className="rounded-2xl bg-bg-2 p-5 text-text-main">
            <div className="flex gap-4">
                <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-md bg-bg">
                    {maraud.thumbnail ? (
                        <Image
                            src={maraud.thumbnail}
                            alt={maraud.name}
                            width={72}
                            height={72}
                            className="h-full w-full object-cover opacity-55"
                            unoptimized
                        />
                    ) : (
                        <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_20%),linear-gradient(135deg,rgba(255,255,255,0.10),rgba(255,255,255,0.02)),linear-gradient(45deg,#333,#111)] opacity-80" />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase text-main-500">
                        {formatDate(maraud.date)}
                    </p>

                    <h2 className="mt-1 text-2xl font-bold leading-tight text-text-main">
                        {maraud.name}
                    </h2>

                    <div className="mt-2 flex items-center gap-2">
                        <div className="flex -space-x-1.5">
                            {previewUsers.map((inscription) => {
                                const src = getImageSrc(inscription.user.picture);

                                return (
                                    <div
                                        key={inscription.userId}
                                        className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-bg-4 text-[9px] font-bold text-text-main"
                                    >
                                        {src ? (
                                            <Image
                                                src={src}
                                                alt={inscription.user.name}
                                                width={20}
                                                height={20}
                                                className="h-full w-full object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            getInitial(inscription.user.name)
                                        )}
                                    </div>
                                );
                            })}

                            <div className="flex h-5 min-w-5 items-center justify-center rounded-full bg-main-500 px-1 text-[10px] font-bold text-white">
                                {maraud.inscriptions.length}
                            </div>
                        </div>

                        <span className="text-sm text-text-secondary">inscrits</span>
                    </div>
                </div>
            </div>

            <div className="mt-5 space-y-4 text-[15px] text-text-secondary">
                <div className="flex items-center gap-3">
                    <i className="bi bi-clock text-base"></i>
                    <span>
            {formatTime(maraud.date)} → {formatTime(maraud.endDate)}
          </span>
                </div>

                <div className="flex items-center gap-3">
                    <i className="bi bi-map text-base"></i>
                    <span>{maraud.location}</span>
                </div>
            </div>

            <button
                type="button"
                onClick={() => onAction(maraud)}
                className={`mt-6 h-11 w-full rounded-md text-base font-semibold transition-all duration-150 active:scale-95 ${
                    buttonVariant === "filled"
                        ? "bg-main-500 text-white hover:bg-main-600"
                        : "bg-transparent text-main-500 ring-1 ring-main-500 hover:bg-main-500/10"
                }`}
            >
                {buttonLabel}
            </button>
        </article>
    );
}