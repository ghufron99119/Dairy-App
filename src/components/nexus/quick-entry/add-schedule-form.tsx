"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GlassInput } from "@/components/ui/glass-input";
import { GlassButton } from "@/components/ui/glass-button";
import { Loader2, Calendar } from "lucide-react";

interface AddScheduleFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function AddScheduleForm({ onSuccess, onCancel }: AddScheduleFormProps) {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [type, setType] = useState("mahad");
    const [day, setDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1); // Default today
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [location, setLocation] = useState("");

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
            await supabase.from("schedules").insert({
                user_id: user.id,
                title,
                day_of_week: day, // 0=Mon, 6=Sun (based on schema check constraints maybe.. wait schema said 0-6. Mon=0?)
                // Schema: check (day_of_week >= 0 and day_of_week <= 6) -- 0=Mon, 6=Sun
                start_time: startTime,
                end_time: endTime || null,
                type,
                location: location || null,
            });

            // Trigger haptic feedback
            if (navigator.vibrate) navigator.vibrate(50);

            onSuccess();
        } catch (error) {
            console.error("Error adding schedule:", error);
        } finally {
            setLoading(false);
        }
    };

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Add Schedule</h3>

            <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Title</label>
                <GlassInput
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Class name / Activity"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-white/60 mb-1">Day</label>
                    <select
                        value={day}
                        onChange={(e) => setDay(parseInt(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    >
                        {days.map((d, i) => (
                            <option key={i} value={i}>{d}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-white/60 mb-1">Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    >
                        <option value="mahad">Ma'had</option>
                        <option value="campus">Campus</option>
                        <option value="work">Work</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-white/60 mb-1">Start Time</label>
                    <GlassInput
                        required
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-white/60 mb-1">End Time</label>
                    <GlassInput
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Location</label>
                <GlassInput
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Room B.204"
                />
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
