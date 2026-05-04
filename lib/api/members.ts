export type ApiMember = {
    id: number;
    name: string;
    mail: string;
    isAdmin: boolean;
    picture: string | null;
    inscriptionsCount: number;
    createdMaraudsCount: number;
};

export type ApiMemberMaraud = {
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
    inscriptions: {
        id: number;
        userId: number;
        maraudId: number;
    }[];
    tasks: {
        id: number;
        name: string;
        stockUsages: {
            id: number;
            quantity: number;
            completedCount: number;
            stockItem: {
                id: number;
                name: string;
                category: string;
                unit: string | null;
            };
        }[];
    }[];
};

export type ApiMemberDetail = {
    id: number;
    name: string;
    mail: string;
    isAdmin: boolean;
    picture: string | null;
    stats: {
        inscriptionsCount: number;
        createdMaraudsCount: number;
        upcomingMaraudsCount: number;
        finishedMaraudsCount: number;
        totalTasksCount: number;
        totalStockUnitsPlanned: number;
        totalStockUnitsCompleted: number;
    };
    maraudes: ApiMemberMaraud[];
    createdMarauds: ApiMemberMaraud[];
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

export async function getMemberDetail(id: number): Promise<ApiMemberDetail> {
    const response = await fetch(`/api/members/${id}`, {
        method: "GET",
        cache: "no-store",
    });

    return parseApiResponse<ApiMemberDetail>(response);
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

export async function unregisterMemberFromMaraud(
    memberId: number,
    maraudId: number
): Promise<ApiMemberDetail> {
    const response = await fetch(`/api/members/${memberId}/maraudes/${maraudId}`, {
        method: "DELETE",
    });

    return parseApiResponse<ApiMemberDetail>(response);
}