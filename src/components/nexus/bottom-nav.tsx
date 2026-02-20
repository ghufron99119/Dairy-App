"use client";

import { cn } from "@/lib/utils";
import { Calendar, Home, Plus, ListChecks, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { QuickEntryModal } from "./quick-entry/quick-entry-modal";

export function BottomNav() {
    const pathname = usePathname();
    const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);

    const navItems = [
        { href: "/dashboard", icon: Home, label: "Home" },
        { href: "/schedule", icon: Calendar, label: "Schedule" },
        { href: "#create", icon: Plus, label: "Create", isSpecial: true },
        { href: "/finance", icon: Wallet, label: "Finance" },
        { href: "/checklist", icon: ListChecks, label: "Checklist" },
    ];

    return (
        <>
            <QuickEntryModal
                isOpen={isQuickEntryOpen}
                onClose={() => setIsQuickEntryOpen(false)}
            />

            <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-3 backdrop-blur-2xl shadow-xl shadow-black/40">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        if (item.isSpecial) {
                            return (
                                <button
                                    key={item.href}
                                    onClick={() => setIsQuickEntryOpen(!isQuickEntryOpen)}
                                    className="group mx-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-lg shadow-blue-500/40 transition-transform active:scale-95"
                                    suppressHydrationWarning
                                >
                                    <Plus
                                        className={`h-6 w-6 transition-transform duration-300 ${isQuickEntryOpen ? "rotate-45" : ""}`}
                                        suppressHydrationWarning
                                    />
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative flex h-10 w-10 flex-col items-center justify-center rounded-xl transition-colors",
                                    isActive ? "text-cyan-400" : "text-white/50 hover:text-white/80"
                                )}
                                suppressHydrationWarning
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 rounded-xl bg-white/10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <Icon className="relative h-5 w-5" suppressHydrationWarning />
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
