"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GlassInput } from "@/components/ui/glass-input";
import { GlassButton } from "@/components/ui/glass-button";
import { Loader2, Plus, Minus } from "lucide-react";

interface AddFinanceFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function AddFinanceForm({ onSuccess, onCancel }: AddFinanceFormProps) {
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState("");
    const [type, setType] = useState<"income" | "expense">("expense");
    const [category, setCategory] = useState("general");
    const [description, setDescription] = useState("");

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
            await supabase.from("transactions").insert({
                user_id: user.id,
                amount: parseFloat(amount),
                type,
                category,
                description,
            });

            // Trigger haptic feedback
            if (navigator.vibrate) navigator.vibrate(50);

            onSuccess();
        } catch (error) {
            console.error("Error adding transaction:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Record Finance</h3>

            <div className="flex gap-2 mb-4">
                <button
                    type="button"
                    onClick={() => setType("expense")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${type === "expense" ? "bg-red-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                >
                    <Minus className="w-4 h-4" />
                    Expense
                </button>
                <button
                    type="button"
                    onClick={() => setType("income")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${type === "income" ? "bg-emerald-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                >
                    <Plus className="w-4 h-4" />
                    Income
                </button>
            </div>

            <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Amount</label>
                <GlassInput
                    required
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="text-lg font-mono"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Tag/Category</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                    <option value="general">General</option>
                    <option value="food">Food</option>
                    <option value="transport">Transport</option>
                    <option value="shopping">Shopping</option>
                    <option value="bills">Bills</option>
                    <option value="salary">Salary</option>
                    <option value="investment">Investment</option>
                </select>
            </div>

            <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Description</label>
                <GlassInput
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Lunch, Bus fare, etc."
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
