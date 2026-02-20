"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { User, Edit2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AvatarEditor } from "./avatar-editor";

export function Greeting() {
    const [greeting, setGreeting] = useState("Assalamu'alaikum");
    const [userName, setUserName] = useState("User");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");

        // Fetch user profile
        (async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, username, avatar_url")
                .eq("id", user.id)
                .single();

            if (profile?.avatar_url) {
                setAvatarUrl(profile.avatar_url);
                localStorage.setItem("nexus_user_avatar", profile.avatar_url);
            }
            if (profile?.full_name) {
                setUserName(profile.full_name);
            } else if (profile?.username) {
                setUserName(profile.username.split("@")[0]);
            } else if (user.email) {
                setUserName(user.email.split("@")[0]);
            }
        })();
    }, []);

    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    Assalamu&apos;alaikum
                </h1>
                <p className="text-white/60 mt-1">{greeting}, {userName}</p>
            </div>

            <div className="relative group cursor-pointer" onClick={() => setIsEditorOpen(true)}>
                <div className="glass-card p-2 rounded-full border-white/20 transition-all group-hover:border-cyan-400/50 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center relative">
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt="Profile"
                                fill
                                className="object-cover"
                                sizes="48px"
                            />
                        ) : (
                            <User className="text-white w-6 h-6" suppressHydrationWarning />
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Edit2 className="w-4 h-4 text-white" suppressHydrationWarning />
                        </div>
                    </div>
                </div>
            </div>

            <AvatarEditor
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onSuccess={(url) => setAvatarUrl(url)}
                currentAvatar={avatarUrl || ""}
            />
        </div>
    );
}
