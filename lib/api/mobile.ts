export type MobileUser = {
    id: number;
    name: string;
    mail: string;
    isAdmin: boolean;
    picture: string | null;
};

export type MobileMaraudInscription = {
    id: number;
    userId: number;
    maraudId: number;
    user: {
        id: number;
        name: string;
        picture: string | null;
    };
};

export type MobileMaraudTaskStock = {
    id: number;
    maraudTaskId: number;
    stockItemId: number;
    quantity: number;
    completedCount: number;
    stockItem: {
        id: number;
        name: string;
        category: string;
        currentCount: number;
        unit: string | null;
    };
};

export type MobileMaraudTask = {
    id: number;
    maraudId: number;
    name: string;
    description: string | null;
    startTime: string;
    endTime: string | null;
    order: number;
    stockUsages: MobileMaraudTaskStock[];
};

export type MobileMaraud = {
    id: number;
    name: string;
    description: string;
    date: string;
    endDate: string;
    thumbnail: string | null;
    isFinished: boolean;
    isVisible: boolean;
    location: string;
    authorId: number;
    author: {
        id: number;
        name: string;
        picture: string | null;
    };
    inscriptions: MobileMaraudInscription[];
    tasks: MobileMaraudTask[];
    isRegistered: boolean;
};

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

export async function getMobileVisibleMaraudes(): Promise<MobileMaraud[]> {
    const response = await fetch("/api/mobile/maraudes", {
        method: "GET",
        cache: "no-store",
    });

    return parseApiResponse<MobileMaraud[]>(response);
}

export async function getMobileRegisteredMaraudes(): Promise<MobileMaraud[]> {
    const response = await fetch("/api/mobile/maraudes/registered", {
        method: "GET",
        cache: "no-store",
    });

    return parseApiResponse<MobileMaraud[]>(response);
}

export async function getMobileMaraudMode(
    maraudId: number
): Promise<MobileMaraud> {
    const response = await fetch(`/api/mobile/maraudes/${maraudId}/mode`, {
        method: "GET",
        cache: "no-store",
    });

    return parseApiResponse<MobileMaraud>(response);
}

export async function updateMobileTaskStockProgress(
    stockUsageId: number,
    delta: number
): Promise<MobileMaraud> {
    const response = await fetch(
        `/api/mobile/task-stocks/${stockUsageId}/progress`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ delta }),
        }
    );

    return parseApiResponse<MobileMaraud>(response);
}

export async function registerToMaraud(
    maraudId: number
): Promise<MobileMaraud> {
    const response = await fetch(`/api/mobile/maraudes/${maraudId}/register`, {
        method: "POST",
    });

    return parseApiResponse<MobileMaraud>(response);
}

export async function unregisterFromMaraud(
    maraudId: number
): Promise<MobileMaraud> {
    const response = await fetch(`/api/mobile/maraudes/${maraudId}/register`, {
        method: "DELETE",
    });

    return parseApiResponse<MobileMaraud>(response);
}

export async function getMobileProfile(): Promise<MobileUser> {
    const response = await fetch("/api/mobile/profile", {
        method: "GET",
        cache: "no-store",
    });

    return parseApiResponse<MobileUser>(response);
}

export async function updateMobileProfile(payload: {
    name?: string;
    mail?: string;
    password?: string;
    picture?: string | null;
}): Promise<MobileUser> {
    const response = await fetch("/api/mobile/profile", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    return parseApiResponse<MobileUser>(response);
}