"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Check, Plus, X, Trash2, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useDateGuard } from "@/lib/hooks/use-date-guard";
import { getLocalDateISOString } from "@/lib/date-utils";

interface ChecklistItem {
    id: string;
    title: string;
    category: string;
    sort_order: number;
    is_active: boolean;
}

interface ChecklistLog {
    id: string;
    item_id: string;
    log_date: string;
    is_completed: boolean;
}

export default function ChecklistPage() {
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [logs, setLogs] = useState<ChecklistLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formTitle, setFormTitle] = useState("");
    const [formCategory, setFormCategory] = useState<"daily" | "weekly" | "custom">("daily");
    const [selectedDate, setSelectedDate] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Auto-refresh when date changes (midnight crossing)
    useDateGuard(useCallback(() => {
        setSelectedDate(getLocalDateISOString());
    }, []));

    // Set date on client only to avoid hydration mismatch
    useEffect(() => {
        setSelectedDate(getLocalDateISOString());
        setMounted(true);
    }, []);

    const fetchData = useCallback(async () => {
        if (!selectedDate) return;
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: itemsData } = await supabase
            .from("checklist_items")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .order("sort_order", { ascending: true });

        const { data: logsData } = await supabase
            .from("checklist_logs")
            .select("*")
            .eq("user_id", user.id)
            .eq("log_date", selectedDate);

        if (itemsData) setItems(itemsData);
        if (logsData) setLogs(logsData);
        setLoading(false);
    }, [selectedDate]);

    useEffect(() => {
        if (selectedDate) fetchData();
    }, [fetchData, selectedDate]);

    const toggleCheck = async (itemId: string) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const existingLog = logs.find((l) => l.item_id === itemId);

        if (existingLog) {
            const newCompleted = !existingLog.is_completed;
            await supabase
                .from("checklist_logs")
                .update({
                    is_completed: newCompleted,
                    completed_at: newCompleted ? new Date().toISOString() : null,
                })
                .eq("id", existingLog.id);
        } else {
            await supabase.from("checklist_logs").insert({
                user_id: user.id,
                item_id: itemId,
                log_date: selectedDate,
                is_completed: true,
                completed_at: new Date().toISOString(),
            });
        }

        fetchData();
    };

    const addItem = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from("checklist_items").insert({
            user_id: user.id,
            title: formTitle,
            category: formCategory,
            sort_order: items.length + 1,
        });

        setFormTitle("");
        setShowForm(false);
        fetchData();
    };

    const deleteItem = async (itemId: string) => {
        const supabase = createClient();
        await supabase.from("checklist_items").update({ is_active: false }).eq("id", itemId);
        fetchData();
    };

    const isCompleted = (itemId: string) => {
        const log = logs.find((l) => l.item_id === itemId);
        return log?.is_completed ?? false;
    };

    const completedCount = useMemo(() =>
        items.filter((item) => isCompleted(item.id)).length,
        [items, logs]);
    const totalCount = items.length;
    const percentage = useMemo(() =>
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        [completedCount, totalCount]);

    const changeDate = (offset: number) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + offset);
        setSelectedDate(d.toISOString().split("T")[0]);
    };

    const isToday = mounted && selectedDate === getLocalDateISOString();

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr + "T00:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(d);
        target.setHours(0, 0, 0, 0);

        const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diff === 0) return "Hari Ini";
        if (diff === -1) return "Kemarin";
        if (diff === 1) return "Besok";

        return d.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
        });
    };

    // Group by category
    const dailyItems = useMemo(() => items.filter((i) => i.category === "daily"), [items]);
    const weeklyItems = useMemo(() => items.filter((i) => i.category === "weekly"), [items]);
    const customItems = useMemo(() => items.filter((i) => i.category === "custom"), [items]);

    const renderItemGroup = (groupItems: ChecklistItem[], title: string, color: string) => {
        if (groupItems.length === 0) return null;
        return (
            <div className="mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3 px-1">
                    {title}
                </h3>
                <div className="space-y-2">
                    {groupItems.map((item, index) => {
                        const checked = isCompleted(item.id);
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer active:scale-[0.98] ${checked
                                    ? "bg-emerald-500/10 border-emerald-500/20"
                                    : "bg-white/5 border-white/10 hover:bg-white/8"
                                    }`}
                                onClick={() => !editMode && toggleCheck(item.id)}
                            >
                                <div
                                    className={`flex-shrink-0 h-7 w-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${checked
                                        ? `bg-gradient-to-br ${color} border-transparent shadow-lg`
                                        : "border-white/30 group-hover:border-white/50"
                                        }`}
                                >
                                    <AnimatePresence>
                                        {checked && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                            >
                                                <Check className="w-4 h-4 text-white" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <span
                                    className={`flex-1 text-sm font-medium transition-all duration-300 ${checked ? "text-white/50 line-through" : "text-white"
                                        }`}
                                >
                                    {item.title}
                                </span>

                                {editMode && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteItem(item.id);
                                        }}
                                        className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </motion.button>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Checklist</h1>
                <div className="flex gap-2">
                    <GlassButton
                        variant="ghost"
                        className="h-10 w-10 p-0 rounded-xl text-xs"
                        onClick={() => setEditMode(!editMode)}
                    >
                        {editMode ? <X className="w-4 h-4" /> : <span className="text-xs">Edit</span>}
                    </GlassButton>
                    <GlassButton
                        variant="primary"
                        className="h-10 w-10 p-0 rounded-xl"
                        onClick={() => setShowForm(true)}
                    >
                        <Plus className="w-5 h-5" />
                    </GlassButton>
                </div>
            </div>

            {/* Date Selector */}
            <div className="flex items-center justify-between mb-6">
                <GlassButton
                    variant="ghost"
                    className="h-9 w-9 p-0 rounded-xl"
                    onClick={() => changeDate(-1)}
                >
                    <ChevronLeft className="w-4 h-4" />
                </GlassButton>
                <div className="text-center">
                    <p className="text-base font-semibold text-white">{selectedDate ? formatDate(selectedDate) : "..."}</p>
                    {!isToday && (
                        <button
                            onClick={() => setSelectedDate(getLocalDateISOString())}
                            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mx-auto mt-1"
                        >
                            <RotateCcw className="w-3 h-3" /> Hari Ini
                        </button>
                    )}
                </div>
                <GlassButton
                    variant="ghost"
                    className="h-9 w-9 p-0 rounded-xl"
                    onClick={() => changeDate(1)}
                >
                    <ChevronRight className="w-4 h-4" />
                </GlassButton>
            </div>

            {/* Progress Ring */}
            <GlassCard className="mb-6">
                <div className="flex items-center gap-6">
                    <div className="relative h-20 w-20 flex-shrink-0">
                        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
                            <circle
                                cx="36"
                                cy="36"
                                r="30"
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="6"
                            />
                            <circle
                                cx="36"
                                cy="36"
                                r="30"
                                fill="none"
                                stroke="url(#progressGradient)"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${(percentage / 100) * 188.5} 188.5`}
                                className="transition-all duration-700 ease-out"
                            />
                            <defs>
                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#06b6d4" />
                                    <stop offset="100%" stopColor="#22c55e" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-white">{percentage}%</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-xl font-bold text-white">
                            {completedCount}/{totalCount}
                        </p>
                        <p className="text-sm text-white/50">Tugas selesai</p>
                        {percentage === 100 && totalCount > 0 && (
                            <p className="text-xs text-emerald-400 mt-1">🎉 Sempurna!</p>
                        )}
                    </div>
                </div>
            </GlassCard>

            {/* Add Item Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-6"
                    >
                        <GlassCard className="border-cyan-500/30">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold text-white">Tambah Item</h3>
                                <button onClick={() => setShowForm(false)} className="text-white/50 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={addItem} className="space-y-4">
                                <GlassInput
                                    placeholder="Nama checklist..."
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    required
                                />
                                <div className="flex gap-2">
                                    {(["daily", "weekly", "custom"] as const).map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setFormCategory(cat)}
                                            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${formCategory === cat
                                                ? cat === "daily"
                                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                    : cat === "weekly"
                                                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                        : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                                : "bg-white/5 text-white/50 border border-white/10"
                                                }`}
                                        >
                                            {cat === "daily" ? "Harian" : cat === "weekly" ? "Mingguan" : "Custom"}
                                        </button>
                                    ))}
                                </div>
                                <GlassButton type="submit" className="w-full">
                                    Simpan
                                </GlassButton>
                            </form>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Checklist Items */}
            {loading ? (
                <GlassCard className="flex justify-center py-8">
                    <div className="h-6 w-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                </GlassCard>
            ) : items.length > 0 ? (
                <div>
                    {renderItemGroup(dailyItems, "🕌 Harian", "from-emerald-500 to-teal-500")}
                    {renderItemGroup(weeklyItems, "📅 Mingguan", "from-blue-500 to-indigo-500")}
                    {renderItemGroup(customItems, "✨ Custom", "from-purple-500 to-pink-500")}
                </div>
            ) : (
                <GlassCard className="flex flex-col items-center justify-center py-12">
                    <p className="text-white/30 text-sm mb-4">Belum ada checklist</p>
                    <GlassButton variant="ghost" onClick={() => setShowForm(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Tambah Item
                    </GlassButton>
                </GlassCard>
            )}
        </div>
    );
}
