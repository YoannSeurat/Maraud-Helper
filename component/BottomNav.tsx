"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  activeWhen: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  {
    href: "/tableau-de-bord",
    label: "Tableau de bord",
    icon: "/assets/tableaudebord.svg",
    activeWhen: (pathname) => pathname === "/tableau-de-bord",
  },
  {
    href: "/",
    label: "Maraudes",
    icon: "/assets/personwalking.svg",
    activeWhen: (pathname) => pathname === "/" || pathname.startsWith("/maraudes"),
  },
  {
    href: "/gestion-stock",
    label: "Gestion du stock",
    icon: "/assets/stock.svg",
    activeWhen: (pathname) => pathname === "/gestion-stock",
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      {navItems.map((item) => {
        const isActive = item.activeWhen(pathname);

        return (
          <Link key={item.href} href={item.href} className={isActive ? "active" : undefined} aria-current={isActive ? "page" : undefined}>
            <Image src={item.icon} alt="" aria-hidden="true" width={18} height={18} className="icon-img nav-icon" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
