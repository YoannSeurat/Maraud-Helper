export type ApiCurrentUser = {
    id: number;
    name: string;
    mail: string;
    isAdmin: boolean;
    picture: string | null;
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

export async function getCurrentUser(): Promise<ApiCurrentUser> {
    const response = await fetch("/api/me", {
        method: "GET",
        cache: "no-store",
    });

    return parseApiResponse<ApiCurrentUser>(response);
}

export async function updateCurrentUser(payload: {
    name?: string;
    mail?: string;
    picture?: string | null;
}): Promise<ApiCurrentUser> {
    const response = await fetch("/api/me", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    return parseApiResponse<ApiCurrentUser>(response);
}

export async function logoutUser(): Promise<{ message: string }> {
    const response = await fetch("/api/auth/logout", {
        method: "POST",
    });

    return parseApiResponse<{ message: string }>(response);
}