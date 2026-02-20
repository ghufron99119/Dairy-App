"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { ArrowUpRight, ArrowDownLeft, Plus, X, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from "recharts";

interface Transaction {
    id: string;
    amount: number;
    type: "income" | "expense";
    category: string;
    description: string;
    created_at: string;
}

type ViewMode = "list" | "stats";

const EXPENSE_COLORS = ["#f43f5e", "#fb923c", "#a78bfa", "#38bdf8", "#34d399", "#fbbf24", "#e879f9"];

export default function FinancePage() {
    const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState<"income" | "expense">("expense");
    const [formDesc, setFormDesc] = useState("");
    const [formAmount, setFormAmount] = useState("");
    const [formCategory, setFormCategory] = useState("");
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchTransactions();
    }, []);

    const fetchTransactions = useCallback(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from("transactions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (data) setTransactions(data);
        setLoading(false);
    }, []);

    const addTransaction = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from("transactions").insert({
            user_id: user.id,
            amount: Number(formAmount),
            type: formType,
            category: formCategory || (formType === "income" ? "Transfer" : "Lainnya"),
            description: formDesc,
        });

        setFormDesc("");
        setFormAmount("");
        setFormCategory("");
        setShowForm(false);
        fetchTransactions();
    }, [formAmount, formType, formCategory, formDesc, fetchTransactions]);

    const deleteTransaction = useCallback(async (id: string) => {
        const supabase = createClient();
        await supabase.from("transactions").delete().eq("id", id);
        fetchTransactions();
    }, [fetchTransactions]);

    const filtered = useMemo(() =>
        filter === "all" ? transactions : transactions.filter((t) => t.type === filter),
        [filter, transactions]);

    const { totalIncome, totalExpense, balance } = useMemo(() => {
        const inc = transactions.filter((t) => t.type === "income").reduce((a, b) => a + Number(b.amount), 0);
        const exp = transactions.filter((t) => t.type === "expense").reduce((a, b) => a + Number(b.amount), 0);
        return { totalIncome: inc, totalExpense: exp, balance: inc - exp };
    }, [transactions]);

    // --- STATISTICS DATA ---

    // Monthly flow (last 6 months)
    const getMonthlyData = () => {
        const months: Record<string, { income: number; expense: number; label: string }> = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            months[key] = { income: 0, expense: 0, label: monthNames[d.getMonth()] };
        }

        transactions.forEach((t) => {
            const d = new Date(t.created_at);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (months[key]) {
                if (t.type === "income") months[key].income += Number(t.amount);
                else months[key].expense += Number(t.amount);
            }
        });

        return Object.values(months);
    };

    // Category breakdown (for pie chart)
    const getCategoryData = (type: "income" | "expense") => {
        const cats: Record<string, number> = {};
        transactions
            .filter((t) => t.type === type)
            .forEach((t) => {
                const cat = t.category || "Lainnya";
                cats[cat] = (cats[cat] || 0) + Number(t.amount);
            });

        return Object.entries(cats)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    };

    // Daily spending trend (last 14 days)
    const getDailyTrend = () => {
        const days: { label: string; expense: number }[] = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split("T")[0];
            const dayExpense = transactions
                .filter((t) => t.type === "expense" && t.created_at.startsWith(dateStr))
                .reduce((a, b) => a + Number(b.amount), 0);
            days.push({
                label: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
                expense: dayExpense,
            });
        }
        return days;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return "Hari ini";
        if (date.toDateString() === yesterday.toDateString()) return "Kemarin";
        return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    };

    const formatRp = (amount: number) => `Rp ${amount.toLocaleString("id-ID")}`;

    const monthlyData = useMemo(() => getMonthlyData(), [transactions]);
    const expenseCategoryData = useMemo(() => getCategoryData("expense"), [transactions]);
    const incomeCategoryData = useMemo(() => getCategoryData("income"), [transactions, totalIncome]);
    const dailyTrendData = useMemo(() => getDailyTrend(), [transactions]);

    const renderStatistics = () => (
        <div className="space-y-6">
            {/* Balance Overview */}
            <GlassCard>
                <h3 className="text-sm font-medium text-white/50 mb-2">Saldo Total</h3>
                <p className={`text-3xl font-bold ${balance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {formatRp(balance)}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs text-white/40">Pemasukan</p>
                            <p className="text-sm font-semibold text-emerald-400">+{formatRp(totalIncome)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-rose-500/20 flex items-center justify-center">
                            <TrendingDown className="w-4 h-4 text-rose-400" />
                        </div>
                        <div>
                            <p className="text-xs text-white/40">Pengeluaran</p>
                            <p className="text-sm font-semibold text-rose-400">-{formatRp(totalExpense)}</p>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Monthly Income vs Expense Bar Chart */}
            <GlassCard>
                <h3 className="text-sm font-semibold text-white mb-4">📊 Arus Kas Bulanan</h3>
                <div className="h-[200px] w-full">
                    {mounted && (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} barGap={4}>
                                <XAxis
                                    dataKey="label"
                                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "rgba(0,0,0,0.85)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "12px",
                                        padding: "8px 12px",
                                    }}
                                    itemStyle={{ color: "#fff", fontSize: 12 }}
                                    formatter={(value: number) => formatRp(value)}
                                />
                                <Bar dataKey="income" fill="#34d399" radius={[6, 6, 0, 0]} name="Pemasukan" />
                                <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Pengeluaran" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </GlassCard>

            {/* Daily Spending Trend */}
            <GlassCard>
                <h3 className="text-sm font-semibold text-white mb-4">📉 Tren Pengeluaran (14 Hari)</h3>
                <div className="h-[160px] w-full">
                    {mounted && (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyTrendData}>
                                <defs>
                                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="label"
                                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }}
                                    axisLine={false}
                                    tickLine={false}
                                    interval={2}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "rgba(0,0,0,0.85)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "12px",
                                        padding: "8px",
                                    }}
                                    formatter={(value: number) => formatRp(value)}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expense"
                                    stroke="#f43f5e"
                                    strokeWidth={2}
                                    fill="url(#expenseGradient)"
                                    name="Pengeluaran"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </GlassCard>

            {/* Expense Categories Pie */}
            {expenseCategoryData.length > 0 && (
                <GlassCard>
                    <h3 className="text-sm font-semibold text-white mb-4">🍕 Kategori Pengeluaran</h3>
                    <div className="flex items-center gap-4">
                        <div className="h-[140px] w-[140px] flex-shrink-0">
                            {mounted && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={expenseCategoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={35}
                                            outerRadius={60}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {expenseCategoryData.map((_, index) => (
                                                <Cell key={index} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        <div className="flex-1 space-y-2">
                            {expenseCategoryData.slice(0, 5).map((cat, index) => (
                                <div key={cat.name} className="flex items-center gap-2">
                                    <div
                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: EXPENSE_COLORS[index % EXPENSE_COLORS.length] }}
                                    />
                                    <span className="text-xs text-white/60 flex-1 truncate">{cat.name}</span>
                                    <span className="text-xs text-white/80 font-medium">{formatRp(cat.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </GlassCard>
            )}

            {/* Income Categories */}
            {incomeCategoryData.length > 0 && (
                <GlassCard>
                    <h3 className="text-sm font-semibold text-white mb-4">💰 Kategori Pemasukan</h3>
                    <div className="space-y-2">
                        {incomeCategoryData.map((cat, index) => {
                            const percent = totalIncome > 0 ? (cat.value / totalIncome) * 100 : 0;
                            return (
                                <div key={cat.name}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-white/60">{cat.name}</span>
                                        <span className="text-xs text-emerald-400 font-medium">{formatRp(cat.value)}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percent}%` }}
                                            transition={{ duration: 0.8, delay: index * 0.1 }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </GlassCard>
            )}
        </div>
    );

    return (
        <div className="w-full pb-20">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">The Vault</h1>
                <div className="flex gap-2">
                    <GlassButton
                        variant="ghost"
                        className={`h-10 w-10 p-0 rounded-xl ${viewMode === "stats" ? "text-cyan-400 bg-white/10" : ""}`}
                        onClick={() => setViewMode(viewMode === "list" ? "stats" : "list")}
                    >
                        <BarChart3 className="w-5 h-5" />
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

            {/* Add Transaction Form */}
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
                                <h3 className="text-base font-semibold text-white">Tambah Transaksi</h3>
                                <button onClick={() => setShowForm(false)} className="text-white/50 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={addTransaction} className="space-y-4">
                                <div className="flex gap-2">
                                    {(["income", "expense"] as const).map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setFormType(t)}
                                            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${formType === t
                                                ? t === "income"
                                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                                : "bg-white/5 text-white/50 border border-white/10"
                                                }`}
                                        >
                                            {t === "income" ? "Pemasukan" : "Pengeluaran"}
                                        </button>
                                    ))}
                                </div>
                                <GlassInput
                                    placeholder="Deskripsi"
                                    value={formDesc}
                                    onChange={(e) => setFormDesc(e.target.value)}
                                    required
                                />
                                <GlassInput
                                    placeholder="Jumlah (Rp)"
                                    type="number"
                                    value={formAmount}
                                    onChange={(e) => setFormAmount(e.target.value)}
                                    required
                                />
                                <GlassInput
                                    placeholder="Kategori (opsional)"
                                    value={formCategory}
                                    onChange={(e) => setFormCategory(e.target.value)}
                                />
                                <GlassButton type="submit" className="w-full">
                                    Simpan
                                </GlassButton>
                            </form>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Statistics View */}
            {viewMode === "stats" ? (
                renderStatistics()
            ) : (
                <>
                    {/* Summary */}
                    <GlassCard className="mb-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-xs text-white/50 mb-1">Pemasukan</p>
                                <p className="text-lg font-bold text-emerald-400">
                                    +{formatRp(totalIncome)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-white/50 mb-1">Pengeluaran</p>
                                <p className="text-lg font-bold text-rose-400">
                                    -{formatRp(totalExpense)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-white/50 mb-1">Saldo</p>
                                <p className={`text-lg font-bold ${balance >= 0 ? "text-cyan-400" : "text-rose-400"}`}>
                                    {formatRp(balance)}
                                </p>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Filter */}
                    <div className="flex gap-2 mb-6">
                        {(["all", "income", "expense"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f
                                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                                    : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                                    }`}
                            >
                                {f === "all" ? "Semua" : f === "income" ? "Masuk" : "Keluar"}
                            </button>
                        ))}
                    </div>

                    {/* Transaction List */}
                    <div className="space-y-3">
                        {loading ? (
                            <GlassCard className="flex justify-center py-8">
                                <div className="h-6 w-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                            </GlassCard>
                        ) : filtered.length > 0 ? (
                            filtered.map((txn) => (
                                <GlassCard key={txn.id} className="p-4 flex items-center gap-4 active:scale-[0.98] transition-transform">
                                    <div
                                        className={`h-10 w-10 flex-shrink-0 rounded-xl flex items-center justify-center ${txn.type === "income" ? "bg-emerald-500/20" : "bg-rose-500/20"
                                            }`}
                                    >
                                        {txn.type === "income" ? (
                                            <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                                        ) : (
                                            <ArrowUpRight className="w-5 h-5 text-rose-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{txn.description}</p>
                                        <p className="text-xs text-white/40">
                                            {txn.category} · {formatDate(txn.created_at)}
                                        </p>
                                    </div>
                                    <p
                                        className={`text-sm font-semibold ${txn.type === "income" ? "text-emerald-400" : "text-rose-400"
                                            }`}
                                    >
                                        {txn.type === "income" ? "+" : "-"}{formatRp(Number(txn.amount))}
                                    </p>
                                </GlassCard>
                            ))
                        ) : (
                            <GlassCard className="flex flex-col items-center justify-center py-12">
                                <p className="text-white/30 text-sm">Belum ada transaksi</p>
                            </GlassCard>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
