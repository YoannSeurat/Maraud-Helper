"use client";

import React from "react";

const BUTTON_ANIMATION =
    "cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-95";

type ConfirmDeleteModalProps = {
    title: string;
    message: React.ReactNode;
    isLoading: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    iconClassName?: string;
    iconContainerClassName?: string;
    confirmLabel?: string;
    loadingLabel?: string;
};

export default function ConfirmDeleteModal({
                                               title,
                                               message,
                                               isLoading,
                                               onCancel,
                                               onConfirm,
                                               iconClassName = "bi bi-trash3-fill",
                                               iconContainerClassName = "bg-red-500/10 text-red-300",
                                               confirmLabel = "Supprimer",
                                               loadingLabel = "Suppression...",
                                           }: ConfirmDeleteModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-[#000000aa] backdrop-blur-md"
                onClick={() => {
                    if (!isLoading) onCancel();
                }}
            />

            <div className="relative w-full max-w-md rounded-2xl bg-[#231212] p-8 shadow-2xl">
                <div
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${iconContainerClassName}`}
                >
                    <i className={`${iconClassName} text-xl`}></i>
                </div>

                <h2 className="mb-2 text-xl font-bold text-white">{title}</h2>

                <p className="text-sm leading-relaxed text-white/55">{message}</p>

                <div className="mt-7 flex gap-3">
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={onCancel}
                        className={`${BUTTON_ANIMATION} flex-1 rounded-lg bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed`}
                    >
                        Annuler
                    </button>

                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={onConfirm}
                        className={`${BUTTON_ANIMATION} flex-1 rounded-lg bg-main-500 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed`}
                    >
                        {isLoading ? loadingLabel : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}