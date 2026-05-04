export type ApiMember = {
    id: number;
    name: string;
    mail: string;
    isAdmin: boolean;
    picture: string | null;
    inscriptionsCount: number;
    createdMaraudsCount: number;
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

export async function getMembers(): Promise<ApiMember[]> {
    const response = await fetch("/api/members", {
        method: "GET",
        cache: "no-store",
    });

    return parseApiResponse<ApiMember[]>(response);
}

export async function updateMemberRole(
    id: number,
    isAdmin: boolean
): Promise<ApiMember> {
    const response = await fetch(`/api/members/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            isAdmin,
        }),
    });

    return parseApiResponse<ApiMember>(response);
}

export async function deleteMember(id: number): Promise<{ message: string }> {
    const response = await fetch(`/api/members/${id}`, {
        method: "DELETE",
    });

    return parseApiResponse<{ message: string }>(response);
}