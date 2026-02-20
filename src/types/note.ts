export type Note = {
    id: string;
    user_id: string;
    title: string | null;
    content: string | null;
    category: 'general' | 'todo' | 'reminder';
    schedule_id: string | null;
    created_at: string;
    updated_at: string;
};

export type CreateNoteInput = Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type UpdateNoteInput = Partial<CreateNoteInput>;
