"use client";

import Image from "next/image";

export default function MobileLogo() {
    return (
        <div className="flex items-center justify-center gap-2 py-7">
            <Image
                src="/assets/logo.svg"
                alt="logo"
                width={25}
                height={25}
                style={{
                    width: "25px",
                    height: "25px",
                }}
            />

            <p className="text-[26px] font-bold tracking-tight text-text-main">
                Maraud <span className="text-main-500">Helper</span>
            </p>
        </div>
    );
}