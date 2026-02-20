"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function WalletWidget() {
    const [balance, setBalance] = useState(0);

    const fetchBalance = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: transactions } = await supabase
            .from("transactions")
            .select("amount, type")
            .eq("user_id", user.id);

        if (transactions) {
            const total = transactions.reduce((acc: number, t: { amount: number; type: string }) => {
                return t.type === "income" ? acc + Number(t.amount) : acc - Number(t.amount);
            }, 0);
            setBalance(total);
        }
    };

    useEffect(() => {
        fetchBalance();

        const handleRefresh = () => fetchBalance();
        window.addEventListener("refresh-data", handleRefresh);

        return () => {
            window.removeEventListener("refresh-data", handleRefresh);
        };
    }, []);

    return (
        <GlassCard variant="neon" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-50">
                <div className="h-20 w-20 rounded-full bg-blue-500/20 blur-xl" />
            </div>

            <div className="relative z-10">
                <h3 className="text-sm font-medium text-white/60 mb-1">Total Balance</h3>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-6">
                    Rp {balance.toLocaleString("id-ID")}
                </p>

                <div className="flex gap-3">
                    <GlassButton variant="ghost" className="flex-1 px-3 py-2 text-sm h-10 gap-2">
                        <ArrowUpRight className="w-4 h-4 text-emerald-400" suppressHydrationWarning />
                        <span className="hidden sm:inline">In</span>
                    </GlassButton>
                    <GlassButton variant="ghost" className="flex-1 px-3 py-2 text-sm h-10 gap-2">
                        <ArrowDownLeft className="w-4 h-4 text-rose-400" suppressHydrationWarning />
                        <span className="hidden sm:inline">Out</span>
                    </GlassButton>
                    <GlassButton variant="primary" className="h-10 w-10 p-0 rounded-xl">
                        <Plus className="w-5 h-5" suppressHydrationWarning />
                    </GlassButton>
                </div>
            </div>
        </GlassCard>
    );
}
