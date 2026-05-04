"use client";

import { MobileMaraudTask } from "@/lib/api/mobile";

type MobileModeTaskCardProps = {
    task: MobileMaraudTask;
    onClick: () => void;
};

function getTaskTotals(task: MobileMaraudTask) {
    const total = task.stockUsages.reduce((sum, usage) => sum + usage.quantity, 0);
    const done = task.stockUsages.reduce(
        (sum, usage) => sum + Math.min(usage.completedCount, usage.quantity),
        0
    );

    return { total, done };
}

function formatTime(dateString: string) {
    const date = new Date(dateString);

    return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function MobileModeTaskCard({
                                               task,
                                               onClick,
                                           }: MobileModeTaskCardProps) {
    const { total, done } = getTaskTotals(task);
    const ratio = total === 0 ? 0 : Math.min(100, Math.round((done / total) * 100));

    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full rounded-[22px] bg-bg-2 p-5 text-left transition-all duration-150 active:scale-[0.98]"
        >
            <div className="mb-5 flex items-center justify-between">
                <p className="text-base text-text-secondary">{formatTime(task.startTime)}</p>
            </div>

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-text-main">{task.name}</h2>

                <div className="flex items-center gap-3">
                    <p className="text-xl font-semibold text-text-main">
                        {done}/{total}
                    </p>

                    <div className="h-5 w-[96px] overflow-hidden rounded bg-bg-4">
                        <div
                            className="h-full rounded bg-main-500"
                            style={{ width: `${ratio}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-4 space-y-1">
                {task.stockUsages.map((usage) => (
                    <p key={usage.id} className="text-lg leading-tight">
            <span
                className={
                    usage.completedCount >= usage.quantity
                        ? "text-text-secondary line-through"
                        : "text-main-500"
                }
            >
              {usage.completedCount}/{usage.quantity}
            </span>{" "}
                        <span
                            className={
                                usage.completedCount >= usage.quantity
                                    ? "text-text-secondary line-through"
                                    : "text-text-secondary"
                            }
                        >
              {usage.stockItem.name}
            </span>
                    </p>
                ))}
            </div>
        </button>
    );
}