import { Book } from '@/hooks/useBooks';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';

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

  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate">{book.title}</h3>
            {book.author && <p className="text-sm text-muted-foreground truncate">{book.author}</p>}
          </div>
          <Badge variant="secondary" className={statusColors[book.status]}>
            {statusLabels[book.status]}
          </Badge>
        </div>

        {book.status === 'reading' && book.total_pages && (
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{book.pages_read} / {book.total_pages} pages</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {book.status === 'read' && book.rating && (
          <div className="mt-2 flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < book.rating! ? 'fill-primary text-primary' : 'text-muted'}`}
              />
            ))}
          </div>
        )}

        {book.genre && (
          <p className="mt-2 text-xs text-muted-foreground">{book.genre}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default BookCard;
