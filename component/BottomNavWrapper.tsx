"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function BottomNavWrapper() {
    const pathname = usePathname();

    const hiddenRoutes = ["/login", "/register"];
    const shouldHide = hiddenRoutes.includes(pathname);

    if (shouldHide) return null;

    return (
        <div className="hidden md:block">
            <BottomNav />
        </div>
    );
}
