"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Sparkles } from "lucide-react";

export function WelcomePopup() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if user has seen the popup
        const hasSeenPopup = localStorage.getItem("nexus_welcome_seen");
        if (!hasSeenPopup) {
            // Show popup after a short delay for better UX
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem("nexus_welcome_seen", "true");
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Welcome to Nexus">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-gradient-to-tr from-blue-600/20 to-cyan-400/20 border border-cyan-500/30">
                    <Sparkles className="w-8 h-8 text-cyan-400" />
                </div>

                <h3 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Your Personal Dashboard
                </h3>

                <p className="text-white/60 leading-relaxed">
                    Manage your schedule, finances, and tasks in one premium interface.
                    Explore the bottom navigation to get started.
                </p>

                <button
                    onClick={handleClose}
                    className="w-full py-3 px-4 mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    Get Started
                </button>
            </div>
        </Modal>
    );
}
