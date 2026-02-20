"use client";

import { GlassCard } from "@/components/ui/glass-card";
import {
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { useDateGuard } from "@/lib/hooks/use-date-guard";
import { getLocalDateISOString } from "@/lib/date-utils";

const defaultData = [
    { name: "Mon", value: 0 },
    { name: "Tue", value: 0 },
    { name: "Wed", value: 0 },
    { name: "Thu", value: 0 },
    { name: "Fri", value: 0 },
    { name: "Sat", value: 0 },
    { name: "Sun", value: 0 },
];

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function ActivityPulse() {
    const [data, setData] = useState(defaultData);
    const [mounted, setMounted] = useState(false);

    const fetchActivity = useCallback(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get last 7 days of activity logs
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

        const { data: logs } = await supabase
            .from("activity_logs")
            .select("score, log_date")
            .eq("user_id", user.id)
            .gte("log_date", getLocalDateISOString(sevenDaysAgo))
            .order("log_date", { ascending: true });

        if (logs && logs.length > 0) {
            const chartData = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = getLocalDateISOString(d);
                const dayName = dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1];
                const log = logs.find((l: { log_date: string; score: number }) => l.log_date === dateStr);
                chartData.push({ name: dayName, value: log?.score ?? 0 });
            }
            setData(chartData);
        }
    }, []);

    // Auto-refresh when date changes
    useDateGuard(fetchActivity);

    useEffect(() => {
        setMounted(true);
        fetchActivity();

        const handleRefresh = () => fetchActivity();
        window.addEventListener("refresh-data", handleRefresh);

        return () => {
            window.removeEventListener("refresh-data", handleRefresh);
        };
    }, [fetchActivity]);

    return (
        <GlassCard className="h-full flex flex-col justify-between">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">Activity Pulse</h3>
                <p className="text-sm text-white/50">Weekly Progress</p>
            </div>

            <div className="h-[180px] w-full mt-auto">
                {mounted && (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(0,0,0,0.8)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "12px",
                                    padding: "8px",
                                }}
                                itemStyle={{ color: "#fff" }}
                                cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#06b6d4"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </GlassCard>
    );
}
