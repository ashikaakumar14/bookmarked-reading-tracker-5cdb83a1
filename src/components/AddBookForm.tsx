import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBooks } from '@/hooks/useBooks';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type BookStatus = Database['public']['Enums']['book_status'];

interface AddBookFormProps {
  onSuccess?: () => void;
}

const AddBookForm = ({ onSuccess }: AddBookFormProps) => {
  const { addBook } = useBooks();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [status, setStatus] = useState<BookStatus>('want_to_read');
  const [rating, setRating] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBook.mutateAsync({
        title: title.trim(),
        author: author.trim() || null,
        genre: genre.trim() || null,
        status,
        total_pages: null,
        pages_read: 0,
        rating: rating ? parseInt(rating) : null,
        review_notes: reviewNotes.trim() || null,
        start_date: status === 'reading' ? new Date().toISOString().split('T')[0] : null,
        finish_date: status === 'read' ? new Date().toISOString().split('T')[0] : null,
      });
      toast({ title: 'Book added!' });
      onSuccess?.();
    } catch {
      toast({ title: 'Failed to add book', variant: 'destructive' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Book title" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="author">Author</Label>
        <Input id="author" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author name" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="genre">Genre</Label>
          <Input id="genre" value={genre} onChange={e => setGenre(e.target.value)} placeholder="e.g. Fiction" />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={v => setStatus(v as BookStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="want_to_read">Want to Read</SelectItem>
              <SelectItem value="reading">Reading</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {status === 'read' && (
        <div className="space-y-2">
          <Label htmlFor="rating">Rating (1-5)</Label>
          <Input id="rating" type="number" min="1" max="5" value={rating} onChange={e => setRating(e.target.value)} placeholder="5" />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} placeholder="Your thoughts..." rows={3} />
      </div>
      <Button type="submit" className="w-full" disabled={addBook.isPending}>
        {addBook.isPending ? 'Adding...' : 'Add Book'}
      </Button>
    </form>
  );
};

export default AddBookForm;
