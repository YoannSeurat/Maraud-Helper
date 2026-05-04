"use client";

import { useState } from "react";
import { createStockCategory } from "@/lib/api/stocks";

const BUTTON_ANIMATION =
    "cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-95";

type StockCategoryModalProps = {
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
    onClose: () => void;
    onCreated: (category: string) => void;
    onError: (message: string | null) => void;
};

export default function StockCategoryModal({
                                               isLoading,
                                               setIsLoading,
                                               onClose,
                                               onCreated,
                                               onError,
                                           }: StockCategoryModalProps) {
    const [category, setCategory] = useState("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            setIsLoading(true);
            onError(null);

            if (!category.trim()) {
                onError("Le nom de la catégorie est obligatoire.");
                return;
            }

            const result = await createStockCategory(category.trim());

            onCreated(result.category);
        } catch (error) {
            console.error(error);
            onError(
                error instanceof Error
                    ? error.message
                    : "Erreur lors de la création de la catégorie."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000099] backdrop-blur-md p-4">
            <div className="w-full max-w-md rounded-xl bg-[#231212] p-7 shadow-2xl">
                <h2 className="mb-6 text-xl font-bold text-white">
                    Ajouter une catégorie
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase text-main-500">
                            Nom de la catégorie
                        </label>
                        <input
                            required
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                            placeholder="Alimentaire"
                            className="w-full rounded-md bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:bg-white/15"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className={`${BUTTON_ANIMATION} flex-1 rounded-md bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed`}
                        >
                            Annuler
                        </button>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`${BUTTON_ANIMATION} flex-1 rounded-md bg-main-500 px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed`}
                        >
                            {isLoading ? "Création..." : "Créer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}