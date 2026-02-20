"use client";

import { ActivityPulse } from "@/components/nexus/activity-pulse";
import { Greeting } from "@/components/nexus/greeting";
import { WalletWidget } from "@/components/nexus/wallet-widget";
import { GlassCard } from "@/components/ui/glass-card";
import { NotesWidget } from "@/components/NotesWidget";
import { Clock, Check, ListChecks, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getLocalDateISOString } from "@/lib/date-utils";
import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useDateGuard } from "@/lib/hooks/use-date-guard";

interface Task {
    id: string;
    title: string;
    due_date: string | null;
    is_complete: boolean;
}

interface Schedule {
    id: string;
    title: string;
    start_time: string;
    end_time: string | null;
    type: string;
    location: string | null;
}

interface ChecklistItem {
    id: string;
    title: string;
}

interface ChecklistLog {
    item_id: string;
    is_completed: boolean;
}

export default function DashboardPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [nextSchedules, setNextSchedules] = useState<Schedule[]>([]);
    const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
    const [checklistLogs, setChecklistLogs] = useState<ChecklistLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Auto-refresh data when date changes (midnight crossing)
    useDateGuard(useCallback(() => {
        window.dispatchEvent(new Event("refresh-data"));
    }, []));

    const fetchData = useCallback(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch incomplete tasks
        const { data: taskData } = await supabase
            .from("tasks")
            .select("id, title, due_date, is_complete")
            .eq("user_id", user.id)
            .eq("is_complete", false)
            .order("due_date", { ascending: true })
            .limit(3);

        if (taskData) setTasks(taskData);

        // Fetch today's schedules
        const today = new Date();
        const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
        const currentTime = today.toTimeString().slice(0, 5);

        const { data: scheduleData } = await supabase
            .from("schedules")
            .select("id, title, start_time, end_time, type, location")
            .eq("user_id", user.id)
            .eq("day_of_week", dayOfWeek)
            .gte("start_time", currentTime)
            .order("start_time", { ascending: true })
            .limit(3);

        if (scheduleData) setNextSchedules(scheduleData);

        // Fetch today's checklist
        const todayStr = getLocalDateISOString();

        const { data: itemsData } = await supabase
            .from("checklist_items")
            .select("id, title")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .order("sort_order", { ascending: true });

        const { data: logsData } = await supabase
            .from("checklist_logs")
            .select("item_id, is_completed")
            .eq("user_id", user.id)
            .eq("log_date", todayStr);

        if (itemsData) setChecklistItems(itemsData);
        if (logsData) setChecklistLogs(logsData);

        // Update activity log score based on checklist completion
        if (itemsData && logsData) {
            const completedCount = logsData.filter((l: { is_completed: boolean }) => l.is_completed).length;
            const totalCount = itemsData.length;
            const score = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            // Upsert today's activity log
            const { data: existingLog } = await supabase
                .from("activity_logs")
                .select("id")
                .eq("user_id", user.id)
                .eq("log_date", todayStr)
                .single();

            if (existingLog) {
                await supabase
                    .from("activity_logs")
                    .update({ score })
                    .eq("id", existingLog.id);
            } else {
                await supabase
                    .from("activity_logs")
                    .insert({ user_id: user.id, log_date: todayStr, score });
            }
        }

        setLoading(false);
    }, []);


    useEffect(() => {
        fetchData();

        const handleRefresh = () => fetchData();
        window.addEventListener("refresh-data", handleRefresh);

        return () => {
            window.removeEventListener("refresh-data", handleRefresh);
        };
    }, [fetchData]);

    const toggleTask = useCallback(async (taskId: string) => {
        const supabase = createClient();
        await supabase
            .from("tasks")
            .update({ is_complete: true })
            .eq("id", taskId);

        setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }, []);

    const toggleChecklist = async (itemId: string) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const todayStr = getLocalDateISOString();
        const existingLog = checklistLogs.find((l) => l.item_id === itemId);

        if (existingLog) {
            const newCompleted = !existingLog.is_completed;
            await supabase
                .from("checklist_logs")
                .update({
                    is_completed: newCompleted,
                    completed_at: newCompleted ? new Date().toISOString() : null,
                })
                .eq("user_id", user.id)
                .eq("item_id", itemId)
                .eq("log_date", todayStr);
        } else {
            await supabase.from("checklist_logs").insert({
                user_id: user.id,
                item_id: itemId,
                log_date: todayStr,
                is_completed: true,
                completed_at: new Date().toISOString(),
            });
        }

        fetchData();
    };

    const isChecklistCompleted = (itemId: string) => {
        return checklistLogs.find((l) => l.item_id === itemId)?.is_completed ?? false;
    };

    const checklistCompleted = useMemo(() =>
        checklistItems.filter((item) => isChecklistCompleted(item.id)).length,
        [checklistItems, checklistLogs]);
    const checklistTotal = checklistItems.length;
    const checklistPercent = useMemo(() =>
        checklistTotal > 0 ? Math.round((checklistCompleted / checklistTotal) * 100) : 0,
        [checklistCompleted, checklistTotal]);

    const formatDueDate = (dateStr: string | null) => {
        if (!dateStr) return "No due date";
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return `Hari ini, ${date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
        }
        if (date.toDateString() === tomorrow.toDateString()) {
            return `Besok, ${date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
        }
        return date.toLocaleDateString("id-ID", { weekday: "long", hour: "2-digit", minute: "2-digit" });
    };

    const typeColors: Record<string, string> = {
        mahad: "bg-emerald-500/20 text-emerald-400",
        campus: "bg-blue-500/20 text-blue-400",
        work: "bg-amber-500/20 text-amber-400",
    };

    return (
        <div className="w-full pb-20">
            <Greeting />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 auto-rows-min">

                {/* Activity Pulse */}
                <div className="sm:col-span-2 min-h-[260px]">
                    <ActivityPulse />
                </div>

                {/* Daily Checklist Widget */}
                <div className="sm:col-span-2 min-h-[260px]">
                    <GlassCard className="h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <ListChecks className="w-5 h-5 text-cyan-400" suppressHydrationWarning />
                                <h3 className="text-lg font-semibold text-white">Checklist Hari Ini</h3>
                            </div>
                            <Link
                                href="/checklist"
                                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                            >
                                Lihat Semua <ArrowRight className="w-3 h-3" suppressHydrationWarning />
                            </Link>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs text-white/50">
                                    {checklistCompleted}/{checklistTotal} selesai
                                </span>
                                <span className="text-xs font-medium text-cyan-400">{checklistPercent}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${checklistPercent}%` }}
                                    transition={{ duration: 0.8 }}
                                />
                            </div>
                        </div>

                        {/* Checklist Items */}
                        <div className="space-y-2 overflow-y-auto flex-1">
                            {checklistItems.length > 0 ? (
                                checklistItems.map((item) => {
                                    const checked = isChecklistCompleted(item.id);
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleChecklist(item.id)}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer active:scale-[0.98] ${checked
                                                ? "bg-emerald-500/10 border-emerald-500/20"
                                                : "bg-white/5 border-white/5 hover:bg-white/10"
                                                }`}
                                        >
                                            <div
                                                className={`h-5 w-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${checked
                                                    ? "bg-emerald-500 border-emerald-500"
                                                    : "border-white/30"
                                                    }`}
                                            >
                                                {checked && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <span
                                                className={`text-sm font-medium transition-all ${checked ? "text-white/50 line-through" : "text-white"
                                                    }`}
                                            >
                                                {item.title}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <p className="text-sm text-white/30">Belum ada checklist</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* Wallet */}
                <div className="sm:col-span-1 min-h-[200px]">
                    <WalletWidget />
                </div>

                {/* Next Class */}
                <div className="sm:col-span-1 min-h-[200px]">
                    <GlassCard className="h-full flex flex-col relative overflow-hidden bg-gradient-to-br from-indigo-900/40 to-purple-900/40">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4 text-indigo-300" suppressHydrationWarning />
                            <h3 className="text-sm font-medium text-white/60">Jadwal Berikutnya</h3>
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                            {nextSchedules.length > 0 ? (
                                <div className="space-y-3">
                                    {nextSchedules.slice(0, 2).map((schedule, i) => (
                                        <div
                                            key={schedule.id}
                                            className={`${i === 0 ? "" : "opacity-60"}`}
                                        >
                                            <p className={`font-bold text-white ${i === 0 ? "text-xl" : "text-sm"}`}>
                                                {schedule.start_time?.slice(0, 5)}
                                                {schedule.end_time ? ` - ${schedule.end_time.slice(0, 5)}` : ""}
                                            </p>
                                            <p className={`text-indigo-200 font-medium ${i === 0 ? "text-sm" : "text-xs"}`}>
                                                {schedule.title}
                                            </p>
                                            {schedule.location && i === 0 && (
                                                <p className="text-xs text-white/40 mt-0.5">{schedule.location}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-sm text-indigo-200 font-medium">Tidak ada jadwal</p>
                                    <p className="text-xs text-white/40 mt-2">Hari ini kosong 🎉</p>
                                </div>
                            )}
                        </div>
                        <Link
                            href="/schedule"
                            className="text-xs text-indigo-300 hover:text-indigo-200 flex items-center gap-1 mt-2"
                        >
                            Lihat jadwal <ArrowRight className="w-3 h-3" suppressHydrationWarning />
                        </Link>
                    </GlassCard>
                </div>

                {/* Tasks */}
                <div className="sm:col-span-2 min-h-[200px]">
                    <GlassCard className="h-full flex flex-col">
                        <h3 className="text-lg font-semibold text-white mb-4">Urgent Tasks</h3>
                        <div className="space-y-3 overflow-y-auto flex-1">
                            {tasks.length > 0 ? (
                                tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        onClick={() => toggleTask(task.id)}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 active:scale-[0.98] transition-all cursor-pointer group"
                                    >
                                        <div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-cyan-500/50 group-hover:border-cyan-400 transition-colors" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white group-hover:text-cyan-200 transition-colors truncate">
                                                {task.title}
                                            </p>
                                            <p className="text-xs text-white/40">{formatDueDate(task.due_date)}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <p className="text-sm text-white/30">Belum ada task 🎉</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>


                {/* Notes Widget */}
                <div className="sm:col-span-2 min-h-[260px]">
                    <NotesWidget />
                </div>
            </div>
        </div>
    );
}
