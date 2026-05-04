import React from "react";
import Image from "next/image";

interface User {
    id: number;
    name: string;
    picture?: string | null;
}

interface MaraudInscription {
    userId: number;
    user: User;
}

interface EventCardProps {
    date: string;
    title: string;
    address: string;
    timeRange: string;
    taskCount: number;
    author: User;
    inscriptions: MaraudInscription[];
    image?: string;
    isVisible: boolean;
    isFinished: boolean;
    onOpen?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    onFinish?: () => void;
}

const getUserImageSrc = (picture?: string | null) => {
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

const getInitial = (name: string) => {
    return name.trim().charAt(0).toUpperCase() || "?";
};

const EventCard = ({
                       date,
                       title,
                       address,
                       timeRange,
                       taskCount,
                       author,
                       inscriptions,
                       image = "https://via.placeholder.com/60",
                       isVisible,
                       isFinished,
                       onOpen,
                       onDelete,
                       onView,
                       onFinish,
                   }: EventCardProps) => {
    const attendeesCount = inscriptions.length;
    const previewAttendees = inscriptions.slice(0, 2);
    const authorImageSrc = getUserImageSrc(author.picture);

    return (
        <div
            onClick={onOpen}
            className={`flex p-3 items-center justify-between w-full bg-bg-2 rounded-lg overflow-hidden text-text-main min-h-16 transition-all duration-150 hover:bg-bg-3 ${
                onOpen ? "cursor-pointer" : ""
            } ${!isVisible ? "opacity-60" : ""}`}
        >
            <div className="flex items-center h-full min-w-0">
                <div className="h-[60px] w-[60px] shrink-0">
                    <img
                        src={image}
                        alt="Preview"
                        className="h-full w-full object-cover opacity-40 bg-black"
                    />
                </div>

                <div className="flex flex-col px-5 justify-center min-w-0">
                    <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-main-500 uppercase tracking-tight leading-none">
              {date}
            </span>

                        {!isVisible && (
                            <span className="rounded-full bg-bg-3 px-2 py-0.5 text-[9px] font-bold uppercase text-text-secondary">
                Cachée
              </span>
                        )}

                        {isFinished && (
                            <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-green-400">
                Terminée
              </span>
                        )}
                    </div>

                    <h3 className="font-semibold text-lg leading-tight text-text-main truncate">
                        {title}
                    </h3>

                    <div className="flex items-center gap-2 mt-1">
                        <div className="h-4 w-4 rounded-full overflow-hidden bg-bg-4 flex items-center justify-center shrink-0">
                            {authorImageSrc ? (
                                <Image
                                    src={authorImageSrc}
                                    alt={author.name}
                                    width={16}
                                    height={16}
                                    className="h-full w-full object-cover opacity-80"
                                    unoptimized
                                />
                            ) : (
                                <span className="text-[9px] font-bold text-text-main">
                  {getInitial(author.name)}
                </span>
                            )}
                        </div>

                        <span className="text-[11px] text-text-secondary font-medium truncate">
              {author.name}
            </span>
                    </div>
                </div>
            </div>

            <div className="hidden md:flex items-center gap-2.5 text-text-secondary px-3">
                <i className="bi bi-map text-[14px]"></i>
                <span className="text-[12px] truncate max-w-[170px]">{address}</span>
            </div>

            <div className="hidden lg:flex items-center gap-2.5 text-text-secondary px-3">
                <i className="bi bi-clock text-[14px]"></i>
                <span className="text-[12px] whitespace-nowrap">{timeRange}</span>
            </div>

            <div className="flex items-center gap-7 px-4 shrink-0">
                <div className="hidden xl:flex items-center gap-2.5 text-text-secondary">
                    <i className="bi bi-briefcase text-[14px]"></i>
                    <span className="text-[12px]">{taskCount} tâches</span>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                    <div className="flex items-center -space-x-1.5">
                        {previewAttendees.map((insc, index) => {
                            const userImageSrc = getUserImageSrc(insc.user.picture);

                            return (
                                <div
                                    key={`${insc.userId}-${index}`}
                                    className="h-6 w-6 rounded-full overflow-hidden bg-bg-4 flex items-center justify-center"
                                    title={insc.user.name}
                                >
                                    {userImageSrc ? (
                                        <Image
                                            src={userImageSrc}
                                            alt={insc.user.name}
                                            width={24}
                                            height={24}
                                            className="h-full w-full object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <span className="text-[10px] font-bold text-text-main">
                      {getInitial(insc.user.name)}
                    </span>
                                    )}
                                </div>
                            );
                        })}

                        <div className="h-6 w-6 rounded-full bg-main-500 flex items-center justify-center text-[9px] font-bold text-white z-10">
                            {attendeesCount}
                        </div>
                    </div>

                    <span className="text-[11px] text-text-secondary hidden sm:inline">
            inscrits
          </span>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onDelete?.();
                        }}
                        className="h-8 w-8 flex items-center justify-center rounded-md bg-main-500 text-white transition-all duration-150 hover:scale-110 hover:bg-main-600 cursor-pointer active:scale-95"
                        aria-label="Supprimer la maraude"
                        title="Supprimer"
                    >
                        <i className="bi bi-trash3-fill text-[14px]"></i>
                    </button>

                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onView?.();
                        }}
                        className={`h-8 w-8 flex items-center justify-center rounded-md transition-all duration-150 cursor-pointer active:scale-95 hover:scale-110 ${
                            isVisible
                                ? "bg-bg-3 text-text-secondary hover:bg-bg-4"
                                : "bg-secondary-500/10 text-secondary-600 hover:bg-secondary-500/20"
                        }`}
                        aria-label={
                            isVisible
                                ? "Cacher la maraude aux membres"
                                : "Afficher la maraude aux membres"
                        }
                        title={
                            isVisible
                                ? "Visible par les membres"
                                : "Cachée pour les membres"
                        }
                    >
                        <i
                            className={`bi ${
                                isVisible ? "bi-eye" : "bi-eye-slash"
                            } text-[14px]`}
                        ></i>
                    </button>

                    <button
                        type="button"
                        disabled={isFinished}
                        onClick={(event) => {
                            event.stopPropagation();
                            onFinish?.();
                        }}
                        className={`h-8 w-8 flex items-center justify-center rounded-md transition-all duration-150 cursor-pointer active:scale-95 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${
                            isFinished
                                ? "bg-green-500/10 text-green-400"
                                : "bg-bg-3 text-text-secondary hover:bg-green-500/10 hover:text-green-400"
                        }`}
                        aria-label="Marquer la maraude comme terminée"
                        title={isFinished ? "Déjà terminée" : "Marquer comme terminée"}
                    >
                        <i className="bi bi-check2-circle text-[15px]"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventCard;