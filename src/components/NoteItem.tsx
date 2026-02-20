import React, { useState } from 'react';
import { Note, UpdateNoteInput } from '@/types/note';
import { GlassButton } from '@/components/ui/glass-button';
import { Trash2, Edit2, AlertCircle, CheckCircle, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface NoteItemProps {
    note: Note;
    onUpdate: (id: string, updates: UpdateNoteInput) => void;
    onDelete: (id: string) => void;
}

const categoryColors = {
    general: 'bg-green-500/20 border-green-500/30 text-green-200',
    todo: 'bg-blue-500/20 border-blue-500/30 text-blue-200',
    reminder: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-200',
};

const categoryIcons = {
    general: StickyNote,
    todo: CheckCircle,
    reminder: AlertCircle,
};

export const NoteItem: React.FC<NoteItemProps> = ({ note, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(note.content || '');
    const Icon = categoryIcons[note.category];

    const handleSave = () => {
        onUpdate(note.id, { content });
        setIsEditing(false);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
                'group relative rounded-xl border p-3 transition-all hover:bg-white/5',
                categoryColors[note.category],
                'border-white/10' // Default glass border, overwritten by category color
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 opacity-70" />
                    <span className="text-xs font-medium uppercase tracking-wider opacity-60">
                        {note.category}
                    </span>
                </div>
                <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="rounded p-1 hover:bg-white/10"
                    >
                        <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                        onClick={() => onDelete(note.id)}
                        className="rounded p-1 hover:bg-white/10 hover:text-red-400"
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                </div>
            </div>

            <div className="mt-2">
                {isEditing ? (
                    <div className="flex flex-col gap-2">
                        <textarea
                            autoFocus
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[60px] w-full rounded-md bg-black/20 p-2 text-sm text-white/90 focus:outline-none focus:ring-1 focus:ring-white/20"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSave();
                                }
                                if (e.key === 'Escape') {
                                    setIsEditing(false);
                                    setContent(note.content || '');
                                }
                            }}
                            onBlur={handleSave}
                        />
                    </div>
                ) : (
                    <p
                        className="whitespace-pre-wrap text-sm text-white/80"
                        onDoubleClick={() => setIsEditing(true)}
                    >
                        {note.content || <span className="italic opacity-50">Empty note...</span>}
                    </p>
                )}
            </div>

            <div className="mt-2 flex justify-end">
                <span className="text-[10px] text-white/30">
                    {new Date(note.updated_at).toLocaleDateString()}
                </span>
            </div>
        </motion.div>
    );
};
