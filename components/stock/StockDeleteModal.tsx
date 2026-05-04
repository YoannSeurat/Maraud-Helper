"use client";

import { ApiStockItem } from "@/lib/api/stocks";

const BUTTON_ANIMATION =
    "cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-95";

type StockDeleteModalProps = {
    stock: ApiStockItem;
    isLoading: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

export default function StockDeleteModal({
                                             stock,
                                             isLoading,
                                             onCancel,
                                             onConfirm,
                                         }: StockDeleteModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000099] backdrop-blur-md p-4">
            <div className="w-full max-w-md rounded-xl bg-[#231212] p-7 shadow-2xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
                    <i className="bi bi-trash3-fill text-xl"></i>
                </div>

                <h2 className="mb-2 text-xl font-bold text-white">
                    Supprimer la ressource ?
                </h2>

                <p className="text-sm leading-relaxed text-white/55">
                    Cette action supprimera définitivement{" "}
                    <span className="font-semibold text-white/85">{stock.name}</span> de
                    l’inventaire.
                </p>

                <div className="mt-7 flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className={`${BUTTON_ANIMATION} flex-1 rounded-md bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed`}
                    >
                        Annuler
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`${BUTTON_ANIMATION} flex-1 rounded-md bg-main-500 px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed`}
                    >
                        {isLoading ? "Suppression..." : "Supprimer"}
                    </button>
                </div>
            </div>
        </div>
    );
}