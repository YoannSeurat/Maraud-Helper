"use client";

import { useState } from "react";
import { ApiStockItem, StockCategoryGroup } from "@/lib/api/stocks";
import IconButton from "@/components/ui/IconButton";
import StockRow from "./StockRow";

type StockCategorySectionProps = {
    group: StockCategoryGroup;
    onAddResource: (category: string) => void;
    onEditResource: (stock: ApiStockItem) => void;
    onDeleteResource: (stock: ApiStockItem) => void;
};

export default function StockCategorySection({
                                                 group,
                                                 onAddResource,
                                                 onEditResource,
                                                 onDeleteResource,
                                             }: StockCategorySectionProps) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="group flex items-center gap-3 rounded-md"
                >
                    <i
                        className={`bi bi-chevron-down text-base text-text-main/85 transition-colors duration-150 group-hover:text-main-500 ${
                            isOpen ? "rotate-0" : "-rotate-90"
                        }`}
                    ></i>
                    <h2 className="text-xl font-bold text-text-main transition-colors duration-150 group-hover:text-main-500">
                        {group.category}
                    </h2>
                </button>

                <IconButton size="md" onClick={() => onAddResource(group.category)}>
                    Ajouter une ressource
                </IconButton>
            </div>

            <div
                className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                }`}
            >
                <div className="overflow-hidden">
                    <div className="space-y-3">
                        {group.items.length === 0 ? (
                            <div className="rounded-md bg-bg-2 px-5 py-5 text-sm text-text-secondary">
                                Aucune ressource dans cette catégorie.
                            </div>
                        ) : (
                            group.items.map((stock) => (
                                <StockRow
                                    key={stock.id}
                                    stock={stock}
                                    onEdit={onEditResource}
                                    onDelete={onDeleteResource}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}