"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GlassInput } from "@/components/ui/glass-input";
import { GlassButton } from "@/components/ui/glass-button";
import { Loader2, Bell, Volume2 } from "lucide-react";

interface AddActivityFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function AddActivityForm({ onSuccess, onCancel }: AddActivityFormProps) {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [type, setType] = useState<"task" | "routine">("task");
    const [dueDate, setDueDate] = useState("");
    const [category, setCategory] = useState("personal");
    const [reminder, setReminder] = useState(false);
    const [alarm, setAlarm] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setLoading(false);
            return;
        }

        try {
            if (type === "task") {
                await supabase.from("tasks").insert({
                    user_id: user.id,
                    title,
                    due_date: dueDate ? new Date(dueDate).toISOString() : null,
                    category,
                    is_complete: false,
                });
            } else {
                await supabase.from("checklist_items").insert({
                    user_id: user.id,
                    title,
                    category: "daily",
                    is_active: true,
                });
            }

            if (reminder || alarm) {
                // Simulate setting reminder/alarm
                console.log("Reminder set:", reminder);
                console.log("Alarm set:", alarm);
            }

            // Trigger haptic feedback
            if (navigator.vibrate) navigator.vibrate(50);

            onSuccess();
        } catch (error) {
            console.error("Error adding activity:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Add Activity</h3>

            <div className="flex gap-2 mb-4">
                <button
                    type="button"
                    onClick={() => setType("task")}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === "task" ? "bg-cyan-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                >
                    Task
                </button>
                <button
                    type="button"
                    onClick={() => setType("routine")}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === "routine" ? "bg-cyan-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                >
                    Routine
                </button>
            </div>

            <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Title</label>
                <GlassInput
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={type === "task" ? "Assignment name..." : "Daily habit..."}
                />
            </div>

            {type === "task" && (
                <>
                    <div>
                        <label className="block text-xs font-medium text-white/60 mb-1">Due Date</label>
                        <GlassInput
                            type="datetime-local"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-white/60 mb-1">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        >
                            <option value="personal">Personal</option>
                            <option value="work">Work</option>
                            <option value="campus">Campus</option>
                            <option value="mahad">Ma'had</option>
                        </select>
                    </div>
                </>
            )}

            <div className="flex gap-4 py-2">
                <button
                    type="button"
                    onClick={() => setReminder(!reminder)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors ${reminder ? "bg-cyan-500/20 border-cyan-500 text-cyan-400" : "border-white/10 text-white/60 hover:bg-white/5"
                        }`}
                >
                    <Bell className="w-4 h-4" />
                    <span className="text-xs">Notify</span>
                </button>
                <button
                    type="button"
                    onClick={() => setAlarm(!alarm)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors ${alarm ? "bg-rose-500/20 border-rose-500 text-rose-400" : "border-white/10 text-white/60 hover:bg-white/5"
                        }`}
                >
                    <Volume2 className="w-4 h-4" />
                    <span className="text-xs">Alarm</span>
                </button>
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 font-medium hover:bg-white/5 transition-colors"
                >
                    Cancel
                </button>
                <GlassButton
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border-none"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save"}
                </GlassButton>
            </div>
        </form>
    );
}
