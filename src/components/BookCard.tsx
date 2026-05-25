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

const BookCoverFallback = ({ title, author }: { title: string; author?: string | null }) => (
  <div style={{
    width: '100%',
    height: '100%',
    backgroundColor: '#C1583A',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
    boxSizing: 'border-box'
  }}>
    <span style={{
      color: '#FFFFFF',
      fontSize: '10px',
      fontWeight: 700,
      lineHeight: 1.3,
      textAlign: 'center',
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: 4,
      WebkitBoxOrient: 'vertical',
      textShadow: '0px 1px 3px rgba(0,0,0,0.5)'
    }}>
      {title}
    </span>
    {author && (
      <span style={{
        color: '#FFFFFF',
        opacity: 0.8,
        fontSize: '8px',
        marginTop: '5px',
        textAlign: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        width: '100%',
        textShadow: '0px 1px 2px rgba(0,0,0,0.4)'
      }}>
        {author}
      </span>
    )}
  </div>
);

const BookCard = ({ book, onClick }: BookCardProps) => {
  const progress = book.total_pages ? Math.round((book.pages_read / book.total_pages) * 100) : 0;

  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={onClick}>
      <CardContent className="flex gap-3 p-3">
        {/* Cover */}
        <div className="h-24 w-16 shrink-0 overflow-hidden rounded-md">
          <BookCoverFallback title={book.title} author={book.author} />
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
