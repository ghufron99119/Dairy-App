"use client";

import { useState, useRef } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Loader2, Upload, Link, X, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface AvatarEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (url: string) => void;
    currentAvatar?: string;
}

export function AvatarEditor({ isOpen, onClose, onSuccess, currentAvatar }: AvatarEditorProps) {
    const [mode, setMode] = useState<"upload" | "url">("upload");
    const [urlInput, setUrlInput] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(currentAvatar || null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            setPreview(URL.createObjectURL(f));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setLoading(false);
            return;
        }

        let finalUrl = currentAvatar;

        try {
            if (mode === "upload" && file) {
                const fileExt = file.name.split(".").pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from("avatars")
                    .upload(fileName, file, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from("avatars")
                    .getPublicUrl(fileName);

                finalUrl = publicUrlData.publicUrl;
            } else if (mode === "url" && urlInput) {
                finalUrl = urlInput;
            }

            if (finalUrl) {
                const { error: updateError } = await supabase
                    .from("profiles")
                    .update({ avatar_url: finalUrl })
                    .eq("id", user.id);

                if (updateError) throw updateError;

                // Sync to local storage for Login page
                localStorage.setItem("nexus_user_avatar", finalUrl);

                onSuccess(finalUrl);
                onClose();
            }
        } catch (error) {
            console.error("Error updating avatar:", error);
            alert("Failed to update avatar. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-md"
                    >
                        <GlassCard className="relative overflow-hidden">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-xl font-bold text-white mb-6">Update Profile Photo</h2>

                            {/* Mode Toggle */}
                            <div className="flex bg-white/5 p-1 rounded-xl mb-6">
                                <button
                                    onClick={() => setMode("upload")}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${mode === "upload"
                                        ? "bg-white/10 text-white shadow-lg"
                                        : "text-white/50 hover:text-white"
                                        }`}
                                >
                                    <Upload className="w-4 h-4" /> Upload
                                </button>
                                <button
                                    onClick={() => setMode("url")}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${mode === "url"
                                        ? "bg-white/10 text-white shadow-lg"
                                        : "text-white/50 hover:text-white"
                                        }`}
                                >
                                    <Link className="w-4 h-4" /> Link URL
                                </button>
                            </div>

                            {/* Preview */}
                            <div className="flex justify-center mb-6">
                                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 shadow-xl shadow-cyan-500/10">
                                    {preview ? (
                                        <Image
                                            src={preview}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                            unoptimized={preview.startsWith('blob:')}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-white/20" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="space-y-4 mb-6">
                                {mode === "upload" ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-500/50 hover:bg-white/5 transition-all group"
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        <div className="flex flex-col items-center gap-2 text-white/50 group-hover:text-cyan-400">
                                            <Upload className="w-6 h-6 mb-1" />
                                            <span className="text-sm">Click to select image</span>
                                        </div>
                                    </div>
                                ) : (
                                    <GlassInput
                                        placeholder="https://example.com/avatar.jpg"
                                        value={urlInput}
                                        onChange={(e) => {
                                            setUrlInput(e.target.value);
                                            setPreview(e.target.value);
                                        }}
                                    />
                                )}
                            </div>

                            <GlassButton
                                onClick={handleSave}
                                disabled={loading || (!file && !urlInput)}
                                className="w-full"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                                    </span>
                                ) : (
                                    "Save Changes"
                                )}
                            </GlassButton>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
