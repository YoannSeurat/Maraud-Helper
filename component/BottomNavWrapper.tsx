"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function BottomNavWrapper() {
    const pathname = usePathname();

    const hiddenRoutes = ["/login", "/register", "/mobile-only"];
    const shouldHide =
        hiddenRoutes.includes(pathname) || pathname.startsWith("/mobile");

    if (shouldHide) return null;

    return (
        <div className="hidden md:block">
            <BottomNav />
        </div>
    );
}