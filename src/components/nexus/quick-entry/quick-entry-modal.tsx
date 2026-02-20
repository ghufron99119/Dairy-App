"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, DollarSign, CheckSquare, ChevronLeft } from "lucide-react";
import { AddActivityForm } from "./add-activity-form";
import { AddFinanceForm } from "./add-finance-form";
import { AddScheduleForm } from "./add-schedule-form";

interface QuickEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ViewState = "menu" | "activity" | "finance" | "schedule";

export function QuickEntryModal({ isOpen, onClose }: QuickEntryModalProps) {
    const [view, setView] = useState<ViewState>("menu");

    // Reset view when modal closes
    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => setView("menu"), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleSuccess = () => {
        // Trigger generic data refresh event
        if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("refresh-data"));
        }
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="w-full max-w-sm bg-[#0a0a0a]/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[85vh]">

                            {/* Header (Back button if not in menu) */}
                            <div className="flex items-center justify-between p-4 border-b border-white/5">
                                {view !== "menu" ? (
                                    <button
                                        onClick={() => setView("menu")}
                                        className="p-2 -ml-2 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <h2 className="text-lg font-semibold text-white">Quick Entry</h2>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 -mr-2 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-4 overflow-y-auto custom-scrollbar">
                                {view === "menu" ? (
                                    <div className="space-y-3 pb-4">
                                        <button
                                            onClick={() => setView("activity")}
                                            className="w-full group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-white/10 transition-all text-left"
                                        >
                                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
                                                <CheckSquare className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">Add Activity</h3>
                                                <p className="text-sm text-white/50">Task, homework, or routine</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setView("finance")}
                                            className="w-full group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-white/10 transition-all text-left"
                                        >
                                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                                                <DollarSign className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">Record Finance</h3>
                                                <p className="text-sm text-white/50">Income or expense</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setView("schedule")}
                                            className="w-full group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-white/10 transition-all text-left"
                                        >
                                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">Schedule Input</h3>
                                                <p className="text-sm text-white/50">New class or event</p>
                                            </div>
                                        </button>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        {view === "activity" && (
                                            <AddActivityForm onSuccess={handleSuccess} onCancel={() => setView("menu")} />
                                        )}
                                        {view === "finance" && (
                                            <AddFinanceForm onSuccess={handleSuccess} onCancel={() => setView("menu")} />
                                        )}
                                        {view === "schedule" && (
                                            <AddScheduleForm onSuccess={handleSuccess} onCancel={() => setView("menu")} />
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
