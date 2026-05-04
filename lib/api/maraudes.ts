export type ApiUser = {
    id: number;
    name: string;
    mail?: string;
    picture: string | null;
    isAdmin?: boolean;
};

export type ApiMaraudInscription = {
    id: number;
    userId: number;
    maraudId: number;
    user: ApiUser;
};

export type ApiMaraudStop = {
    id: number;
    maraudId: number;
    order: number;
    address: string;
    city: string | null;
    time: string | null;
    lat: number | null;
    long: number | null;
};

export type ApiStockItem = {
    id: number;
    name: string;
    category: string;
    currentCount: number;
    unit: string | null;
};

export type ApiMaraudTaskStock = {
    id: number;
    maraudTaskId: number;
    stockItemId: number;
    quantity: number;
    stockItem: ApiStockItem;
};

export type ApiMaraudTaskUser = {
    id: number;
    maraudTaskId: number;
    userId: number;
    user: ApiUser;
};

export type ApiMaraudTask = {
    id: number;
    maraudId: number;
    name: string;
    description: string | null;
    startTime: string;
    endTime: string | null;
    order: number;
    contributors: ApiMaraudTaskUser[];
    stockUsages: ApiMaraudTaskStock[];
};

export type ApiMaraud = {
    id: number;
    name: string;
    description: string;
    date: string;
    endDate: string;
    thumbnail: string | null;
    isFinished: boolean;
    isVisible: boolean;
    stocksDeducted: boolean;
    location: string;
    authorId: number;
    author: ApiUser;
    inscriptions: ApiMaraudInscription[];
    stops: ApiMaraudStop[];
    tasks: ApiMaraudTask[];
};

export type CreateMaraudPayload = {
    name: string;
    location: string;
    date: string | Date;
    endDate: string | Date;
    description?: string;
    authorId: number | string;
    thumbnail?: string | null;
};

export type UpdateMaraudPayload = Partial<{
    name: string;
    location: string;
    date: string | Date;
    endDate: string | Date;
    description: string;
    thumbnail: string | null;
    isFinished: boolean;
    isVisible: boolean;
}>;

export type CreateMaraudTaskPayload = {
    name: string;
    startTime: string | Date;
    endTime?: string | Date | null;
    description?: string | null;
};

export type UpdateMaraudTaskPayload = Partial<{
    name: string;
    startTime: string | Date;
    endTime: string | Date | null;
    description: string | null;
}>;

export type CreateTaskStockPayload = {
    stockItemId: number;
    quantity: number;
};

export type CreateMaraudStopPayload = {
    address: string;
    city?: string | null;
    time?: string | Date | null;
    lat?: number | null;
    long?: number | null;
};

export type UpdateMaraudStopPayload = Partial<{
    address: string;
    city: string | null;
    time: string | Date | null;
    lat: number | null;
    long: number | null;
    order: number;
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

function serializeDate(value?: string | Date | null) {
    if (!value) return value;

    return value instanceof Date ? value.toISOString() : value;
}

export async function getMaraudes(): Promise<ApiMaraud[]> {
    const response = await fetch("/api/maraudes", {
        method: "GET",
        cache: "no-store",
    });

    return parseApiResponse<ApiMaraud[]>(response);
}

export async function getMaraud(id: number): Promise<ApiMaraud> {
    const response = await fetch(`/api/maraudes/${id}`, {
        method: "GET",
        cache: "no-store",
    });

    return parseApiResponse<ApiMaraud>(response);
}

export async function createMaraud(
    payload: CreateMaraudPayload
): Promise<ApiMaraud> {
    const response = await fetch("/api/maraudes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ...payload,
            date: serializeDate(payload.date),
            endDate: serializeDate(payload.endDate),
        }),
    });

    return parseApiResponse<ApiMaraud>(response);
}

export async function updateMaraud(
    id: number,
    payload: UpdateMaraudPayload
): Promise<ApiMaraud> {
    const response = await fetch(`/api/maraudes/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ...payload,
            date: serializeDate(payload.date),
            endDate: serializeDate(payload.endDate),
        }),
    });

    return parseApiResponse<ApiMaraud>(response);
}

export async function updateMaraudLocation(
    id: number,
    location: string
): Promise<ApiMaraud> {
    return updateMaraud(id, {
        location,
    });
}

export async function toggleMaraudVisibility(
    id: number,
    isVisible: boolean
): Promise<ApiMaraud> {
    return updateMaraud(id, {
        isVisible,
    });
}

export async function finishMaraud(id: number): Promise<ApiMaraud> {
    return updateMaraud(id, {
        isFinished: true,
        isVisible: false,
    });
}

export async function deleteMaraud(id: number): Promise<{ message: string }> {
    const response = await fetch(`/api/maraudes/${id}`, {
        method: "DELETE",
    });

    return parseApiResponse<{ message: string }>(response);
}

export async function searchStocks(query: string): Promise<ApiStockItem[]> {
    const params = new URLSearchParams();

    if (query.trim()) {
        params.set("query", query.trim());
    }

    const response = await fetch(`/api/stocks?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
    });

    return parseApiResponse<ApiStockItem[]>(response);
}

export async function createMaraudTask(
    maraudId: number,
    payload: CreateMaraudTaskPayload
): Promise<ApiMaraud> {
    const response = await fetch(`/api/maraudes/${maraudId}/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ...payload,
            startTime: serializeDate(payload.startTime),
            endTime: serializeDate(payload.endTime),
        }),
    });

    return parseApiResponse<ApiMaraud>(response);
}

export async function updateMaraudTask(
    taskId: number,
    payload: UpdateMaraudTaskPayload
): Promise<ApiMaraud> {
    const response = await fetch(`/api/maraud-tasks/${taskId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ...payload,
            startTime: serializeDate(payload.startTime),
            endTime: serializeDate(payload.endTime),
        }),
    });

    return parseApiResponse<ApiMaraud>(response);
}

export async function deleteMaraudTask(taskId: number): Promise<ApiMaraud> {
    const response = await fetch(`/api/maraud-tasks/${taskId}`, {
        method: "DELETE",
    });

    return parseApiResponse<ApiMaraud>(response);
}

export async function createTaskStockUsage(
    taskId: number,
    payload: CreateTaskStockPayload
): Promise<ApiMaraud> {
    const response = await fetch(`/api/maraud-tasks/${taskId}/stocks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    return parseApiResponse<ApiMaraud>(response);
}

export async function deleteTaskStockUsage(
    stockUsageId: number
): Promise<ApiMaraud> {
    const response = await fetch(`/api/maraud-task-stocks/${stockUsageId}`, {
        method: "DELETE",
    });

    return parseApiResponse<ApiMaraud>(response);
}

export async function createMaraudStop(
    maraudId: number,
    payload: CreateMaraudStopPayload
): Promise<ApiMaraud> {
    const response = await fetch(`/api/maraudes/${maraudId}/stops`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ...payload,
            time: serializeDate(payload.time),
        }),
    });

    return parseApiResponse<ApiMaraud>(response);
}

export async function updateMaraudStop(
    stopId: number,
    payload: UpdateMaraudStopPayload
): Promise<ApiMaraud> {
    const response = await fetch(`/api/maraud-stops/${stopId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ...payload,
            time: serializeDate(payload.time),
        }),
    });

    return parseApiResponse<ApiMaraud>(response);
}

export async function deleteMaraudStop(stopId: number): Promise<ApiMaraud> {
    const response = await fetch(`/api/maraud-stops/${stopId}`, {
        method: "DELETE",
    });

    return parseApiResponse<ApiMaraud>(response);
}