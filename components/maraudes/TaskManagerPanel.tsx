"use client";

import { useMemo, useState } from "react";
import {
    ApiMaraud,
    ApiMaraudTask,
    deleteMaraudTask,
    deleteTaskStockUsage,
} from "@/lib/api/maraudes";
import IconButton from "@/components/ui/IconButton";
import TaskFormModal from "./TaskFormModal";
import StockUsageModal from "./StockUsageModal";

const ICON_BUTTON_ANIMATION =
    "cursor-pointer transition-all duration-150 hover:scale-110 active:scale-95";

type TaskManagerPanelProps = {
    maraud: ApiMaraud;
    isUpdating: boolean;
    setIsUpdating: (value: boolean) => void;
    onClose: () => void;
    onUpdated: (maraud: ApiMaraud) => void;
};

const BUTTON_ANIMATION =
    "cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-95";

const formatTime = (dateString: string) => {
    const date = new Date(dateString);

    return date
        .toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        })
        .replace(":", ".");
};

const sortTasks = (tasks: ApiMaraudTask[]) => {
    return [...tasks].sort(
        (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
};

export default function TaskManagerPanel({
                                             maraud,
                                             isUpdating,
                                             setIsUpdating,
                                             onClose,
                                             onUpdated,
                                         }: TaskManagerPanelProps) {
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
    const [isStockFormOpen, setIsStockFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<ApiMaraudTask | null>(null);
    const [selectedTaskForStock, setSelectedTaskForStock] =
        useState<ApiMaraudTask | null>(null);
    const [taskPanelError, setTaskPanelError] = useState<string | null>(null);

    const sortedTasks = useMemo(() => sortTasks(maraud.tasks), [maraud.tasks]);

    const openCreateTaskPanel = () => {
        setEditingTask(null);
        setTaskPanelError(null);
        setIsTaskFormOpen(true);
    };

    const openEditTaskPanel = (task: ApiMaraudTask) => {
        setEditingTask(task);
        setTaskPanelError(null);
        setIsTaskFormOpen(true);
    };

    const openStockPanel = (task: ApiMaraudTask) => {
        setSelectedTaskForStock(task);
        setTaskPanelError(null);
        setIsStockFormOpen(true);
    };

    const handleDeleteTask = async (task: ApiMaraudTask) => {
        try {
            setIsUpdating(true);
            setTaskPanelError(null);

            const updated = await deleteMaraudTask(task.id);
            onUpdated(updated);
        } catch (error) {
            console.error(error);
            setTaskPanelError(
                error instanceof Error
                    ? error.message
                    : "Erreur lors de la suppression de la tâche."
            );
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteStockUsage = async (usageId: number) => {
        try {
            setIsUpdating(true);
            setTaskPanelError(null);

            const updated = await deleteTaskStockUsage(usageId);
            onUpdated(updated);
        } catch (error) {
            console.error(error);
            setTaskPanelError(
                error instanceof Error
                    ? error.message
                    : "Erreur lors de la suppression de l'étape."
            );
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-16 py-12 backdrop-blur-md">
                <div className="flex max-h-[calc(100vh-96px)] w-full max-w-[1780px] flex-col bg-bg-2 px-7 py-6 shadow-2xl">
                    <div className="mb-8 shrink-0">
                        <p className="text-sm font-bold uppercase tracking-wide text-main-500">
                            {maraud.name}
                        </p>

                        <h2 className="mt-1 text-3xl font-bold text-text-main">
                            Gestionnaire de tâches
                        </h2>
                    </div>

                    <div className="mb-5 flex shrink-0 items-center justify-between">
                        <h3 className="text-xl font-bold text-text-main">
                            Parcour à suivre
                        </h3>

                        <IconButton onClick={openCreateTaskPanel}>
                            Ajouter une tâche
                        </IconButton>
                    </div>

                    {taskPanelError && (
                        <div className="mb-5 shrink-0 rounded-md bg-secondary-500/10 px-4 py-3 text-sm text-secondary-700">
                            {taskPanelError}
                        </div>
                    )}

                    <div className="dark-vertical-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
                        {sortedTasks.length === 0 ? (
                            <div className="rounded-md bg-bg-3 px-5 py-8 text-center text-text-secondary">
                                Aucune tâche créée pour cette maraude.
                            </div>
                        ) : (
                            sortedTasks.map((task, index) => (
                                <div key={task.id} className="rounded-md bg-bg-3 p-3">
                                    <div className="flex items-start justify-between px-1 pb-4">
                                        <div className="flex items-start gap-5">
                                            <p className="pt-1 text-xl font-bold text-text-main">
                                                {formatTime(task.startTime)}
                                            </p>

                                            <div>
                                                <p className="text-[11px] font-bold uppercase text-main-500">
                                                    Tâche n°{index + 1}
                                                </p>

                                                <p className="text-lg font-bold text-text-main">
                                                    {task.name}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteTask(task)}
                                                disabled={isUpdating}
                                                className={`${ICON_BUTTON_ANIMATION} flex h-9 w-9 items-center justify-center rounded-md bg-bg-4 text-text-main hover:bg-main-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`}
                                            >
                                                <i className="bi bi-trash3-fill text-sm"></i>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => openEditTaskPanel(task)}
                                                disabled={isUpdating}
                                                className={`${ICON_BUTTON_ANIMATION} flex h-9 w-9 items-center justify-center rounded-md bg-bg-4 text-text-main hover:bg-bg-5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`}
                                            >
                                                <i className="bi bi-pencil text-sm"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-4 flex items-center justify-between px-1">
                                        <p className="text-base font-bold text-text-main">
                                            Utilisation des stocks
                                        </p>

                                        <IconButton
                                            size="sm"
                                            onClick={() => openStockPanel(task)}
                                            disabled={isUpdating}
                                        >
                                            Ajouter une étape
                                        </IconButton>
                                    </div>

                                    <div className="space-y-3">
                                        {task.stockUsages.length === 0 ? (
                                            <div className="rounded-md bg-bg-4 px-4 py-3 text-sm text-text-secondary">
                                                Aucun stock utilisé pour cette tâche.
                                            </div>
                                        ) : (
                                            task.stockUsages.map((usage) => (
                                                <div
                                                    key={usage.id}
                                                    className="flex items-center justify-between rounded-md bg-bg-4 px-4 py-3"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <p className="w-11 text-sm font-semibold text-text-secondary">
                                                            x{usage.quantity}
                                                        </p>

                                                        <p className="text-base font-bold text-text-main">
                                                            {usage.stockItem.name}
                                                        </p>

                                                        <p className="text-xs text-text-secondary">
                                                            Stock disponible : {usage.stockItem.currentCount}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteStockUsage(usage.id)}
                                                        disabled={isUpdating}
                                                        className={`${ICON_BUTTON_ANIMATION} flex h-8 w-8 items-center justify-center rounded-md bg-bg-5 text-text-main hover:bg-main-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`}
                                                    >
                                                        <i className="bi bi-trash3-fill text-xs"></i>
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-7 flex shrink-0 justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isUpdating}
                            className={`${BUTTON_ANIMATION} rounded-md bg-bg-3 px-5 py-3 text-sm font-semibold text-text-main hover:bg-bg-4 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`}
                        >
                            Annuler
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isUpdating}
                            className={`${BUTTON_ANIMATION} flex items-center gap-2 rounded-md bg-main-500 px-5 py-3 text-sm font-semibold text-white hover:bg-main-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`}
                        >
                            <i className="bi bi-save text-sm"></i>
                            Enregistrer
                        </button>
                    </div>
                </div>
            </div>

            {isTaskFormOpen && (
                <TaskFormModal
                    maraud={maraud}
                    task={editingTask}
                    isUpdating={isUpdating}
                    setIsUpdating={setIsUpdating}
                    onClose={() => {
                        setIsTaskFormOpen(false);
                        setEditingTask(null);
                    }}
                    onUpdated={(updated) => {
                        onUpdated(updated);
                        setIsTaskFormOpen(false);
                        setEditingTask(null);
                    }}
                    onError={setTaskPanelError}
                />
            )}

            {isStockFormOpen && selectedTaskForStock && (
                <StockUsageModal
                    task={selectedTaskForStock}
                    isUpdating={isUpdating}
                    setIsUpdating={setIsUpdating}
                    onClose={() => {
                        setIsStockFormOpen(false);
                        setSelectedTaskForStock(null);
                    }}
                    onUpdated={(updated) => {
                        onUpdated(updated);
                        setIsStockFormOpen(false);
                        setSelectedTaskForStock(null);
                    }}
                    onError={setTaskPanelError}
                />
            )}
        </>
    );
}