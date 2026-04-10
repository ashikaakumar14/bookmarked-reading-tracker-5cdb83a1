import { useBooks } from '@/hooks/useBooks';
import { useAuth } from '@/hooks/useAuth';
import ConcentricRings from '@/components/ReadingRing';
import BookCard from '@/components/BookCard';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, TrendingUp, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ThemeToggle from '@/components/ThemeToggle';
import ReadingChat from '@/components/ReadingChat';

const Dashboard = () => {
  const { books, isLoading } = useBooks();
  const { signOut } = useAuth();

  const currentlyReading = books.filter(b => b.status === 'reading');
  const booksReadThisYear = books.filter(b => {
    if (b.status !== 'read' || !b.finish_date) return false;
    return new Date(b.finish_date).getFullYear() === new Date().getFullYear();
  });

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="flex items-center justify-between p-4 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Reading</h1>
          <p className="text-sm text-muted-foreground">Track your reading journey</p>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="px-4 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{currentlyReading.length}</p>
                <p className="text-xs text-muted-foreground">Reading now</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{booksReadThisYear.length}</p>
                <p className="text-xs text-muted-foreground">Read this year</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Concentric progress rings */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Skeleton className="h-60 w-60 rounded-full" />
          </div>
        ) : currentlyReading.length > 0 ? (
          <div className="flex justify-center py-2">
            <ConcentricRings
              books={currentlyReading.map(b => ({
                id: b.id,
                title: b.title,
                pagesRead: b.pages_read,
                totalPages: b.total_pages || 0,
              }))}
            />
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No books in progress</p>
              <p className="text-xs text-muted-foreground">Tap + to add a book</p>
            </CardContent>
          </Card>
        )}

        {/* Books in progress details */}
        {currentlyReading.length > 0 && (
          <div>
            <h2 className="mb-3 text-base font-semibold text-foreground">In Progress</h2>
            <div className="space-y-3">
              {currentlyReading.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        )}
      </div>

      <ReadingChat />
    </div>
  );
};

export default Dashboard;
