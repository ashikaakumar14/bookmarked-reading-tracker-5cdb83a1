import AddBookForm from '@/components/AddBookForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const AddPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-24">
      <header className="p-4 pt-6">
        <h1 className="text-2xl font-bold text-foreground">Add</h1>
        <p className="text-sm text-muted-foreground">Add a book to your library</p>
      </header>

      <div className="px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add a new book</CardTitle>
          </CardHeader>
          <CardContent>
            <AddBookForm onSuccess={() => navigate('/')} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddPage;
