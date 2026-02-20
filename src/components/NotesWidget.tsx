import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassInput } from '@/components/ui/glass-input';
import { GlassButton } from '@/components/ui/glass-button';
import { useNotes } from '@/hooks/useNotes';
import { NoteItem } from './NoteItem';
import { Plus, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CreateNoteInput } from '@/types/note';

export const NotesWidget = ({ className }: { className?: string }) => {
    const { notes, loading, createNote, updateNote, deleteNote } = useNotes();
    const [newNoteContent, setNewNoteContent] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<CreateNoteInput['category']>('general');

    // Filter out linked notes (notes with schedule_id)
    const generalNotes = notes.filter((n) => !n.schedule_id);

    const handleAddNote = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newNoteContent.trim()) return;

        await createNote({
            title: null,
            content: newNoteContent,
            category: selectedCategory,
            schedule_id: null,
        });
        setNewNoteContent('');
    };

    return (
        <GlassCard className={cn("flex flex-col h-full min-h-[400px]", className)}>
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Smart Notes</h3>
                <div className="flex gap-1">
                    {(['general', 'todo', 'reminder'] as const).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                                "h-6 w-6 rounded-full border transition-all",
                                selectedCategory === cat ? "scale-110 border-white/80" : "border-white/20 opacity-50 hover:opacity-100",
                                cat === 'general' && "bg-green-500",
                                cat === 'todo' && "bg-blue-500",
                                cat === 'reminder' && "bg-yellow-500"
                            )}
                            title={cat}
                        />
                    ))}
                </div>
            </div>

            <form onSubmit={handleAddNote} className="mb-4 relative">
                <GlassInput
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder={`Add a quick ${selectedCategory}...`}
                    className="pr-10"
                />
                <button
                    type="submit"
                    disabled={!newNoteContent.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/50 hover:text-white disabled:opacity-30"
                >
                    <Plus className="h-5 w-5" />
                </button>
            </form>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {loading ? (
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-white/30" />
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {generalNotes.map((note) => (
                            <NoteItem
                                key={note.id}
                                note={note}
                                onUpdate={updateNote}
                                onDelete={deleteNote}
                            />
                        ))}
                        {generalNotes.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex h-full flex-col items-center justify-center text-center text-white/30"
                            >
                                <p>No notes yet.</p>
                                <p className="text-xs">Start typing above to add one.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </GlassCard>
    );
};
