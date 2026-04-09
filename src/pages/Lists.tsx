import { useState } from 'react';
import { useBooks } from '@/hooks/useBooks';
import BookCard from '@/components/BookCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Plus, Search, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Book } from '@/hooks/useBooks';
import { Database } from '@/integrations/supabase/types';

type BookStatus = Database['public']['Enums']['book_status'];

const Lists = () => {
  const { books, isLoading, updateBook } = useBooks();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [newListName, setNewListName] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const { data: customLists = [] } = useQuery({
    queryKey: ['lists', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('lists').select('*').order('created_at');
      return data ?? [];
    },
    enabled: !!user,
  });

  const createList = async () => {
    if (!newListName.trim() || !user) return;
    await supabase.from('lists').insert({ user_id: user.id, name: newListName.trim() });
    setNewListName('');
    queryClient.invalidateQueries({ queryKey: ['lists'] });
    toast({ title: 'List created!' });
  };

  const filteredBooks = (status?: string) => {
    let filtered = books;
    if (status) filtered = filtered.filter(b => b.status === status);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(s) || b.author?.toLowerCase().includes(s)
      );
    }
    return filtered;
  };

  const handleUpdateBook = async (updates: Partial<Book>) => {
    if (!selectedBook) return;
    try {
      await updateBook.mutateAsync({ id: selectedBook.id, ...updates });
      setSelectedBook(prev => prev ? { ...prev, ...updates } : null);
      toast({ title: 'Book updated!' });
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="p-4 pt-6">
        <h1 className="text-2xl font-bold text-foreground">My Books</h1>
        <p className="text-sm text-muted-foreground">Your reading collection</p>
      </header>

      <div className="px-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search books..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs defaultValue="all">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="reading" className="flex-1">Reading</TabsTrigger>
            <TabsTrigger value="read" className="flex-1">Read</TabsTrigger>
            <TabsTrigger value="want" className="flex-1">Want</TabsTrigger>
          </TabsList>

          {['all', 'reading', 'read', 'want'].map(tab => (
            <TabsContent key={tab} value={tab} className="mt-4 space-y-3">
              {isLoading ? (
                <p className="text-center text-sm text-muted-foreground py-8">Loading...</p>
              ) : filteredBooks(tab === 'all' ? undefined : tab === 'want' ? 'want_to_read' : tab).length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No books found</p>
              ) : (
                filteredBooks(tab === 'all' ? undefined : tab === 'want' ? 'want_to_read' : tab).map(book => (
                  <BookCard key={book.id} book={book} onClick={() => setSelectedBook(book)} />
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Custom lists */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">Custom Lists</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> New List</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create a list</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="List name" value={newListName} onChange={e => setNewListName(e.target.value)} />
                  <Button onClick={createList} className="w-full">Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {customLists.length === 0 ? (
            <p className="text-sm text-muted-foreground">No custom lists yet</p>
          ) : (
            customLists.map(list => (
              <div key={list.id} className="rounded-lg border p-3 mb-2">
                <p className="font-medium text-foreground">{list.name}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Book detail sheet */}
      <Sheet open={!!selectedBook} onOpenChange={open => !open && setSelectedBook(null)}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          {selectedBook && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedBook.title}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                {selectedBook.author && <p className="text-sm text-muted-foreground">by {selectedBook.author}</p>}

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={selectedBook.status}
                    onValueChange={v => handleUpdateBook({ status: v as BookStatus })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="want_to_read">Want to Read</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedBook.total_pages && (
                  <div className="space-y-2">
                    <Label>Pages read: {selectedBook.pages_read} / {selectedBook.total_pages}</Label>
                    <Slider
                      value={[selectedBook.pages_read]}
                      max={selectedBook.total_pages}
                      step={1}
                      onValueCommit={([v]) => handleUpdateBook({ pages_read: v })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => handleUpdateBook({ rating: n })}
                        className="p-1"
                      >
                        <Star
                          className={`h-6 w-6 ${n <= (selectedBook.rating ?? 0) ? 'fill-primary text-primary' : 'text-muted'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    defaultValue={selectedBook.review_notes ?? ''}
                    onBlur={e => handleUpdateBook({ review_notes: e.target.value })}
                    placeholder="Your thoughts..."
                    rows={3}
                  />
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Lists;
