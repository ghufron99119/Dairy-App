import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface GlassButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "ghost" | "danger";
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
    ({ className, variant = "primary", children, ...props }, ref) => {
        const variants = {
            primary:
                "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 border-none",
            ghost:
                "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20",
            danger:
                "bg-red-500/20 border border-red-500/50 text-red-200 hover:bg-red-500/30",
        };

        return (
            <motion.button
                ref={ref}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                className={cn(
                    "relative inline-flex items-center justify-center rounded-xl px-6 py-3 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none",
                    variants[variant],
                    className
                )}
                {...props}
            >
                {children}
            </motion.button>
        );
    }
);
GlassButton.displayName = "GlassButton";
