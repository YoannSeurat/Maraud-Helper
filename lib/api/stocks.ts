export type ApiStockUsageDetail = {
    id: number;
    maraudTaskId: number;
    stockItemId: number;
    quantity: number;
    task: {
        id: number;
        name: string;
        maraudId: number;
        maraud: {
            id: number;
            name: string;
            date: string;
            endDate: string;
            isFinished: boolean;
            stocksDeducted: boolean;
        };
    };
};

export type ApiStockItem = {
    id: number;
    name: string;
    category: string;
    currentCount: number;
    unit: string | null;
    taskUsages?: ApiStockUsageDetail[];
};

export type StockCategoryGroup = {
    category: string;
    items: ApiStockItem[];
};

export type CreateStockPayload = {
    name: string;
    category: string;
    currentCount: number;
    unit?: string | null;
};

export type UpdateStockPayload = Partial<{
    name: string;
    category: string;
    currentCount: number;
    unit: string | null;
}>;

async function parseApiResponse<T>(response: Response): Promise<T> {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message =
            data && typeof data.error === "string"
                ? data.error
                : "Une erreur est survenue.";

        throw new Error(message);
    }

    return data as T;
}

export async function getStocks(query?: string): Promise<ApiStockItem[]> {
    const params = new URLSearchParams();

    if (query?.trim()) {
        params.set("query", query.trim());
    }

    const response = await fetch(`/api/stocks?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
    });

    return parseApiResponse<ApiStockItem[]>(response);
}

export async function createStock(
    payload: CreateStockPayload
): Promise<ApiStockItem> {
    const response = await fetch("/api/stocks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    return parseApiResponse<ApiStockItem>(response);
}

export async function updateStock(
    id: number,
    payload: UpdateStockPayload
): Promise<ApiStockItem> {
    const response = await fetch(`/api/stocks/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    return parseApiResponse<ApiStockItem>(response);
}

export async function deleteStock(id: number): Promise<{ message: string }> {
    const response = await fetch(`/api/stocks/${id}`, {
        method: "DELETE",
    });

    return parseApiResponse<{ message: string }>(response);
}

export async function createStockCategory(
    category: string
): Promise<{ category: string }> {
    const response = await fetch("/api/stock-categories", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ category }),
    });

    return parseApiResponse<{ category: string }>(response);
}

export function groupStocksByCategory(
    stocks: ApiStockItem[]
): StockCategoryGroup[] {
    const groups = new Map<string, ApiStockItem[]>();

    stocks.forEach((stock) => {
        const key = stock.category.trim() || "Sans catégorie";
        const items = groups.get(key) ?? [];

        items.push(stock);
        groups.set(key, items);
    });

    return Array.from(groups.entries())
        .map(([category, items]) => ({
            category,
            items: [...items].sort((a, b) => a.name.localeCompare(b.name)),
        }))
        .sort((a, b) => a.category.localeCompare(b.category));
}