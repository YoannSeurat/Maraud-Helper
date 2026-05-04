"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    {
        href: "/mobile",
        icon: "bi-briefcase",
        label: "Maraudes",
    },
    {
        href: "/mobile/mes-maraudes",
        icon: "bi-person-walking",
        label: "Mes maraudes",
    },
    {
        href: "/mobile/profil",
        icon: "bi-person",
        label: "Profil",
    },
];

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-6 left-1/2 z-40 flex w-[320px] -translate-x-1/2 items-center justify-between rounded-full bg-bg-2 px-5 py-2.5 shadow-2xl">
            {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex h-12 w-[86px] items-center justify-center rounded-full transition-all duration-150 ${
                            isActive
                                ? "bg-main-500 text-white"
                                : "text-text-secondary hover:text-text-main"
                        }`}
                        aria-label={item.label}
                    >
                        <i className={`bi ${item.icon} text-[22px]`}></i>
                    </Link>
                );
            })}
        </nav>
    );
}