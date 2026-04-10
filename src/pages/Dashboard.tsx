import { useBooks } from '@/hooks/useBooks';
import { useAuth } from '@/hooks/useAuth';
import ReadingRing from '@/components/ReadingRing';
import BookCard from '@/components/BookCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, TrendingUp, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ThemeToggle from '@/components/ThemeToggle';

const ringColors = [
  'hsl(25, 75%, 47%)',
  'hsl(150, 40%, 45%)',
  'hsl(210, 60%, 55%)',
  'hsl(340, 60%, 55%)',
  'hsl(45, 80%, 50%)',
];

const Dashboard = () => {
  const { books, isLoading } = useBooks();
  const { signOut } = useAuth();

  const currentlyReading = books.filter(b => b.status === 'reading');
  const booksReadThisYear = books.filter(b => {
    if (b.status !== 'read' || !b.finish_date) return false;
    return new Date(b.finish_date).getFullYear() === new Date().getFullYear();
  });
  const recentBooks = books.slice(0, 5);

  return (
    <div className="min-h-screen pb-24">
      <header className="flex items-center justify-between p-4 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Reading</h1>
          <p className="text-sm text-muted-foreground">Track your reading journey</p>
        </div>
        <Button variant="ghost" size="icon" onClick={signOut}>
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      <div className="px-4 space-y-5">
        {/* Stats cards */}
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

        {/* Reading progress rings */}
        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto py-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-24 rounded-xl" />)}
          </div>
        ) : currentlyReading.length > 0 ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Reading Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6 overflow-x-auto py-2">
                {currentlyReading.map((book, i) => (
                  <ReadingRing
                    key={book.id}
                    title={book.title}
                    pagesRead={book.pages_read}
                    totalPages={book.total_pages || 0}
                    color={ringColors[i % ringColors.length]}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No books in progress</p>
              <p className="text-xs text-muted-foreground">Tap + to add a book</p>
            </CardContent>
          </Card>
        )}

        {/* Recent books */}
        {recentBooks.length > 0 && (
          <div>
            <h2 className="mb-3 text-base font-semibold text-foreground">Recent Books</h2>
            <div className="space-y-3">
              {recentBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
