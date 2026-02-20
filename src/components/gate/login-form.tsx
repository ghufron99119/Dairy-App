"use client";

import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassInput } from "@/components/ui/glass-input";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const storedAvatar = localStorage.getItem("nexus_user_avatar");
        if (storedAvatar) {
            setAvatarUrl(storedAvatar);
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
        } else {
            // Fetch and cache avatar on successful login
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("avatar_url")
                    .eq("id", user.id)
                    .single();
                if (profile?.avatar_url) {
                    localStorage.setItem("nexus_user_avatar", profile.avatar_url);
                }
            }
            router.push("/dashboard");
            router.refresh();
        }

        setLoading(false);
    };

    return (
        <GlassCard className="w-full max-w-sm sm:max-w-md p-6 sm:p-8 border-white/20 shadow-2xl shadow-blue-900/20">
            <div className="mb-8 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.6)] overflow-hidden"
                >
                    {avatarUrl ? (
                        <Image
                            src={avatarUrl}
                            alt="Avatar"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <span className="text-2xl font-bold text-white">N</span>
                    )}
                </motion.div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                    Welcome Back
                </h2>
                <p className="text-sm text-white/50 mt-2">Enter the Nexus</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                    <GlassInput
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <GlassInput
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-rose-400 text-center"
                    >
                        {error}
                    </motion.p>
                )}

                <GlassButton
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_auto] hover:bg-[right_center] transition-all duration-500"
                >
                    {loading ? (
                        <motion.span
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            Authenticating...
                        </motion.span>
                    ) : (
                        "Access Nexus"
                    )}
                </GlassButton>
            </form>

            <div className="mt-6 text-center">
                <p className="text-xs text-white/20">Authorized personnel only</p>
            </div>
        </GlassCard>
    );
}
