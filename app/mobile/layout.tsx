"use client";

import { usePathname } from "next/navigation";
import MobileLogo from "@/components/mobile/MobileLogo";
import MobileNav from "@/components/mobile/MobileNav";

export default function MobileLayout({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const isMaraudMode =
        pathname.startsWith("/mobile/maraudes/") && pathname.includes("/mode");

    return (
        <div className="min-h-screen bg-bg pb-28 text-text-main">
            <MobileLogo />
            {children}

            {!isMaraudMode && <MobileNav />}
        </div>
    );
}