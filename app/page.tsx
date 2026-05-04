"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import EventCard from "@/component/EventCardProps";
import IconButton from "@/components/ui/IconButton";
import ConfirmDeleteModal from "@/components/maraudes/ConfirmDeleteModal";
import {
  ApiMaraud,
  createMaraud,
  deleteMaraud,
  finishMaraud,
  getMaraudes,
  toggleMaraudVisibility,
} from "@/lib/api/maraudes";

const INITIAL_FORM_STATE = {
  name: "",
  location: "",
  date: "",
  endDate: "",
  description: "",
  authorId: "1",
};

const BUTTON_ANIMATION =
    "cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-95";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "2-digit",
  };

  return date.toLocaleDateString("fr-FR", options).toUpperCase();
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);

  return date
      .toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(":", "h");
};

type CollapsibleMaraudSectionProps = {
  title: string;
  muted?: boolean;
  children: React.ReactNode;
};

function CollapsibleMaraudSection({
                                    title,
                                    muted = false,
                                    children,
                                  }: CollapsibleMaraudSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
      <section>
        <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={`group mb-4 flex items-center gap-2 rounded-md ${
                muted ? "text-text-secondary" : "text-text-main"
            }`}
        >
          <i
              className={`bi bi-chevron-down text-base transition-colors duration-150 group-hover:text-main-500 ${
                  isOpen ? "rotate-0" : "-rotate-90"
              }`}
          ></i>
          <h2 className="text-xl font-semibold transition-colors duration-150 group-hover:text-main-500">
            {title}
          </h2>
        </button>

        <div
            className={`grid transition-all duration-300 ease-in-out ${
                isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
            }`}
        >
          <div className="overflow-hidden">{children}</div>
        </div>
      </section>
  );
}

export default function Home() {
  const router = useRouter();

  const [maraudes, setMaraudes] = useState<ApiMaraud[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [newMaraud, setNewMaraud] = useState(INITIAL_FORM_STATE);

  const [maraudToDelete, setMaraudToDelete] = useState<ApiMaraud | null>(null);
  const [maraudToFinish, setMaraudToFinish] = useState<ApiMaraud | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [updatingMaraudId, setUpdatingMaraudId] = useState<number | null>(null);

  const fetchMaraudes = async () => {
    try {
      setErrorMessage(null);
      setIsLoading(true);

      const data = await getMaraudes();

      setMaraudes(data);
    } catch (error) {
      console.error(error);

      setErrorMessage(
          error instanceof Error
              ? error.message
              : "Impossible de récupérer les maraudes."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaraudes();
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setErrorMessage(null);
      setIsCreating(true);

      if (!newMaraud.date || !newMaraud.endDate) {
        setErrorMessage(
            "Merci de renseigner une date de début et une date de fin."
        );
        return;
      }

      const startDate = new Date(newMaraud.date);
      const endDate = new Date(newMaraud.endDate);

      if (
          Number.isNaN(startDate.getTime()) ||
          Number.isNaN(endDate.getTime())
      ) {
        setErrorMessage("La date de début ou la date de fin est invalide.");
        return;
      }

      if (endDate <= startDate) {
        setErrorMessage(
            "La date de fin doit être postérieure à la date de début."
        );
        return;
      }

      const createdMaraud = await createMaraud(newMaraud);

      setMaraudes((prev) =>
          [...prev, createdMaraud].sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
      );

      setIsPanelOpen(false);
      setNewMaraud(INITIAL_FORM_STATE);
    } catch (error) {
      console.error("Erreur lors de la création :", error);

      setErrorMessage(
          error instanceof Error
              ? error.message
              : "Erreur lors de la création de la maraude."
      );
    } finally {
      setIsCreating(false);
    }
  };

  const openDeleteModal = (maraud: ApiMaraud) => {
    setMaraudToDelete(maraud);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setMaraudToDelete(null);
  };

  const confirmDelete = async () => {
    if (!maraudToDelete) return;

    try {
      setErrorMessage(null);
      setIsDeleting(true);

      await deleteMaraud(maraudToDelete.id);

      setMaraudes((prev) =>
          prev.filter((maraud) => maraud.id !== maraudToDelete.id)
      );

      setMaraudToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);

      setErrorMessage(
          error instanceof Error
              ? error.message
              : "Erreur lors de la suppression de la maraude."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleVisibility = async (maraud: ApiMaraud) => {
    try {
      setErrorMessage(null);
      setUpdatingMaraudId(maraud.id);

      const updatedMaraud = await toggleMaraudVisibility(
          maraud.id,
          !maraud.isVisible
      );

      setMaraudes((prev) =>
          prev.map((item) => (item.id === maraud.id ? updatedMaraud : item))
      );
    } catch (error) {
      console.error("Erreur lors du changement de visibilité :", error);

      setErrorMessage(
          error instanceof Error
              ? error.message
              : "Erreur lors du changement de visibilité."
      );
    } finally {
      setUpdatingMaraudId(null);
    }
  };

  const openFinishModal = (maraud: ApiMaraud) => {
    if (maraud.isFinished) return;
    setMaraudToFinish(maraud);
  };

  const closeFinishModal = () => {
    if (isFinishing) return;
    setMaraudToFinish(null);
  };

  const confirmFinish = async () => {
    if (!maraudToFinish) return;

    try {
      setErrorMessage(null);
      setIsFinishing(true);
      setUpdatingMaraudId(maraudToFinish.id);

      const updatedMaraud = await finishMaraud(maraudToFinish.id);

      setMaraudes((prev) =>
          prev.map((item) =>
              item.id === maraudToFinish.id ? updatedMaraud : item
          )
      );

      setMaraudToFinish(null);
    } catch (error) {
      console.error("Erreur lors du passage en terminé :", error);

      setErrorMessage(
          error instanceof Error
              ? error.message
              : "Erreur lors du passage de la maraude en terminé."
      );
    } finally {
      setIsFinishing(false);
      setUpdatingMaraudId(null);
    }
  };

  const filteredMaraudes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return maraudes;

    return maraudes.filter((maraud) => {
      return (
          maraud.name.toLowerCase().includes(query) ||
          maraud.location.toLowerCase().includes(query) ||
          maraud.description.toLowerCase().includes(query) ||
          maraud.author.name.toLowerCase().includes(query)
      );
    });
  }, [maraudes, searchQuery]);

  const aVenir = useMemo(() => {
    return filteredMaraudes.filter((maraud) => !maraud.isFinished);
  }, [filteredMaraudes]);

  const passes = useMemo(() => {
    return filteredMaraudes.filter((maraud) => maraud.isFinished);
  }, [filteredMaraudes]);

  return (
      <div className="min-h-screen bg-bg font-sans text-text-main pb-32">
        <main className="px-8 mx-auto mt-10">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-text-main">
              Liste des maraudes
            </h1>

            <IconButton onClick={() => setIsPanelOpen(true)}>
              Nouvelle maraude
            </IconButton>
          </div>

          <div className="mb-8 flex items-center gap-3 rounded-xl bg-bg-2 px-4 py-3">
            <i className="bi bi-search text-base text-text-secondary"></i>
            <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Rechercher une maraude par nom, lieu, description ou auteur..."
                className="w-full bg-transparent text-sm text-text-main outline-none placeholder:text-text-secondary/60"
            />

            {searchQuery && (
                <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-text-secondary transition-colors hover:text-main-500"
                    aria-label="Effacer la recherche"
                >
                  <i className="bi bi-x-lg text-sm"></i>
                </button>
            )}
          </div>

          {errorMessage && (
              <div className="mb-6 rounded-lg bg-secondary-500/10 px-4 py-3 text-sm text-secondary-700">
                {errorMessage}
              </div>
          )}

          {isLoading ? (
              <div className="text-text-secondary text-center mt-10">
                Chargement...
              </div>
          ) : (
              <div className="space-y-8">
                <CollapsibleMaraudSection title="À venir">
                  <div className="flex flex-col gap-3">
                    {aVenir.length === 0 ? (
                        <p className="text-base text-text-secondary">
                          Aucune maraude à venir.
                        </p>
                    ) : (
                        aVenir.map((maraud) => (
                            <div
                                key={maraud.id}
                                className={
                                  updatingMaraudId === maraud.id
                                      ? "pointer-events-none opacity-70"
                                      : ""
                                }
                            >
                              <EventCard
                                  date={formatDate(maraud.date)}
                                  title={maraud.name}
                                  address={maraud.location}
                                  timeRange={`${formatTime(maraud.date)} → ${formatTime(
                                      maraud.endDate
                                  )}`}
                                  taskCount={maraud.tasks?.length ?? 0}
                                  author={maraud.author}
                                  inscriptions={maraud.inscriptions}
                                  image={maraud.thumbnail || undefined}
                                  isVisible={maraud.isVisible}
                                  isFinished={maraud.isFinished}
                                  onOpen={() => router.push(`/maraudes/${maraud.id}`)}
                                  onDelete={() => openDeleteModal(maraud)}
                                  onView={() => handleToggleVisibility(maraud)}
                                  onFinish={() => openFinishModal(maraud)}
                              />
                            </div>
                        ))
                    )}
                  </div>
                </CollapsibleMaraudSection>

                <CollapsibleMaraudSection title="Passés" muted>
                  <div className="flex flex-col gap-3 opacity-70">
                    {passes.length === 0 ? (
                        <p className="text-base text-text-secondary">
                          Aucune maraude passée.
                        </p>
                    ) : (
                        passes.map((maraud) => (
                            <div
                                key={maraud.id}
                                className={
                                  updatingMaraudId === maraud.id
                                      ? "pointer-events-none opacity-70"
                                      : ""
                                }
                            >
                              <EventCard
                                  date={formatDate(maraud.date)}
                                  title={maraud.name}
                                  address={maraud.location}
                                  timeRange={`${formatTime(maraud.date)} → ${formatTime(
                                      maraud.endDate
                                  )}`}
                                  taskCount={maraud.tasks?.length ?? 0}
                                  author={maraud.author}
                                  inscriptions={maraud.inscriptions}
                                  image={maraud.thumbnail || undefined}
                                  isVisible={maraud.isVisible}
                                  isFinished={maraud.isFinished}
                                  onOpen={() => router.push(`/maraudes/${maraud.id}`)}
                                  onDelete={() => openDeleteModal(maraud)}
                                  onView={() => handleToggleVisibility(maraud)}
                                  onFinish={() => openFinishModal(maraud)}
                              />
                            </div>
                        ))
                    )}
                  </div>
                </CollapsibleMaraudSection>
              </div>
          )}
        </main>

        {isPanelOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                  className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
                  onClick={() => {
                    if (!isCreating) {
                      setIsPanelOpen(false);
                    }
                  }}
              />

              <div className="relative bg-bg-2 w-full max-w-md rounded-2xl p-8 shadow-2xl animate-in zoom-in duration-200">
                <h2 className="text-xl font-bold text-text-main mb-6">
                  Créer une maraude
                </h2>

                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-main-500 uppercase mb-1">
                      Nom
                    </label>
                    <input
                        required
                        type="text"
                        placeholder="Maraude Nord"
                        className="w-full bg-bg-3 rounded-lg px-4 py-3 text-text-main text-sm focus:outline-none focus:bg-bg-4 transition-colors placeholder:text-text-secondary/40"
                        value={newMaraud.name}
                        onChange={(e) =>
                            setNewMaraud({
                              ...newMaraud,
                              name: e.target.value,
                            })
                        }
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-main-500 uppercase mb-1">
                      Lieu
                    </label>
                    <input
                        required
                        type="text"
                        placeholder="32 avenue de la République..."
                        className="w-full bg-bg-3 rounded-lg px-4 py-3 text-text-main text-sm focus:outline-none focus:bg-bg-4 transition-colors placeholder:text-text-secondary/40"
                        value={newMaraud.location}
                        onChange={(e) =>
                            setNewMaraud({
                              ...newMaraud,
                              location: e.target.value,
                            })
                        }
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-main-500 uppercase mb-1">
                      Début
                    </label>
                    <input
                        required
                        type="datetime-local"
                        className="w-full bg-bg-3 rounded-lg px-4 py-3 text-text-main text-sm focus:outline-none focus:bg-bg-4 transition-colors"
                        value={newMaraud.date}
                        onChange={(e) =>
                            setNewMaraud({
                              ...newMaraud,
                              date: e.target.value,
                            })
                        }
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-main-500 uppercase mb-1">
                      Fin
                    </label>
                    <input
                        required
                        type="datetime-local"
                        min={newMaraud.date || undefined}
                        className="w-full bg-bg-3 rounded-lg px-4 py-3 text-text-main text-sm focus:outline-none focus:bg-bg-4 transition-colors"
                        value={newMaraud.endDate}
                        onChange={(e) =>
                            setNewMaraud({
                              ...newMaraud,
                              endDate: e.target.value,
                            })
                        }
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-main-500 uppercase mb-1">
                      Description
                    </label>
                    <textarea
                        rows={3}
                        placeholder="Détails de la maraude..."
                        className="w-full bg-bg-3 rounded-lg px-4 py-3 text-text-main text-sm focus:outline-none focus:bg-bg-4 transition-colors resize-none placeholder:text-text-secondary/40"
                        value={newMaraud.description}
                        onChange={(e) =>
                            setNewMaraud({
                              ...newMaraud,
                              description: e.target.value,
                            })
                        }
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        disabled={isCreating}
                        onClick={() => setIsPanelOpen(false)}
                        className={`${BUTTON_ANIMATION} flex-1 px-4 py-3 rounded-lg bg-bg-3 text-text-main text-sm font-semibold hover:bg-bg-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                    >
                      Annuler
                    </button>

                    <button
                        type="submit"
                        disabled={isCreating}
                        className={`${BUTTON_ANIMATION} flex-1 px-4 py-3 rounded-lg bg-main-500 text-white text-sm font-semibold hover:bg-main-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                    >
                      {isCreating ? "Création..." : "Confirmer"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}

        {maraudToDelete && (
            <ConfirmDeleteModal
                title="Supprimer la maraude ?"
                message={
                  <>
                    Cette action supprimera définitivement la maraude{" "}
                    <span className="font-semibold text-text-main">
                {maraudToDelete.name}
              </span>{" "}
                    ainsi que les inscriptions associées.
                  </>
                }
                iconClassName="bi bi-trash3-fill"
                iconContainerClassName="bg-secondary-500/10 text-secondary-600"
                confirmLabel="Supprimer"
                loadingLabel="Suppression..."
                isLoading={isDeleting}
                onCancel={closeDeleteModal}
                onConfirm={confirmDelete}
            />
        )}

        {maraudToFinish && (
            <ConfirmDeleteModal
                title="Terminer la maraude ?"
                message={
                  <>
                    Cette action passera{" "}
                    <span className="font-semibold text-text-main">
                {maraudToFinish.name}
              </span>{" "}
                    en terminé et retirera définitivement des stocks les ressources
                    utilisées par ses tâches.
                  </>
                }
                iconClassName="bi bi-check2-circle"
                iconContainerClassName="bg-green-500/10 text-green-400"
                confirmLabel="Terminer"
                loadingLabel="Finalisation..."
                isLoading={isFinishing}
                onCancel={closeFinishModal}
                onConfirm={confirmFinish}
            />
        )}
      </div>
  );
}