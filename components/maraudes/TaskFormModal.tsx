"use client";

import { useState } from "react";
import {
    ApiMaraud,
    ApiMaraudTask,
    createMaraudTask,
    updateMaraudTask,
} from "@/lib/api/maraudes";

const BUTTON_ANIMATION =
    "cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-95";

type TaskFormModalProps = {
    maraud: ApiMaraud;
    task: ApiMaraudTask | null;
    isUpdating: boolean;
    setIsUpdating: (value: boolean) => void;
    onClose: () => void;
    onUpdated: (maraud: ApiMaraud) => void;
    onError: (message: string | null) => void;
};

const toDatetimeLocalValue = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "";

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
};

export default function TaskFormModal({
                                          maraud,
                                          task,
                                          isUpdating,
                                          setIsUpdating,
                                          onClose,
                                          onUpdated,
                                          onError,
                                      }: TaskFormModalProps) {
    const [taskForm, setTaskForm] = useState({
        name: task?.name ?? "",
        startTime: task
            ? toDatetimeLocalValue(task.startTime)
            : toDatetimeLocalValue(maraud.date),
    });

    const submitTaskForm = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            setIsUpdating(true);
            onError(null);

            if (!taskForm.name.trim()) {
                onError("Le nom de la tâche est obligatoire.");
                return;
            }

            if (!taskForm.startTime) {
                onError("L'heure de la tâche est obligatoire.");
                return;
            }

            const taskDate = new Date(taskForm.startTime);

            if (
                taskDate < new Date(maraud.date) ||
                taskDate > new Date(maraud.endDate)
            ) {
                onError(
                    "L'heure de la tâche doit être comprise dans la plage horaire de la maraude."
                );
                return;
            }

            const updated = task
                ? await updateMaraudTask(task.id, {
                    name: taskForm.name,
                    startTime: taskForm.startTime,
                })
                : await createMaraudTask(maraud.id, {
                    name: taskForm.name,
                    startTime: taskForm.startTime,
                });

            onUpdated(updated);
        } catch (error) {
            console.error(error);
            onError(
                error instanceof Error
                    ? error.message
                    : "Erreur lors de l'enregistrement de la tâche."
            );
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000099] backdrop-blur-md p-4">
            <div className="w-full max-w-md rounded-xl bg-[#231212] p-7 shadow-2xl">
                <h2 className="mb-6 text-xl font-bold text-white">
                    {task ? "Modifier la tâche" : "Ajouter une tâche"}
                </h2>

                <form onSubmit={submitTaskForm} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase text-main-500">
                            Nom
                        </label>
                        <input
                            required
                            value={taskForm.name}
                            onChange={(event) =>
                                setTaskForm({ ...taskForm, name: event.target.value })
                            }
                            placeholder="Préparation des sacs"
                            className="w-full rounded-md bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:bg-white/15"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase text-main-500">
                            Heure
                        </label>
                        <input
                            required
                            type="datetime-local"
                            min={toDatetimeLocalValue(maraud.date)}
                            max={toDatetimeLocalValue(maraud.endDate)}
                            value={taskForm.startTime}
                            onChange={(event) =>
                                setTaskForm({
                                    ...taskForm,
                                    startTime: event.target.value,
                                })
                            }
                            className="w-full rounded-md bg-white/10 px-4 py-3 text-sm text-white outline-none focus:bg-white/15"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isUpdating}
                            className={`${BUTTON_ANIMATION} flex-1 rounded-md bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed`}
                        >
                            Annuler
                        </button>

                        <button
                            type="submit"
                            disabled={isUpdating}
                            className={`${BUTTON_ANIMATION} flex-1 rounded-md bg-main-500 px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed`}
                        >
                            {isUpdating ? "Enregistrement..." : "Valider"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}