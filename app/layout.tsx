import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap-icons/font/bootstrap-icons.css";
import BottomNavWrapper from "../component/BottomNavWrapper";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Maraud Helper",
    description: "Plateforme de gestion des maraudes et des stocks.",
    icons: {
        icon: "/assets/logo.svg",
        shortcut: "/assets/logo.svg",
        apple: "/assets/logo.svg",
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="fr"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
        <body className="min-h-full flex flex-col bg-bg text-text-main">
            <HeaderWrapper />
            {children}
            <BottomNavWrapper />
        </body>
        </html>
    );
}