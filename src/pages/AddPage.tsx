import { useState } from 'react';
import AddBookForm from '@/components/AddBookForm';
import BrowseBooks from '@/components/BrowseBooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AddPage = () => {
  const navigate = useNavigate();
  const [bookTab, setBookTab] = useState<'browse' | 'manual'>('browse');

  return (
    <div className="min-h-screen pb-24">
      <header className="p-4 pt-6">
        <h1 className="text-2xl font-bold text-foreground">Add</h1>
        <p className="text-sm text-muted-foreground">Add a book to your library</p>
      </header>

      <div className="px-4 space-y-4">
        <div className="flex gap-2">
          <Button
            variant={bookTab === 'browse' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setBookTab('browse')}
          >
            Browse
          </Button>
          <Button
            variant={bookTab === 'manual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setBookTab('manual')}
          >
            Add Manually
          </Button>
        </div>

        {bookTab === 'browse' ? (
          <BrowseBooks onSuccess={() => navigate('/')} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add a new book</CardTitle>
            </CardHeader>
            <CardContent>
              <AddBookForm onSuccess={() => navigate('/')} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AddPage;
