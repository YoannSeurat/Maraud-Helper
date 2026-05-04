"use client";

import Image from "next/image";
import Link from "next/link";
import UserCard from "./UserCard";

export default function Header() {
    return (
        <header className="flex items-center justify-between bg-bg/95 px-9 py-6 backdrop-blur-md">
            <Link href="/" className="flex items-center gap-3">
                <Image
                    src="/assets/logo.svg"
                    alt="logo"
                    width={26}
                    height={26}
                    style={{
                        width: "26px",
                        height: "26px",
                    }}
                />

                <p className="text-2xl font-bold tracking-tight text-text-main">
                    Maraud <span className="text-main-500">Helper</span>
                </p>
            </Link>

            <UserCard />
        </header>
    );
}