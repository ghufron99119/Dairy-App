import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Note, CreateNoteInput, UpdateNoteInput } from '../types/note';

export const useNotes = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const debouncedUpdateRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

    const fetchNotes = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setNotes(data || []);
        } catch (error) {
            console.error('Error fetching notes:', error);
            console.error('Failed to load notes');
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    const createNote = async (input: CreateNoteInput) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not found');

            // Optimistic update
            const tempId = crypto.randomUUID();
            const newNote: Note = {
                id: tempId,
                user_id: user.id,
                ...input,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            setNotes((prev) => [newNote, ...prev]);

            const { data, error } = await supabase
                .from('notes')
                .insert({ ...input, user_id: user.id })
                .select()
                .single();

            if (error) throw error;

            // Replace temp note with real one
            setNotes((prev) => prev.map((n) => (n.id === tempId ? data : n)));
            return data;
        } catch (error) {
            console.error('Error creating note:', error);
            console.error('Failed to create note');
            // Revert optimistic update
            fetchNotes();
        }
    };

    const updateNoteDebounced = useCallback((id: string, updates: UpdateNoteInput) => {
        // 1. Optimistic Update immediately
        setNotes((prev) =>
            prev.map((n) => (n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n))
        );

        // 2. Clear existing timeout for this note
        if (debouncedUpdateRef.current[id]) {
            clearTimeout(debouncedUpdateRef.current[id]);
        }

        // 3. Set new timeout
        debouncedUpdateRef.current[id] = setTimeout(async () => {
            try {
                const { error } = await supabase
                    .from('notes')
                    .update(updates)
                    .eq('id', id);

                if (error) throw error;
                // Optional: verify with server data or just assume success if no error
            } catch (error) {
                console.error('Error updating note:', error);
                console.error('Failed to save changes');
                // Revert on error? Might be tricky with debounce. 
                // Ideally we'd sync back from server or show error state on the note.
            } finally {
                delete debouncedUpdateRef.current[id];
            }
        }, 1000); // 1 second debounce
    }, [supabase]);

    const updateNoteImmediate = async (id: string, updates: UpdateNoteInput) => {
        // Clear any pending debounced updates to avoid race conditions
        if (debouncedUpdateRef.current[id]) {
            clearTimeout(debouncedUpdateRef.current[id]);
            delete debouncedUpdateRef.current[id];
        }

        try {
            // Optimistic
            setNotes((prev) =>
                prev.map((n) => (n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n))
            );

            const { error } = await supabase
                .from('notes')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating note:', error);
            console.error('Failed to update note');
            fetchNotes();
        }
    };


    const deleteNote = async (id: string) => {
        try {
            // Optimistic
            setNotes((prev) => prev.filter((n) => n.id !== id));

            const { error } = await supabase
                .from('notes')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting note:', error);
            console.error('Failed to delete note');
            fetchNotes();
        }
    };

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    return {
        notes,
        loading,
        fetchNotes,
        createNote,
        updateNote: updateNoteDebounced, // Default to debounced
        updateNoteImmediate,
        deleteNote,
    };
};
