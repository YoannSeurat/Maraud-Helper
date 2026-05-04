"use client";

import { ApiStockItem } from "@/lib/api/stocks";

const ICON_BUTTON_ANIMATION =
    "cursor-pointer transition-all duration-150 hover:scale-110 active:scale-95";

type StockRowProps = {
    stock: ApiStockItem;
    onEdit: (stock: ApiStockItem) => void;
    onDelete: (stock: ApiStockItem) => void;
};

type UsageSummary = {
    maraudId: number;
    maraudName: string;
    quantity: number;
    tasks: string[];
};

function getUsageSummaries(stock: ApiStockItem): UsageSummary[] {
    const usages = stock.taskUsages ?? [];
    const usageMap = new Map<number, UsageSummary>();

    usages.forEach((usage) => {
        const maraud = usage.task.maraud;
        const existing = usageMap.get(maraud.id);

        if (existing) {
            existing.quantity += usage.quantity;

            if (!existing.tasks.includes(usage.task.name)) {
                existing.tasks.push(usage.task.name);
            }
        } else {
            usageMap.set(maraud.id, {
                maraudId: maraud.id,
                maraudName: maraud.name,
                quantity: usage.quantity,
                tasks: [usage.task.name],
            });
        }
    });

    return Array.from(usageMap.values()).sort((a, b) =>
        a.maraudName.localeCompare(b.maraudName)
    );
}

function getReservedQuantity(stock: ApiStockItem) {
    return (stock.taskUsages ?? []).reduce(
        (sum, usage) => sum + usage.quantity,
        0
    );
}

export default function StockRow({ stock, onEdit, onDelete }: StockRowProps) {
    const usageSummaries = getUsageSummaries(stock);
    const reservedQuantity = getReservedQuantity(stock);
    const projectedRemaining = stock.currentCount - reservedQuantity;
    const missingQuantity = Math.max(0, -projectedRemaining);

    return (
        <div className="rounded-md bg-bg-2 px-4 py-3 text-text-main">
            <div className="flex min-h-[42px] items-center justify-between">
                <div className="flex items-center gap-5">
                    <p className="w-12 text-base font-bold text-text-main">
                        x{stock.currentCount}
                    </p>

                    <div>
                        <p className="text-[10px] font-bold uppercase leading-none text-main-500">
                            {stock.category}
                        </p>

                        <p className="text-base font-bold text-text-main">
                            {stock.name}
                            {stock.unit ? (
                                <span className="ml-2 text-xs font-medium text-text-secondary">
                  {stock.unit}
                </span>
                            ) : null}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden text-right md:block">
                        <p className="text-xs font-semibold text-text-secondary">
                            Après maraudes prévues
                        </p>

                        {missingQuantity > 0 ? (
                            <p className="text-sm font-bold text-secondary-500">
                                Il manque x{missingQuantity}
                            </p>
                        ) : (
                            <p className="text-sm font-bold text-green-400">
                                Reste x{projectedRemaining}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => onDelete(stock)}
                            className={`${ICON_BUTTON_ANIMATION} flex h-9 w-9 items-center justify-center rounded-md bg-bg-3 text-text-main hover:bg-main-500`}
                            aria-label="Supprimer la ressource"
                        >
                            <i className="bi bi-trash3-fill text-sm"></i>
                        </button>

                        <button
                            type="button"
                            onClick={() => onEdit(stock)}
                            className={`${ICON_BUTTON_ANIMATION} flex h-9 w-9 items-center justify-center rounded-md bg-bg-3 text-text-main hover:bg-bg-4`}
                            aria-label="Modifier la ressource"
                        >
                            <i className="bi bi-pencil text-sm"></i>
                        </button>
                    </div>
                </div>
            </div>

            {usageSummaries.length > 0 && (
                <div className="mt-3 space-y-2 pl-[68px]">
                    {usageSummaries.map((usage) => (
                        <div
                            key={usage.maraudId}
                            className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md bg-bg-3 px-3 py-2"
                        >
              <span className="text-[10px] font-bold uppercase text-main-500">
                Réservé
              </span>

                            <span className="text-sm font-semibold text-text-main">
                x{usage.quantity}
              </span>

                            <span className="text-sm text-text-secondary">
                pour {usage.maraudName}
              </span>

                            <span className="text-xs text-text-secondary/70">
                tâches : {usage.tasks.join(", ")}
              </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}