"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiMaraud, getMaraudes } from "@/lib/api/maraudes";
import {
  ApiMember,
  deleteMember,
  getMembers,
  updateMemberRole,
} from "@/lib/api/members";
import ConfirmDeleteModal from "@/components/maraudes/ConfirmDeleteModal";

type Period = "7J" | "6M" | "1A" | "YTD";

const ICON_BUTTON_ANIMATION =
    "cursor-pointer transition-all duration-150 hover:scale-110 active:scale-95";

const BUTTON_ANIMATION =
    "cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-95";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);

  return date
      .toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(":", ".");
};

const getPeriodStartDate = (period: Period) => {
  const now = new Date();
  const start = new Date(now);

  if (period === "7J") {
    start.setDate(now.getDate() - 7);
  }

  if (period === "6M") {
    start.setMonth(now.getMonth() - 6);
  }

  if (period === "1A") {
    start.setFullYear(now.getFullYear() - 1);
  }

  if (period === "YTD") {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
  }

  return start;
};

const getTopMaraud = (maraudes: ApiMaraud[]) => {
  if (maraudes.length === 0) return null;

  return [...maraudes].sort((a, b) => {
    const scoreA = a.inscriptions.length * 10 + (a.tasks?.length ?? 0);
    const scoreB = b.inscriptions.length * 10 + (b.tasks?.length ?? 0);

    return scoreB - scoreA;
  })[0];
};

const getInitial = (name: string) => {
  return name.trim().charAt(0).toUpperCase() || "?";
};

const getImageSrc = (picture?: string | null) => {
  if (!picture) return null;

  if (
      picture.startsWith("data:image") ||
      picture.startsWith("http://") ||
      picture.startsWith("https://") ||
      picture.startsWith("/")
  ) {
    return picture;
  }

  return `data:image/png;base64,${picture}`;
};

export default function TableauDeBordPage() {
  const router = useRouter();

  const [maraudes, setMaraudes] = useState<ApiMaraud[]>([]);
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [period, setPeriod] = useState<Period>("6M");
  const [memberSearch, setMemberSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMutatingMember, setIsMutatingMember] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<ApiMember | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [maraudesData, membersData] = await Promise.all([
        getMaraudes(),
        getMembers(),
      ]);

      setMaraudes(maraudesData);
      setMembers(membersData);
    } catch (error) {
      console.error(error);
      setErrorMessage(
          error instanceof Error
              ? error.message
              : "Impossible de récupérer les données du tableau de bord."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const now = new Date();

  const upcomingMaraudes = useMemo(() => {
    return maraudes.filter((maraud) => {
      return !maraud.isFinished && new Date(maraud.date) >= now;
    });
  }, [maraudes]);

  const periodMaraudes = useMemo(() => {
    const periodStart = getPeriodStartDate(period);

    return maraudes.filter((maraud) => {
      const date = new Date(maraud.date);
      return date >= periodStart && date <= now;
    });
  }, [maraudes, period]);

  const periodMembers = useMemo(() => {
    return periodMaraudes.reduce(
        (sum, maraud) => sum + maraud.inscriptions.length,
        0
    );
  }, [periodMaraudes]);

  const topMaraud = useMemo(() => {
    return getTopMaraud(periodMaraudes.length > 0 ? periodMaraudes : maraudes);
  }, [periodMaraudes, maraudes]);

  const filteredMembers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();

    if (!query) return members;

    return members.filter((member) => {
      return (
          member.name.toLowerCase().includes(query) ||
          member.mail.toLowerCase().includes(query) ||
          (member.isAdmin ? "admin" : "membre").includes(query)
      );
    });
  }, [members, memberSearch]);

  const handleToggleRole = async (member: ApiMember) => {
    try {
      setIsMutatingMember(true);
      setErrorMessage(null);

      const updatedMember = await updateMemberRole(member.id, !member.isAdmin);

      setMembers((prev) =>
          prev.map((item) =>
              item.id === updatedMember.id ? updatedMember : item
          )
      );
    } catch (error) {
      console.error(error);
      setErrorMessage(
          error instanceof Error
              ? error.message
              : "Erreur lors du changement de rôle."
      );
    } finally {
      setIsMutatingMember(false);
    }
  };

  const handleConfirmDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      setIsMutatingMember(true);
      setErrorMessage(null);

      await deleteMember(memberToDelete.id);

      setMembers((prev) =>
          prev.filter((member) => member.id !== memberToDelete.id)
      );

      setMemberToDelete(null);
    } catch (error) {
      console.error(error);
      setErrorMessage(
          error instanceof Error
              ? error.message
              : "Erreur lors de la suppression du membre."
      );
    } finally {
      setIsMutatingMember(false);
    }
  };

  const authorImageSrc = getImageSrc(topMaraud?.author.picture);
  const periodItems: Period[] = ["7J", "6M", "1A", "YTD"];

  return (
      <div className="min-h-screen bg-bg pb-32 text-text-main">
        <main className="px-16 pt-12">
          {errorMessage && (
              <div className="mb-6 rounded-lg bg-secondary-500/10 px-5 py-4 text-sm text-secondary-700">
                {errorMessage}
              </div>
          )}

          {isLoading ? (
              <div className="flex h-64 items-center justify-center text-text-secondary">
                Chargement...
              </div>
          ) : (
              <>
                <div className="mb-12 grid grid-cols-3 gap-6">
                  <div className="rounded-xl bg-bg-2 px-5 py-5">
                    <div className="flex items-center gap-4">
                      <i className="bi bi-person text-2xl text-text-main/80"></i>
                      <p className="text-3xl font-bold text-text-main">
                        {members.length}
                      </p>
                    </div>

                    <p className="mt-1 text-[10px] font-medium text-text-secondary">
                      Membres inscrits
                    </p>
                  </div>

                  <div className="rounded-xl bg-bg-2 px-5 py-5">
                    <div className="flex items-center gap-4">
                      <i className="bi bi-briefcase text-2xl text-text-main/80"></i>
                      <p className="text-3xl font-bold text-text-main">
                        {upcomingMaraudes.length}
                      </p>
                    </div>

                    <p className="mt-1 text-[10px] font-medium text-text-secondary">
                      Maraud à venir
                    </p>
                  </div>

                  <div className="rounded-xl bg-bg-2 px-5 py-5">
                    <div className="flex items-center gap-4">
                      <i className="bi bi-clock-history text-2xl text-text-main/80"></i>
                      <p className="text-3xl font-bold text-text-main">
                        {maraudes.length}
                      </p>
                    </div>

                    <p className="mt-1 text-[10px] font-medium text-text-secondary">
                      Maraud organisée en tout
                    </p>
                  </div>
                </div>

                <div className="mb-7 flex items-end justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-text-main">
                      Progressions
                    </h1>
                    <p className="mt-1 text-base text-text-secondary">
                      Statistiques variables dépendante d'une période
                    </p>
                  </div>

                  <div className="flex rounded-lg bg-bg-2 p-1">
                    {periodItems.map((item) => {
                      const isActive = item === period;

                      return (
                          <button
                              key={item}
                              type="button"
                              onClick={() => setPeriod(item)}
                              className={`rounded-md px-7 py-3 text-sm font-bold transition-all duration-150 ${
                                  isActive
                                      ? "bg-main-500 text-white"
                                      : "text-text-secondary hover:bg-bg-3 hover:text-text-main"
                              }`}
                          >
                            {item}
                          </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-7 grid grid-cols-2 gap-6">
                  <div className="rounded-xl bg-bg-2 px-5 py-5">
                    <div className="flex items-center gap-4">
                      <i className="bi bi-briefcase text-2xl text-text-main/80"></i>
                      <p className="text-3xl font-bold text-text-main">
                        {periodMaraudes.length}
                      </p>
                    </div>

                    <p className="mt-1 text-[10px] font-medium text-text-secondary">
                      Maraud organisés sur la période
                    </p>
                  </div>

                  <div className="rounded-xl bg-bg-2 px-5 py-5">
                    <div className="flex items-center gap-4">
                      <i className="bi bi-person text-2xl text-text-main/80"></i>
                      <p className="text-3xl font-bold text-text-main">
                        {periodMembers}
                      </p>
                    </div>

                    <p className="mt-1 text-[10px] font-medium text-text-secondary">
                      Membres inscrits sur des maraud dans cette période
                    </p>
                  </div>
                </div>

                <section className="mb-10">
                  <h2 className="mb-4 text-2xl font-bold text-text-main">
                    Top Maraud
                  </h2>

                  {!topMaraud ? (
                      <div className="rounded-md bg-bg-2 px-5 py-8 text-center text-text-secondary">
                        Aucune maraude disponible.
                      </div>
                  ) : (
                      <div className="flex min-h-[64px] items-center justify-between rounded-lg bg-bg-2 px-3 py-3">
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="h-12 w-16 overflow-hidden rounded-md bg-bg">
                            {topMaraud.thumbnail ? (
                                <Image
                                    src={topMaraud.thumbnail}
                                    alt={topMaraud.name}
                                    width={64}
                                    height={48}
                                    className="h-full w-full object-cover opacity-60"
                                    unoptimized
                                />
                            ) : (
                                <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.14),transparent_20%),linear-gradient(135deg,rgba(255,255,255,0.10),rgba(255,255,255,0.02)),linear-gradient(45deg,#333,#111)] opacity-70" />
                            )}
                          </div>

                          <div className="min-w-[230px]">
                            <p className="text-[10px] font-bold uppercase text-main-500">
                              {formatDate(topMaraud.date)}
                            </p>

                            <p className="text-base font-bold text-text-main">
                              {topMaraud.name}
                            </p>

                            <div className="mt-1 flex items-center gap-2">
                              <div className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full bg-bg-4 text-[9px] font-bold text-text-main">
                                {authorImageSrc ? (
                                    <Image
                                        src={authorImageSrc}
                                        alt={topMaraud.author.name}
                                        width={16}
                                        height={16}
                                        className="h-full w-full object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    getInitial(topMaraud.author.name)
                                )}
                              </div>

                              <span className="text-xs text-text-secondary">
                          {topMaraud.author.name}
                        </span>
                            </div>
                          </div>
                        </div>

                        <div className="hidden min-w-[280px] items-center gap-3 text-text-secondary md:flex">
                          <i className="bi bi-map text-sm"></i>
                          <span className="truncate text-sm">
                      {topMaraud.location}
                    </span>
                        </div>

                        <div className="hidden items-center gap-3 text-text-secondary lg:flex">
                          <i className="bi bi-clock text-sm"></i>
                          <span className="text-sm">
                      {formatTime(topMaraud.date)} →{" "}
                            {formatTime(topMaraud.endDate)}
                    </span>
                        </div>

                        <div className="hidden items-center gap-3 text-text-secondary xl:flex">
                          <i className="bi bi-briefcase text-sm"></i>
                          <span className="text-sm">
                      {topMaraud.tasks?.length ?? 0} tâches
                    </span>
                        </div>

                        <div className="hidden items-center gap-3 text-text-secondary xl:flex">
                          <div className="flex -space-x-1.5">
                            {topMaraud.inscriptions.slice(0, 2).map((inscription) => {
                              const src = getImageSrc(inscription.user.picture);

                              return (
                                  <div
                                      key={inscription.userId}
                                      className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-bg-4 text-[9px] font-bold text-text-main"
                                  >
                                    {src ? (
                                        <Image
                                            src={src}
                                            alt={inscription.user.name}
                                            width={24}
                                            height={24}
                                            className="h-full w-full object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        getInitial(inscription.user.name)
                                    )}
                                  </div>
                              );
                            })}

                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-main-500 text-[9px] font-bold text-white">
                              {topMaraud.inscriptions.length}
                            </div>
                          </div>

                          <span className="text-sm">inscrits</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => router.push(`/maraudes/${topMaraud.id}`)}
                            className={`${ICON_BUTTON_ANIMATION} flex h-9 w-9 items-center justify-center rounded-md bg-main-500 text-white hover:bg-main-600`}
                            aria-label="Voir la maraude"
                        >
                          <i className="bi bi-arrow-up-right text-sm"></i>
                        </button>
                      </div>
                  )}
                </section>

                <section>
                  <div className="mb-4 flex items-end justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-text-main">
                        Membres
                      </h2>
                      <p className="mt-1 text-sm text-text-secondary">
                        Gestion et suivi des membres inscrits sur la plateforme
                      </p>
                    </div>

                    <div className="flex w-full max-w-md items-center gap-3 rounded-xl bg-bg-2 px-4 py-3">
                      <i className="bi bi-search text-base text-text-secondary"></i>
                      <input
                          value={memberSearch}
                          onChange={(event) => setMemberSearch(event.target.value)}
                          placeholder="Rechercher un membre..."
                          className="w-full bg-transparent text-sm text-text-main outline-none placeholder:text-text-secondary/60"
                      />

                      {memberSearch && (
                          <button
                              type="button"
                              onClick={() => setMemberSearch("")}
                              className="text-text-secondary transition-colors hover:text-main-500"
                              aria-label="Effacer la recherche"
                          >
                            <i className="bi bi-x-lg text-sm"></i>
                          </button>
                      )}
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-xl bg-bg-2">
                    <div className="grid grid-cols-[1.5fr_1.7fr_0.8fr_0.8fr_0.8fr_1fr] gap-4 px-5 py-4 text-[10px] font-bold uppercase text-main-500">
                      <p>Membre</p>
                      <p>Email</p>
                      <p>Rôle</p>
                      <p>Inscriptions</p>
                      <p>Créées</p>
                      <p className="text-right">Actions</p>
                    </div>

                    <div className="space-y-2 px-3 pb-3">
                      {filteredMembers.length === 0 ? (
                          <div className="rounded-md bg-bg-3 px-5 py-6 text-center text-sm text-text-secondary">
                            Aucun membre trouvé.
                          </div>
                      ) : (
                          filteredMembers.map((member) => {
                            const src = getImageSrc(member.picture);

                            return (
                                <div
                                    key={member.id}
                                    className="grid grid-cols-[1.5fr_1.7fr_0.8fr_0.8fr_0.8fr_1fr] items-center gap-4 rounded-md bg-bg-3 px-5 py-4"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-bg-4 text-sm font-bold text-text-main">
                                      {src ? (
                                          <Image
                                              src={src}
                                              alt={member.name}
                                              width={36}
                                              height={36}
                                              className="h-full w-full object-cover"
                                              unoptimized
                                          />
                                      ) : (
                                          getInitial(member.name)
                                      )}
                                    </div>

                                    <p className="text-sm font-bold text-text-main">
                                      {member.name}
                                    </p>
                                  </div>

                                  <p className="truncate text-sm text-text-secondary">
                                    {member.mail}
                                  </p>

                                  <p
                                      className={`text-sm font-semibold ${
                                          member.isAdmin
                                              ? "text-main-500"
                                              : "text-text-main"
                                      }`}
                                  >
                                    {member.isAdmin ? "Admin" : "Membre"}
                                  </p>

                                  <p className="text-sm font-bold text-text-main">
                                    {member.inscriptionsCount}
                                  </p>

                                  <p className="text-sm font-bold text-text-main">
                                    {member.createdMaraudsCount}
                                  </p>

                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        disabled={isMutatingMember}
                                        onClick={() => handleToggleRole(member)}
                                        className={`${BUTTON_ANIMATION} rounded-md bg-bg-4 px-3 py-2 text-xs font-semibold text-text-main hover:bg-bg-5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`}
                                    >
                                      {member.isAdmin
                                          ? "Passer membre"
                                          : "Passer admin"}
                                    </button>

                                    <button
                                        type="button"
                                        disabled={isMutatingMember}
                                        onClick={() => setMemberToDelete(member)}
                                        className={`${ICON_BUTTON_ANIMATION} flex h-8 w-8 items-center justify-center rounded-md bg-bg-4 text-text-main hover:bg-secondary-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`}
                                        aria-label="Supprimer le membre"
                                    >
                                      <i className="bi bi-trash3-fill text-xs"></i>
                                    </button>
                                  </div>
                                </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                </section>
              </>
          )}
        </main>

        {memberToDelete && (
            <ConfirmDeleteModal
                title="Supprimer le membre ?"
                message={
                  <>
                    Cette action supprimera définitivement{" "}
                    <span className="font-semibold text-text-main">
                {memberToDelete.name}
              </span>{" "}
                    ainsi que ses inscriptions aux maraudes.
                  </>
                }
                iconClassName="bi bi-trash3-fill"
                iconContainerClassName="bg-secondary-500/10 text-secondary-600"
                confirmLabel="Supprimer"
                loadingLabel="Suppression..."
                isLoading={isMutatingMember}
                onCancel={() => {
                  if (!isMutatingMember) setMemberToDelete(null);
                }}
                onConfirm={handleConfirmDeleteMember}
            />
        )}
      </div>
  );
}