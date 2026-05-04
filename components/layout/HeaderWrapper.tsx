"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function HeaderWrapper() {
    const pathname = usePathname();

    const hiddenRoutes = ["/login", "/register", "/mobile-only"];
    const shouldHide =
        hiddenRoutes.includes(pathname) || pathname.startsWith("/mobile");

    if (shouldHide) return null;

    return (
        <div className="sticky top-0 z-40 hidden md:block">
            <Header />
        </div>
    );
}