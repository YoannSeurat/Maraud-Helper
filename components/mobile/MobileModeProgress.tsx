"use client";

type MobileModeProgressProps = {
    percent: number;
};

export default function MobileModeProgress({ percent }: MobileModeProgressProps) {
    const safePercent = Math.max(0, Math.min(100, percent));

    return (
        <div className="rounded-[28px] bg-bg-2 px-5 py-8">
            <div className="relative mx-auto flex h-[210px] w-[210px] items-center justify-center">
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: `conic-gradient(#F93A59 ${safePercent * 3.6}deg, #633636 ${
                            safePercent * 3.6
                        }deg)`,
                    }}
                />

                <div className="absolute inset-[28px] rounded-full bg-bg-2" />

                <div className="relative text-center">
                    <p className="text-[40px] font-bold text-text-main">{safePercent}%</p>
                    <p className="mt-1 max-w-[120px] text-base leading-tight text-text-secondary">
                        De la maraude effectué
                    </p>
                </div>
            </div>
        </div>
    );
}