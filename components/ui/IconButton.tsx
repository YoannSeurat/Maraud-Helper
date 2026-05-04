"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type IconButtonProps = {
    children: ReactNode;
    icon?: string;
    type?: "button" | "submit";
    href?: string;
    disabled?: boolean;
    variant?: "main" | "secondary" | "ghost";
    size?: "sm" | "md";
    className?: string;
    onClick?: () => void;
};

const baseClass =
    "inline-flex cursor-pointer items-center justify-center rounded-md font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100";

const sizeClasses = {
    sm: "gap-1.5 px-2.5 py-1.5 text-xs",
    md: "gap-2 px-3.5 py-2 text-sm",
};

const variantClasses = {
    main: "bg-main-500 text-white hover:bg-main-600",
    secondary: "bg-bg-3 text-text-main hover:bg-bg-4",
    ghost: "bg-white/10 text-text-main hover:bg-white/15",
};

export default function IconButton({
                                       children,
                                       icon = "bi bi-plus-lg",
                                       type = "button",
                                       href,
                                       disabled = false,
                                       variant = "main",
                                       size = "md",
                                       className = "",
                                       onClick,
                                   }: IconButtonProps) {
    const classes = `${baseClass} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

    if (href) {
        return (
            <Link href={href} className={classes}>
                <i className={`${icon} ${size === "sm" ? "text-xs" : "text-sm"}`}></i>
                {children}
            </Link>
        );
    }

    return (
        <button type={type} disabled={disabled} onClick={onClick} className={classes}>
            <i className={`${icon} ${size === "sm" ? "text-xs" : "text-sm"}`}></i>
            {children}
        </button>
    );
}