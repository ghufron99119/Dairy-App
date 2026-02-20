"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import React, { useEffect, useState } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "panel" | "neon";
}

export function GlassCard({
    children,
    className,
    variant = "default",
    ...props
}: GlassCardProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const variants = {
        default: "glass-card",
        panel: "glass-panel",
        neon: "glass-card border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]",
    };

    return (
        <motion.div
            initial={mounted ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={cn(
                "rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02]",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
}
