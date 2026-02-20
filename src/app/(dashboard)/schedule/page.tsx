"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { ScheduleNoteSection } from "@/components/ScheduleNoteSection";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    X,
    Calendar as CalendarIcon,
    List,
    MapPin,
    GraduationCap,
    Clock,
    Trash2,
    Pencil,
    Save,
    BookOpen,
    Users,
    FileText,
    Eye,
} from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const DAYS_FULL = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const DAYS_SHORT = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const typeColors: Record<string, { border: string; bg: string; text: string; dot: string }> = {
    mahad: { border: "border-l-emerald-400", bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
    campus: { border: "border-l-blue-400", bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
    work: { border: "border-l-amber-400", bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
};

const typeLabels: Record<string, string> = {
    mahad: "Ma'had",
    campus: "Kampus",
    work: "Kerja",
};

const MONTH_NAMES = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

interface Schedule {
    id: string;
    title: string;
    start_time: string;
    end_time: string | null;
    type: string;
    day_of_week: number;
    location: string | null;
    lecturer: string | null;
    sks: number | null;
    class_group: string | null;
    description: string | null;
}

type ViewMode = "day" | "table" | "calendar";

export default function SchedulePage() {
    const [selectedDay, setSelectedDay] = useState(0);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("day");
    const [showFilter, setShowFilter] = useState<"all" | "campus" | "mahad">("all");
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

    // Form state
    const [formTitle, setFormTitle] = useState("");
    const [formDay, setFormDay] = useState(0);
    const [formStartTime, setFormStartTime] = useState("");
    const [formEndTime, setFormEndTime] = useState("");
    const [formType, setFormType] = useState("campus");
    const [formLocation, setFormLocation] = useState("");
    const [formLecturer, setFormLecturer] = useState("");
    const [formSks, setFormSks] = useState("");
    const [formClass, setFormClass] = useState("");
    const [formDesc, setFormDesc] = useState("");

    // Calendar state
    const [calendarMonth, setCalendarMonth] = useState(0);
    const [calendarYear, setCalendarYear] = useState(2026);
    const [mounted, setMounted] = useState(false);

    // Set date-dependent state on client only to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
        const d = new Date();
        const todayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
        setSelectedDay(todayIdx);
        setFormDay(todayIdx);
        setCalendarMonth(d.getMonth());
        setCalendarYear(d.getFullYear());
    }, []);

    const fetchSchedules = useCallback(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from("schedules")
            .select("*")
            .eq("user_id", user.id)
            .order("start_time", { ascending: true });

        if (data) setSchedules(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    // Update formDay when selectedDay changes, BUT only if we are NOT editing
    useEffect(() => {
        if (!editingId) {
            setFormDay(selectedDay);
        }
    }, [selectedDay, editingId]);

    const handleSaveSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const payload = {
            user_id: user.id,
            title: formTitle,
            day_of_week: formDay,
            start_time: formStartTime,
            end_time: formEndTime || null,
            type: formType,
            location: formLocation || null,
            lecturer: formLecturer || null,
            sks: formSks ? Number(formSks) : null,
            class_group: formClass || null,
            description: formDesc || null,
        };

        if (editingId) {
            await supabase.from("schedules").update(payload).eq("id", editingId);
        } else {
            await supabase.from("schedules").insert(payload);
        }

        resetForm();
        fetchSchedules();
    };

    const startEditing = (schedule: Schedule) => {
        setEditingId(schedule.id);
        setFormTitle(schedule.title);
        setFormDay(schedule.day_of_week);
        setFormStartTime(schedule.start_time);
        setFormEndTime(schedule.end_time || "");
        setFormType(schedule.type);
        setFormLocation(schedule.location || "");
        setFormLecturer(schedule.lecturer || "");
        setFormSks(schedule.sks?.toString() || "");
        setFormClass(schedule.class_group || "");
        setFormDesc(schedule.description || "");
        setShowForm(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setFormTitle("");
        setFormDay(selectedDay);
        setFormStartTime("");
        setFormEndTime("");
        setFormLocation("");
        setFormLecturer("");
        setFormSks("");
        setFormClass("");
        setFormDesc("");
        setShowForm(false);
    };

    const deleteSchedule = useCallback(async (id: string) => {
        if (!confirm("Are you sure you want to delete this schedule?")) return;
        const supabase = createClient();
        await supabase.from("schedules").delete().eq("id", id);
        fetchSchedules();
    }, [fetchSchedules]);

    const filteredSchedules = useMemo(() =>
        showFilter === "all"
            ? schedules
            : schedules.filter((s) => s.type === showFilter),
        [schedules, showFilter]);

    const daySchedules = useMemo(() =>
        filteredSchedules.filter((s) => s.day_of_week === selectedDay),
        [filteredSchedules, selectedDay]);

    // Calendar helpers
    const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month: number, year: number) => {
        const d = new Date(year, month, 1).getDay();
        return d === 0 ? 6 : d - 1; // Convert to Mon=0
    };

    const getScheduleCountForDay = (dayOfWeek: number) => {
        return filteredSchedules.filter((s) => s.day_of_week === dayOfWeek).length;
    };

    const renderDayView = () => (
        <>
            {/* Day Selector */}
            <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide mb-6">
                {DAYS_SHORT.map((day, i) => {
                    const count = getScheduleCountForDay(i);
                    return (
                        <button
                            key={i}
                            onClick={() => setSelectedDay(i)}
                            className={`relative flex flex-col items-center min-w-[56px] py-3 px-2 rounded-2xl transition-all active:scale-95 ${selectedDay === i
                                ? "bg-gradient-to-b from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                                }`}
                        >
                            <span className="text-xs font-medium">{day}</span>
                            <span className="text-lg font-bold mt-1">
                                {mounted ? (() => {
                                    const today = new Date();
                                    const currentDay = today.getDay() === 0 ? 6 : today.getDay() - 1;
                                    const diff = i - currentDay;
                                    const d = new Date(today);
                                    d.setDate(today.getDate() + diff);
                                    return d.getDate();
                                })() : "..."}
                            </span>
                            {count > 0 && (
                                <div className={`absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold ${selectedDay === i ? "bg-white text-blue-600" : "bg-cyan-500 text-white"
                                    }`}>
                                    {count}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Schedule List for Selected Day */}
            {loading ? (
                <GlassCard className="flex justify-center py-8">
                    <div className="h-6 w-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                </GlassCard>
            ) : daySchedules.length > 0 ? (
                <div className="space-y-3">
                    {daySchedules.map((event, index) => {
                        const colors = typeColors[event.type] || { border: "border-l-white/30", bg: "bg-white/5", text: "text-white/60", dot: "bg-white/30" };
                        return (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <GlassCard
                                    className={`p-4 border-l-4 ${colors.border} ${colors.bg} hover:scale-[1.01] active:scale-[0.99] cursor-pointer`}
                                    onClick={() => setSelectedSchedule(event)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <p className="text-base font-semibold text-white">{event.title}</p>
                                            {event.lecturer && (
                                                <p className="text-xs text-white/40 mt-1 flex items-center gap-1">
                                                    <GraduationCap className="w-3 h-3" /> {event.lecturer}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {event.sks && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                                                    {event.sks} SKS
                                                </span>
                                            )}
                                            <span className={`text-xs px-2 py-0.5 rounded-full bg-white/10 ${colors.text}`}>
                                                {typeLabels[event.type] || event.type}
                                            </span>

                                            <div className="flex items-center gap-1 pl-2 border-l border-white/10 ml-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); startEditing(event); }}
                                                    className="p-1.5 rounded-lg hover:bg-white/10 text-cyan-400 transition-colors"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteSchedule(event.id); }}
                                                    className="p-1.5 rounded-lg hover:bg-white/10 text-rose-400 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mt-3">
                                        <div className="flex items-center gap-1 text-sm text-white/50">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>
                                                {event.start_time?.slice(0, 5)}
                                                {event.end_time ? ` - ${event.end_time.slice(0, 5)}` : ""}
                                            </span>
                                        </div>
                                        {event.location && (
                                            <div className="flex items-center gap-1 text-sm text-white/50">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span>{event.location}</span>
                                            </div>
                                        )}
                                        {event.class_group && (
                                            <span className="text-xs text-white/40">
                                                Kelas {event.class_group}
                                            </span>
                                        )}
                                    </div>

                                    {event.description && (
                                        <p className="text-xs text-white/30 mt-2 italic">📝 {event.description}</p>
                                    )}
                                </GlassCard>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <GlassCard className="flex flex-col items-center justify-center py-12">
                    <p className="text-white/30 text-sm">Tidak ada jadwal {DAYS_FULL[selectedDay]}</p>
                </GlassCard>
            )}
        </>
    );

    const renderTableView = () => (
        <div className="overflow-x-auto -mx-4 px-4">
            <div className="min-w-[700px]">
                {DAYS_FULL.map((dayName, dayIndex) => {
                    const dayItems = filteredSchedules.filter((s) => s.day_of_week === dayIndex);
                    if (dayItems.length === 0) return null;
                    return (
                        <div key={dayIndex} className="mb-6">
                            <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${dayIndex === selectedDay ? "bg-cyan-400" : "bg-white/30"}`} />
                                {dayName}
                            </h3>
                            <div className="rounded-2xl overflow-hidden border border-white/10">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-white/5">
                                            <th className="text-left p-3 text-white/50 font-medium">Waktu</th>
                                            <th className="text-left p-3 text-white/50 font-medium">Mata Kuliah / Kegiatan</th>
                                            <th className="text-left p-3 text-white/50 font-medium hidden sm:table-cell">Dosen / PJ</th>
                                            <th className="text-left p-3 text-white/50 font-medium hidden sm:table-cell">Ruang</th>
                                            <th className="text-center p-3 text-white/50 font-medium">Tipe</th>
                                            <th className="text-right p-3 text-white/50 font-medium">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {dayItems.map((event) => {
                                            const colors = typeColors[event.type] || { text: "text-white/60", dot: "bg-white/30" };
                                            return (
                                                <tr key={event.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedSchedule(event)}>
                                                    <td className="p-3 text-white/70 whitespace-nowrap">
                                                        {event.start_time?.slice(0, 5)}
                                                        {event.end_time ? ` - ${event.end_time.slice(0, 5)}` : ""}
                                                    </td>
                                                    <td className="p-3">
                                                        <p className="text-white font-medium">{event.title}</p>
                                                        {event.class_group && (
                                                            <p className="text-xs text-white/40">Kelas {event.class_group}</p>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-white/50 text-xs hidden sm:table-cell">
                                                        {event.lecturer || "-"}
                                                    </td>
                                                    <td className="p-3 text-white/50 text-xs hidden sm:table-cell">
                                                        {event.location || "-"}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/10 ${colors.text}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                                                            {typeLabels[event.type] || event.type}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                onClick={() => startEditing(event)}
                                                                className="p-1.5 rounded-lg hover:bg-white/10 text-cyan-400"
                                                                title="Edit"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteSchedule(event.id)}
                                                                className="p-1.5 rounded-lg hover:bg-white/10 text-rose-400"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderCalendarView = () => {
        const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
        const firstDay = getFirstDayOfMonth(calendarMonth, calendarYear);
        const today = new Date();

        return (
            <>
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <GlassButton
                        variant="ghost"
                        className="h-9 w-9 p-0 rounded-xl"
                        onClick={() => {
                            if (calendarMonth === 0) {
                                setCalendarMonth(11);
                                setCalendarYear(calendarYear - 1);
                            } else {
                                setCalendarMonth(calendarMonth - 1);
                            }
                        }}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </GlassButton>
                    <p className="text-base font-semibold text-white">
                        {MONTH_NAMES[calendarMonth]} {calendarYear}
                    </p>
                    <GlassButton
                        variant="ghost"
                        className="h-9 w-9 p-0 rounded-xl"
                        onClick={() => {
                            if (calendarMonth === 11) {
                                setCalendarMonth(0);
                                setCalendarYear(calendarYear + 1);
                            } else {
                                setCalendarMonth(calendarMonth + 1);
                            }
                        }}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </GlassButton>
                </div>

                {/* Calendar Grid */}
                <GlassCard className="p-4">
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS_SHORT.map((d) => (
                            <div key={d} className="text-center text-xs font-medium text-white/40 py-2">
                                {d}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {/* Empty cells for days before start */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}
                        {/* Day cells */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const dayNum = i + 1;
                            const dayOfWeek = (firstDay + i) % 7;
                            const schedCount = getScheduleCountForDay(dayOfWeek);
                            const isToday = mounted &&
                                dayNum === today.getDate() &&
                                calendarMonth === today.getMonth() &&
                                calendarYear === today.getFullYear();
                            const isSelected =
                                dayOfWeek === selectedDay && isToday;

                            return (
                                <button
                                    key={dayNum}
                                    onClick={() => setSelectedDay(dayOfWeek)}
                                    className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all ${isToday
                                        ? "bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-bold shadow-lg shadow-blue-500/20"
                                        : dayOfWeek === selectedDay
                                            ? "bg-white/10 text-cyan-400 font-semibold"
                                            : "text-white/60 hover:bg-white/5"
                                        }`}
                                >
                                    <span>{dayNum}</span>
                                    {schedCount > 0 && (
                                        <div className="flex gap-0.5 mt-0.5">
                                            {filteredSchedules
                                                .filter((s) => s.day_of_week === dayOfWeek)
                                                .slice(0, 3)
                                                .map((s, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`w-1 h-1 rounded-full ${typeColors[s.type]?.dot || "bg-white/30"
                                                            }`}
                                                    />
                                                ))}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </GlassCard>

                {/* Selected Day Schedule Below Calendar */}
                <div className="mt-6">
                    <h3 className="text-sm font-semibold text-white/60 mb-3">
                        Jadwal {DAYS_FULL[selectedDay]}
                    </h3>
                    {daySchedules.length > 0 ? (
                        <div className="space-y-2">
                            {daySchedules.map((event) => {
                                const colors = typeColors[event.type] || { border: "border-l-white/30", bg: "bg-white/5", text: "text-white/60" };
                                return (
                                    <div
                                        key={event.id}
                                        className={`p-3 rounded-xl border-l-4 ${colors.border} ${colors.bg} flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors`}
                                        onClick={() => setSelectedSchedule(event)}
                                    >
                                        <div className="text-xs text-white/50 whitespace-nowrap">
                                            {event.start_time?.slice(0, 5)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{event.title}</p>
                                            {event.location && (
                                                <p className="text-xs text-white/40">{event.location}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => startEditing(event)}
                                                className="p-1.5 rounded-lg hover:bg-white/10 text-cyan-400"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => deleteSchedule(event.id)}
                                                className="p-1.5 rounded-lg hover:bg-white/10 text-rose-400"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-white/30 text-center py-4">Tidak ada jadwal</p>
                    )}
                </div>
            </>
        );
    };

    return (
        <div className="w-full pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Jadwal</h1>
                <div className="flex gap-2">
                    <GlassButton
                        variant="primary"
                        className="h-10 w-10 p-0 rounded-xl"
                        onClick={() => setShowForm(true)}
                        suppressHydrationWarning
                    >
                        <Plus className="w-5 h-5" suppressHydrationWarning />
                    </GlassButton>
                </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setViewMode("day")}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${viewMode === "day"
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20"
                        : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                        }`}
                    suppressHydrationWarning
                >
                    <Clock className="w-3.5 h-3.5" suppressHydrationWarning /> Harian
                </button>
                <button
                    onClick={() => setViewMode("table")}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${viewMode === "table"
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20"
                        : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                        }`}
                    suppressHydrationWarning
                >
                    <List className="w-3.5 h-3.5" suppressHydrationWarning /> Tabel
                </button>
                <button
                    onClick={() => setViewMode("calendar")}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${viewMode === "calendar"
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20"
                        : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                        }`}
                    suppressHydrationWarning
                >
                    <CalendarIcon className="w-3.5 h-3.5" suppressHydrationWarning /> Kalender
                </button>
            </div>

            {/* Type Filter */}
            <div className="flex gap-2 mb-6">
                {(["all", "campus", "mahad"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setShowFilter(f)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${showFilter === f
                            ? f === "campus"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : f === "mahad"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-white/10 text-white border border-white/20"
                            : "bg-white/5 text-white/40 hover:bg-white/10 border border-transparent"
                            }`}
                    >
                        {f === "all" ? "Semua" : f === "campus" ? "🎓 Kampus" : "🕌 Ma'had"}
                    </button>
                ))}
            </div>

            {/* Add Schedule Form */}
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
                                <h3 className="text-base font-semibold text-white">
                                    {editingId ? "Edit Jadwal" : "Tambah Jadwal"}
                                </h3>
                                <button onClick={resetForm} className="text-white/50 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSaveSchedule} className="space-y-4">
                                <GlassInput
                                    placeholder="Nama Jadwal / Mata Kuliah"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    required
                                />

                                {/* Day Selector */}
                                <div>
                                    <label className="text-xs text-white/40 mb-1 block">Hari</label>
                                    <div className="flex flex-wrap gap-2">
                                        {DAYS_SHORT.map((day, idx) => (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => setFormDay(idx)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${formDay === idx
                                                    ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                                                    : "bg-white/5 text-white/50 hover:bg-white/10"
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-white/40 mb-1 block">Mulai</label>
                                        <GlassInput
                                            type="time"
                                            value={formStartTime}
                                            onChange={(e) => setFormStartTime(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/40 mb-1 block">Selesai</label>
                                        <GlassInput
                                            type="time"
                                            value={formEndTime}
                                            onChange={(e) => setFormEndTime(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {(["campus", "mahad", "work"] as const).map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setFormType(t)}
                                            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${formType === t
                                                ? `${t === "campus"
                                                    ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                                    : t === "mahad"
                                                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                                        : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                                } border`
                                                : "bg-white/5 text-white/50 border border-white/10"
                                                }`}
                                        >
                                            {typeLabels[t]}
                                        </button>
                                    ))}
                                </div>
                                <GlassInput
                                    placeholder="Ruang / Lokasi"
                                    value={formLocation}
                                    onChange={(e) => setFormLocation(e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <GlassInput
                                        placeholder="Dosen (opsional)"
                                        value={formLecturer}
                                        onChange={(e) => setFormLecturer(e.target.value)}
                                    />
                                    <GlassInput
                                        placeholder="SKS"
                                        type="number"
                                        value={formSks}
                                        onChange={(e) => setFormSks(e.target.value)}
                                    />
                                </div>
                                <GlassInput
                                    placeholder="Kelas (opsional)"
                                    value={formClass}
                                    onChange={(e) => setFormClass(e.target.value)}
                                />
                                <GlassInput
                                    placeholder="Catatan (opsional)"
                                    value={formDesc}
                                    onChange={(e) => setFormDesc(e.target.value)}
                                />
                                <GlassButton type="submit" className="w-full gap-2">
                                    {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    {editingId ? "Update Jadwal" : "Simpan Jadwal"}
                                </GlassButton>
                            </form>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* View Mode Content */}
            {viewMode === "day" && renderDayView()}
            {viewMode === "table" && renderTableView()}
            {viewMode === "calendar" && renderCalendarView()}

            {/* Schedule Detail Popup */}
            <AnimatePresence>
                {selectedSchedule && (() => {
                    const colors = typeColors[selectedSchedule.type] || { border: "border-l-white/30", bg: "bg-white/5", text: "text-white/60", dot: "bg-white/30" };
                    return (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedSchedule(null)}
                                className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
                            />

                            {/* Modal */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                                transition={{ type: "spring", duration: 0.5 }}
                                className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
                            >
                                <div className="w-full max-w-lg bg-[#0a0a0a]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[85vh]">

                                    {/* Header with colored accent */}
                                    <div className={`relative p-5 pb-4 border-b border-white/5`}>
                                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${selectedSchedule.type === 'campus' ? 'from-blue-500 to-cyan-400' : selectedSchedule.type === 'mahad' ? 'from-emerald-500 to-teal-400' : 'from-amber-500 to-orange-400'}`} />
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 pr-4">
                                                <h2 className="text-xl font-bold text-white leading-tight">{selectedSchedule.title}</h2>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/10 ${colors.text} font-medium`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                                                        {typeLabels[selectedSchedule.type] || selectedSchedule.type}
                                                    </span>
                                                    {selectedSchedule.sks && (
                                                        <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/60 font-medium">
                                                            {selectedSchedule.sks} SKS
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedSchedule(null)}
                                                className="p-2 -mt-1 -mr-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Detail Content */}
                                    <div className="p-5 overflow-y-auto space-y-4">
                                        {/* Day & Time */}
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-500/15 text-blue-400 flex-shrink-0">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-white/40 font-medium">Hari & Waktu</p>
                                                <p className="text-sm text-white font-semibold">
                                                    {DAYS_FULL[selectedSchedule.day_of_week]}, {selectedSchedule.start_time?.slice(0, 5)}
                                                    {selectedSchedule.end_time ? ` — ${selectedSchedule.end_time.slice(0, 5)}` : ""}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Location */}
                                        {selectedSchedule.location && (
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 flex-shrink-0">
                                                    <MapPin className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-white/40 font-medium">Lokasi / Ruang</p>
                                                    <p className="text-sm text-white font-semibold">{selectedSchedule.location}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Lecturer */}
                                        {selectedSchedule.lecturer && (
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-purple-500/15 text-purple-400 flex-shrink-0">
                                                    <GraduationCap className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-white/40 font-medium">Dosen / Penanggung Jawab</p>
                                                    <p className="text-sm text-white font-semibold">{selectedSchedule.lecturer}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Class Group */}
                                        {selectedSchedule.class_group && (
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 flex-shrink-0">
                                                    <Users className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-white/40 font-medium">Kelas</p>
                                                    <p className="text-sm text-white font-semibold">{selectedSchedule.class_group}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Description */}
                                        {selectedSchedule.description && (
                                            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 flex-shrink-0">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-white/40 font-medium">Catatan</p>
                                                    <p className="text-sm text-white/80 leading-relaxed">{selectedSchedule.description}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Notes Section */}
                                    <div className="px-5 pb-4">
                                        <ScheduleNoteSection scheduleId={selectedSchedule.id} />
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="p-4 border-t border-white/5 flex gap-2">
                                        <button
                                            onClick={() => {
                                                startEditing(selectedSchedule);
                                                setSelectedSchedule(null);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-cyan-400 text-sm font-medium hover:bg-white/10 transition-all active:scale-[0.98]"
                                        >
                                            <Pencil className="w-4 h-4" /> Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                deleteSchedule(selectedSchedule.id);
                                                setSelectedSchedule(null);
                                            }}
                                            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium hover:bg-rose-500/20 transition-all active:scale-[0.98]"
                                        >
                                            <Trash2 className="w-4 h-4" /> Hapus
                                        </button>
                                    </div>
                                </div>
                            </motion.div >
                        </>
                    );
                })()}
            </AnimatePresence>
        </div >
    );
}
