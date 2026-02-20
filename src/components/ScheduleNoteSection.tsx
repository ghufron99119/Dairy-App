import React, { useState } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { NoteItem } from './NoteItem';
import { Plus, StickyNote } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

interface ScheduleNoteSectionProps {
    scheduleId: string;
}

export const ScheduleNoteSection: React.FC<ScheduleNoteSectionProps> = ({ scheduleId }) => {
    const { notes, loading, createNote, updateNote, deleteNote } = useNotes();
    const [isAdding, setIsAdding] = useState(false);
    const [newContent, setNewContent] = useState('');

    // Filter notes for this schedule
    const linkedNotes = notes.filter((n) => n.schedule_id === scheduleId);

    const handleAdd = async () => {
        if (!newContent.trim()) return;
        await createNote({
            title: null,
            content: newContent,
            category: 'todo', // Default to todo for schedule items
            schedule_id: scheduleId,
        });
        setNewContent('');
        setIsAdding(false);
    };

    return (
        <div className="mt-6 border-t border-white/10 pt-4">
            <div className="mb-3 flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <StickyNote className="h-4 w-4" />
                    Linked Notes & Tasks
                </h4>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="rounded-full bg-white/10 p-1 hover:bg-white/20 transition-colors"
                >
                    <Plus className="h-4 w-4 text-white" />
                </button>
            </div>

            <div className="space-y-3">
                <AnimatePresence initial={false}>
                    {isAdding && (
                        <div className="mb-3">
                            <textarea
                                autoFocus
                                placeholder="Add a task or note for this schedule..."
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                className="w-full rounded-lg bg-black/20 p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAdd();
                                    }
                                    if (e.key === 'Escape') setIsAdding(false);
                                }}
                            />
                            <div className="mt-2 flex justify-end gap-2">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="text-xs text-white/50 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdd}
                                    className="rounded bg-white/10 px-3 py-1 text-xs font-medium text-white hover:bg-white/20"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                    {linkedNotes.map((note) => (
                        <NoteItem
                            key={note.id}
                            note={note}
                            onUpdate={updateNote}
                            onDelete={deleteNote}
                        />
                    ))}
                    {!loading && linkedNotes.length === 0 && !isAdding && (
                        <p className="text-center text-xs text-white/30 py-2">
                            No notes linked to this schedule.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
