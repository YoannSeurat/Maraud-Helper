"use client";

import { useEffect, useMemo, useState } from "react";
import {
    ApiMaraud,
    ApiMaraudTask,
    ApiStockItem,
    createTaskStockUsage,
    searchStocks,
} from "@/lib/api/maraudes";

const BUTTON_ANIMATION =
    "cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-95";

type StockUsageModalProps = {
    task: ApiMaraudTask;
    isUpdating: boolean;
    setIsUpdating: (value: boolean) => void;
    onClose: () => void;
    onUpdated: (maraud: ApiMaraud) => void;
    onError: (message: string | null) => void;
};

function getReservedQuantity(stock: ApiStockItem) {
    return (stock.taskUsages ?? []).reduce((sum, usage) => sum + usage.quantity, 0);
}

export default function StockUsageModal({
                                            task,
                                            isUpdating,
                                            setIsUpdating,
                                            onClose,
                                            onUpdated,
                                            onError,
                                        }: StockUsageModalProps) {
    const [stockQuery, setStockQuery] = useState("");
    const [stockResults, setStockResults] = useState<ApiStockItem[]>([]);
    const [selectedStock, setSelectedStock] = useState<ApiStockItem | null>(null);
    const [stockQuantity, setStockQuantity] = useState("");
    const [isSearchingStock, setIsSearchingStock] = useState(false);

    useEffect(() => {
        const search = async () => {
            try {
                setIsSearchingStock(true);

                const results = await searchStocks(stockQuery);
                setStockResults(results);
            } catch (error) {
                console.error(error);
            } finally {
                setIsSearchingStock(false);
            }
        };

        const timeout = setTimeout(search, 250);
        return () => clearTimeout(timeout);
    }, [stockQuery]);

    const selectedStockStats = useMemo(() => {
        if (!selectedStock) {
            return {
                reserved: 0,
                projectedRemaining: 0,
                missing: 0,
                remainingAfterCurrentSelection: 0,
                missingAfterCurrentSelection: 0,
            };
        }

        const reserved = getReservedQuantity(selectedStock);
        const projectedRemaining = selectedStock.currentCount - reserved;
        const quantity = Number(stockQuantity) || 0;
        const remainingAfterCurrentSelection = projectedRemaining - quantity;

        return {
            reserved,
            projectedRemaining,
            missing: Math.max(0, -projectedRemaining),
            remainingAfterCurrentSelection,
            missingAfterCurrentSelection: Math.max(0, -remainingAfterCurrentSelection),
        };
    }, [selectedStock, stockQuantity]);

    const submitStockForm = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedStock) {
            onError("Tu dois sélectionner un stock.");
            return;
        }

        const quantity = Number(stockQuantity);

        if (!Number.isInteger(quantity) || quantity <= 0) {
            onError("La quantité doit être un entier supérieur à zéro.");
            return;
        }

        if (quantity > selectedStock.currentCount) {
            onError(
                `La quantité ne peut pas dépasser le stock disponible (${selectedStock.currentCount}).`
            );
            return;
        }

        try {
            setIsUpdating(true);
            onError(null);

            const updated = await createTaskStockUsage(task.id, {
                stockItemId: selectedStock.id,
                quantity,
            });

            onUpdated(updated);
        } catch (error) {
            console.error(error);
            onError(
                error instanceof Error
                    ? error.message
                    : "Erreur lors de l'ajout du stock."
            );
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
            <div className="w-full max-w-md rounded-xl bg-bg-2 p-7 shadow-2xl">
                <h2 className="mb-2 text-xl font-bold text-text-main">
                    Ajouter une étape
                </h2>

                <p className="mb-6 text-sm text-text-secondary">Tâche : {task.name}</p>

                <form onSubmit={submitStockForm} className="space-y-4">
                    <div className="relative">
                        <label className="mb-1 block text-[10px] font-bold uppercase text-main-500">
                            Stock utilisé
                        </label>

                        <input
                            required
                            value={stockQuery}
                            onChange={(event) => {
                                setStockQuery(event.target.value);
                                setSelectedStock(null);
                            }}
                            placeholder="Lait, compote, couverture..."
                            className="w-full rounded-md bg-bg-3 px-4 py-3 text-sm text-text-main outline-none placeholder:text-text-secondary/40 focus:bg-bg-4"
                        />

                        {stockQuery && !selectedStock && (
                            <div className="absolute left-0 right-0 top-[72px] z-10 max-h-56 overflow-y-auto rounded-md bg-bg-3 p-2 shadow-xl">
                                {isSearchingStock ? (
                                    <p className="px-3 py-2 text-sm text-text-secondary">
                                        Recherche...
                                    </p>
                                ) : stockResults.length === 0 ? (
                                    <p className="px-3 py-2 text-sm text-text-secondary">
                                        Aucun stock trouvé.
                                    </p>
                                ) : (
                                    stockResults.map((stock) => {
                                        const reserved = getReservedQuantity(stock);
                                        const projectedRemaining = stock.currentCount - reserved;
                                        const missing = Math.max(0, -projectedRemaining);

                                        return (
                                            <button
                                                key={stock.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedStock(stock);
                                                    setStockQuery(stock.name);
                                                    setStockQuantity("");
                                                }}
                                                className={`${BUTTON_ANIMATION} flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-bg-4`}
                                            >
                        <span>
                          <span className="block text-sm font-bold text-text-main">
                            {stock.name}
                          </span>
                          <span className="block text-xs text-main-500">
                            {stock.category}
                          </span>
                        </span>

                                                <span className="text-right text-xs font-bold">
                          <span className="block text-text-secondary">
                            Stock x{stock.currentCount}
                          </span>
                                                    {missing > 0 ? (
                                                        <span className="block text-secondary-500">
                              Manque x{missing}
                            </span>
                                                    ) : (
                                                        <span className="block text-green-400">
                              Après prévu x{projectedRemaining}
                            </span>
                                                    )}
                        </span>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {selectedStock && (
                            <div className="mt-3 rounded-md bg-bg-3 px-4 py-3 text-xs">
                                <p className="text-text-secondary">
                                    Stock actuel :{" "}
                                    <span className="font-bold text-text-main">
                    x{selectedStock.currentCount}
                  </span>
                                    {selectedStock.unit ? ` ${selectedStock.unit}` : ""}
                                </p>

                                <p className="mt-1 text-text-secondary">
                                    Après maraudes prévues :{" "}
                                    {selectedStockStats.missing > 0 ? (
                                        <span className="font-bold text-secondary-500">
                      il manque x{selectedStockStats.missing}
                    </span>
                                    ) : (
                                        <span className="font-bold text-green-400">
                      reste x{selectedStockStats.projectedRemaining}
                    </span>
                                    )}
                                </p>

                                {stockQuantity && (
                                    <p className="mt-1 text-text-secondary">
                                        Après cet ajout :{" "}
                                        {selectedStockStats.missingAfterCurrentSelection > 0 ? (
                                            <span className="font-bold text-secondary-500">
                        il manquera x
                                                {selectedStockStats.missingAfterCurrentSelection}
                      </span>
                                        ) : (
                                            <span className="font-bold text-green-400">
                        restera x
                                                {selectedStockStats.remainingAfterCurrentSelection}
                      </span>
                                        )}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase text-main-500">
                            Quantité
                        </label>
                        <input
                            required
                            type="number"
                            min={1}
                            max={selectedStock?.currentCount ?? undefined}
                            value={stockQuantity}
                            onChange={(event) => setStockQuantity(event.target.value)}
                            placeholder="250"
                            className="w-full rounded-md bg-bg-3 px-4 py-3 text-sm text-text-main outline-none placeholder:text-text-secondary/40 focus:bg-bg-4"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isUpdating}
                            className={`${BUTTON_ANIMATION} flex-1 rounded-md bg-bg-3 px-4 py-3 text-sm font-semibold text-text-main hover:bg-bg-4 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`}
                        >
                            Annuler
                        </button>

                        <button
                            type="submit"
                            disabled={isUpdating || !selectedStock}
                            className={`${BUTTON_ANIMATION} flex-1 rounded-md bg-main-500 px-4 py-3 text-sm font-semibold text-white hover:bg-main-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`}
                        >
                            {isUpdating ? "Ajout..." : "Ajouter"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}