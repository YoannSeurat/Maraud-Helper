"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ApiStockItem,
  deleteStock,
  getStocks,
  groupStocksByCategory,
} from "@/lib/api/stocks";
import IconButton from "@/components/ui/IconButton";
import StockCategorySection from "@/components/stock/StockCategorySection";
import StockCategoryModal from "@/components/stock/StockCategoryModal";
import StockResourceModal from "@/components/stock/StockResourceModal";
import StockDeleteModal from "@/components/stock/StockDeleteModal";

export default function GestionStockPage() {
  const [stocks, setStocks] = useState<ApiStockItem[]>([]);
  const [createdCategories, setCreatedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [stockToEdit, setStockToEdit] = useState<ApiStockItem | null>(null);
  const [stockToDelete, setStockToDelete] = useState<ApiStockItem | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchStocks = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const data = await getStocks();

      setStocks(data);
    } catch (error) {
      console.error(error);

      setErrorMessage(
          error instanceof Error
              ? error.message
              : "Impossible de récupérer l'inventaire."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const groupedStocks = useMemo(() => {
    const groups = groupStocksByCategory(stocks);

    createdCategories.forEach((category) => {
      const exists = groups.some((group) => group.category === category);

      if (!exists) {
        groups.push({
          category,
          items: [],
        });
      }
    });

    return groups.sort((a, b) => a.category.localeCompare(b.category));
  }, [stocks, createdCategories]);

  const categories = useMemo(() => {
    return groupedStocks.map((group) => group.category);
  }, [groupedStocks]);

  const openCreateResourceModal = (category: string) => {
    setSelectedCategory(category);
    setStockToEdit(null);
    setErrorMessage(null);
    setIsResourceModalOpen(true);
  };

  const openEditResourceModal = (stock: ApiStockItem) => {
    setSelectedCategory(stock.category);
    setStockToEdit(stock);
    setErrorMessage(null);
    setIsResourceModalOpen(true);
  };

  const closeResourceModal = () => {
    if (isMutating) return;

    setIsResourceModalOpen(false);
    setSelectedCategory(undefined);
    setStockToEdit(null);
  };

  const handleSavedResource = (savedStock: ApiStockItem) => {
    setStocks((prev) => {
      const exists = prev.some((stock) => stock.id === savedStock.id);

      if (exists) {
        return prev.map((stock) =>
            stock.id === savedStock.id ? savedStock : stock
        );
      }

      return [...prev, savedStock];
    });

    setIsResourceModalOpen(false);
    setSelectedCategory(undefined);
    setStockToEdit(null);
  };

  const handleCreatedCategory = (category: string) => {
    setCreatedCategories((prev) => {
      if (prev.includes(category)) return prev;

      return [...prev, category];
    });

    setIsCategoryModalOpen(false);
  };

  const confirmDeleteResource = async () => {
    if (!stockToDelete) return;

    try {
      setIsMutating(true);
      setErrorMessage(null);

      await deleteStock(stockToDelete.id);

      setStocks((prev) =>
          prev.filter((stock) => stock.id !== stockToDelete.id)
      );

      setStockToDelete(null);
    } catch (error) {
      console.error(error);

      setErrorMessage(
          error instanceof Error
              ? error.message
              : "Erreur lors de la suppression de la ressource."
      );
    } finally {
      setIsMutating(false);
    }
  };

  return (
      <div className="min-h-screen bg-bg pb-32 font-sans text-text-main">
        <main className="px-16 pt-8">
          <div className="mb-8 flex items-start justify-between">
            <h1 className="text-3xl font-bold text-text-main">Inventaire</h1>

            <IconButton onClick={() => setIsCategoryModalOpen(true)}>
              Ajouter une catégorie
            </IconButton>
          </div>

          {errorMessage && (
              <div className="mb-6 rounded-lg bg-secondary-500/10 px-5 py-4 text-sm text-secondary-700">
                {errorMessage}
              </div>
          )}

          {isLoading ? (
              <div className="flex h-64 items-center justify-center text-text-secondary">
                Chargement...
              </div>
          ) : groupedStocks.length === 0 ? (
              <div className="rounded-md bg-bg-2 px-5 py-8 text-center text-text-secondary">
                Aucune catégorie dans l’inventaire. Ajoute une catégorie pour
                pouvoir créer des ressources.
              </div>
          ) : (
              <div className="space-y-9">
                {groupedStocks.map((group) => (
                    <StockCategorySection
                        key={group.category}
                        group={group}
                        onAddResource={openCreateResourceModal}
                        onEditResource={openEditResourceModal}
                        onDeleteResource={setStockToDelete}
                    />
                ))}
              </div>
          )}
        </main>

        {isCategoryModalOpen && (
            <StockCategoryModal
                isLoading={isMutating}
                setIsLoading={setIsMutating}
                onClose={() => setIsCategoryModalOpen(false)}
                onCreated={handleCreatedCategory}
                onError={setErrorMessage}
            />
        )}

        {isResourceModalOpen && (
            <StockResourceModal
                stock={stockToEdit}
                categories={categories}
                defaultCategory={selectedCategory}
                isLoading={isMutating}
                setIsLoading={setIsMutating}
                onClose={closeResourceModal}
                onSaved={handleSavedResource}
                onError={setErrorMessage}
            />
        )}

        {stockToDelete && (
            <StockDeleteModal
                stock={stockToDelete}
                isLoading={isMutating}
                onCancel={() => {
                  if (!isMutating) setStockToDelete(null);
                }}
                onConfirm={confirmDeleteResource}
            />
        )}
      </div>
  );
}