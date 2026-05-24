import { Book } from '@/hooks/useBooks';
import { useBookCover } from '@/hooks/useBookCover';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const statusLabels: Record<string, string> = {
  reading: 'Reading',
  read: 'Read',
  want_to_read: 'Want to Read',
};

const statusColors: Record<string, string> = {
  reading: 'bg-primary/15 text-primary',
  read: 'bg-accent/15 text-accent-foreground',
  want_to_read: 'bg-secondary text-secondary-foreground',
};

interface BookCardProps {
  book: Book;
  onClick?: () => void;
}

const BookCard = ({ book, onClick }: BookCardProps) => {
  const progress = book.total_pages ? Math.round((book.pages_read / book.total_pages) * 100) : 0;
  const { coverUrl, loading: coverLoading } = useBookCover(book.title, book.author);

  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={onClick}>
      <CardContent className="flex gap-3 p-3">
        {/* Cover */}
        <div className="h-24 w-16 shrink-0 overflow-hidden rounded-md">
          {coverLoading ? (
            <Skeleton className="h-full w-full" />
          ) : coverUrl ? (
            <img
              src={coverUrl}
              alt={book.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                const fallback = `https://covers.openlibrary.org/b/title/${book.title.replace(/\s+/g, '_')}-M.jpg`;
                if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
              }}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-primary px-2 py-3 text-center">
              <p className="text-[10px] font-semibold leading-tight text-primary-foreground line-clamp-4">
                {book.title}
              </p>
              {book.author && (
                <p className="mt-1.5 text-[8px] text-primary-foreground/70 leading-tight line-clamp-2">
                  {book.author}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm text-foreground truncate">{book.title}</h3>
              {book.author && <p className="text-xs text-muted-foreground truncate">{book.author}</p>}
            </div>
            <Badge variant="secondary" className={`${statusColors[book.status]} text-[10px] shrink-0`}>
              {statusLabels[book.status]}
            </Badge>
          </div>

          {book.status === 'reading' && book.total_pages && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{book.pages_read} / {book.total_pages} pages</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          {book.status === 'read' && book.rating && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < book.rating! ? 'fill-primary text-primary' : 'text-muted'}`}
                />
              ))}
            </div>
          )}

          {book.genre && (
            <p className="text-[11px] text-muted-foreground">{book.genre}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookCard;
