"use client";

import { useMemo, useState } from "react";
import {
    ApiStockItem,
    createStock,
    updateStock,
} from "@/lib/api/stocks";

const BUTTON_ANIMATION =
    "cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-95";

type StockResourceModalProps = {
    stock?: ApiStockItem | null;
    categories: string[];
    defaultCategory?: string;
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
    onClose: () => void;
    onSaved: (stock: ApiStockItem) => void;
    onError: (message: string | null) => void;
};

export default function StockResourceModal({
                                               stock,
                                               categories,
                                               defaultCategory,
                                               isLoading,
                                               setIsLoading,
                                               onClose,
                                               onSaved,
                                               onError,
                                           }: StockResourceModalProps) {
    const uniqueCategories = useMemo(() => {
        return Array.from(new Set(categories)).sort((a, b) => a.localeCompare(b));
    }, [categories]);

    const [form, setForm] = useState({
        name: stock?.name ?? "",
        category: stock?.category ?? defaultCategory ?? uniqueCategories[0] ?? "",
        currentCount: String(stock?.currentCount ?? ""),
        unit: stock?.unit ?? "",
    });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const currentCount = Number(form.currentCount);

        try {
            setIsLoading(true);
            onError(null);

            if (!form.name.trim()) {
                onError("Le nom de la ressource est obligatoire.");
                return;
            }

            if (!form.category.trim()) {
                onError("La catégorie est obligatoire.");
                return;
            }

            if (!Number.isInteger(currentCount) || currentCount < 0) {
                onError("La quantité doit être un entier positif ou nul.");
                return;
            }

            const payload = {
                name: form.name.trim(),
                category: form.category.trim(),
                currentCount,
                unit: form.unit.trim() || null,
            };

            const savedStock = stock
                ? await updateStock(stock.id, payload)
                : await createStock(payload);

            onSaved(savedStock);
        } catch (error) {
            console.error(error);
            onError(
                error instanceof Error
                    ? error.message
                    : "Erreur lors de l'enregistrement de la ressource."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000099] backdrop-blur-md p-4">
            <div className="w-full max-w-md rounded-xl bg-[#231212] p-7 shadow-2xl">
                <h2 className="mb-6 text-xl font-bold text-white">
                    {stock ? "Modifier la ressource" : "Ajouter une ressource"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                            placeholder="Lait demi écrémé"
                            className="w-full rounded-md bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:bg-white/15"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase text-main-500">
                            Catégorie
                        </label>
                        <input
                            required
                            list="stock-categories"
                            value={form.category}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    category: event.target.value,
                                })
                            }
                            placeholder="Alimentaire"
                            className="w-full rounded-md bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:bg-white/15"
                        />

                        <datalist id="stock-categories">
                            {uniqueCategories.map((category) => (
                                <option key={category} value={category} />
                            ))}
                        </datalist>
                    </div>

                    <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase text-main-500">
                            Quantité
                        </label>
                        <input
                            required
                            type="number"
                            min={0}
                            value={form.currentCount}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    currentCount: event.target.value,
                                })
                            }
                            placeholder="250"
                            className="w-full rounded-md bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:bg-white/15"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase text-main-500">
                            Unité
                        </label>
                        <input
                            value={form.unit}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    unit: event.target.value,
                                })
                            }
                            placeholder="bouteilles, pièces, kg..."
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
                            {isLoading ? "Enregistrement..." : "Enregistrer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}