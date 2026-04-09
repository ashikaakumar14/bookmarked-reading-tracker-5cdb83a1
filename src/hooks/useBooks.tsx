import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Book = Tables<'books'>;
export type BookInsert = TablesInsert<'books'>;
export type BookUpdate = TablesUpdate<'books'>;

export const useBooks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const booksQuery = useQuery({
    queryKey: ['books', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('date_added', { ascending: false });
      if (error) throw error;
      return data as Book[];
    },
    enabled: !!user,
  });

  const addBook = useMutation({
    mutationFn: async (book: Omit<BookInsert, 'user_id'>) => {
      const { data, error } = await supabase
        .from('books')
        .insert({ ...book, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'] }),
  });

  const updateBook = useMutation({
    mutationFn: async ({ id, ...updates }: BookUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('books')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'] }),
  });

  const deleteBook = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('books').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'] }),
  });

  return { books: booksQuery.data ?? [], isLoading: booksQuery.isLoading, addBook, updateBook, deleteBook };
};
