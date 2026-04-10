import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Loader2 } from 'lucide-react';
import { useBooks } from '@/hooks/useBooks';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type BookStatus = Database['public']['Enums']['book_status'];

interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    categories?: string[];
    pageCount?: number;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    description?: string;
  };
}

interface BrowseBooksProps {
  onSuccess?: () => void;
}

const FEATURED_QUERIES = [
  'bestseller fiction 2025',
  'popular fantasy novels',
  'classic literature',
  'self help books',
  'science fiction space',
  'mystery thriller',
];

const BrowseBooks = ({ onSuccess }: BrowseBooksProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GoogleBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const { addBook } = useBooks();
  const { toast } = useToast();

  const searchBooks = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=20&printType=books`
      );
      const data = await res.json();
      setResults(data.items || []);
    } catch {
      toast({ title: 'Search failed', variant: 'destructive' });
    }
    setLoading(false);
  };

  // Load featured books on mount
  useEffect(() => {
    const randomQuery = FEATURED_QUERIES[Math.floor(Math.random() * FEATURED_QUERIES.length)];
    searchBooks(randomQuery);
  }, []);

  const handleAdd = async (book: GoogleBook, status: BookStatus) => {
    setAddingId(book.id);
    try {
      const info = book.volumeInfo;
      await addBook.mutateAsync({
        title: info.title,
        author: info.authors?.join(', ') || null,
        genre: info.categories?.[0] || null,
        status,
        total_pages: info.pageCount || null,
        pages_read: status === 'read' ? (info.pageCount || 0) : 0,
        rating: null,
        review_notes: null,
        start_date: status === 'reading' ? new Date().toISOString().split('T')[0] : null,
        finish_date: status === 'read' ? new Date().toISOString().split('T')[0] : null,
      });
      toast({ title: `"${info.title}" added!` });
      onSuccess?.();
    } catch {
      toast({ title: 'Failed to add book', variant: 'destructive' });
    }
    setAddingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form
        onSubmit={e => {
          e.preventDefault();
          searchBooks(query);
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for books..."
            className="pl-9"
          />
        </div>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </form>

      {/* Results grid */}
      {loading && results.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {results.map(book => {
            const info = book.volumeInfo;
            const thumbnail = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
            return (
              <Card key={book.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Cover */}
                  <div className="flex h-40 items-center justify-center bg-muted">
                    {thumbnail ? (
                      <img
                        src={thumbnail.replace('http://', 'https://')}
                        alt={info.title}
                        className="h-full w-auto object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-muted-foreground">
                        No cover
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-3 space-y-2">
                    <p className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
                      {info.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {info.authors?.join(', ') || 'Unknown author'}
                    </p>
                    {info.pageCount && (
                      <Badge variant="secondary" className="text-[10px]">
                        {info.pageCount} pages
                      </Badge>
                    )}
                    {/* Add buttons */}
                    <div className="flex flex-col gap-1.5 pt-1">
                      <Button
                        size="sm"
                        className="h-7 w-full text-xs"
                        onClick={() => handleAdd(book, 'want_to_read')}
                        disabled={addingId === book.id}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Want to Read
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-full text-xs"
                        onClick={() => handleAdd(book, 'reading')}
                        disabled={addingId === book.id}
                      >
                        Start Reading
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && results.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          No books found. Try a different search.
        </p>
      )}
    </div>
  );
};

export default BrowseBooks;
