import { useState } from 'react';
import AddBookForm from '@/components/AddBookForm';
import BrowseBooks from '@/components/BrowseBooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBooks } from '@/hooks/useBooks';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const AddPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { books } = useBooks();
  const { user } = useAuth();
  const [postContent, setPostContent] = useState('');
  const [postBookId, setPostBookId] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [posting, setPosting] = useState(false);
  const [bookTab, setBookTab] = useState<'browse' | 'manual'>('browse');

  const handlePost = async () => {
    if (!postContent.trim() || !user) return;
    setPosting(true);
    const { error } = await supabase.from('public_posts').insert({
      user_id: user.id,
      content: postContent.trim(),
      book_id: postBookId || null,
      is_public: isPublic,
    });
    if (error) {
      toast({ title: 'Failed to create post', variant: 'destructive' });
    } else {
      toast({ title: 'Post created!' });
      setPostContent('');
      setPostBookId('');
      setIsPublic(false);
    }
    setPosting(false);
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="p-4 pt-6">
        <h1 className="text-2xl font-bold text-foreground">Add</h1>
        <p className="text-sm text-muted-foreground">Add a book or create a post</p>
      </header>

      <div className="px-4">
        <Tabs defaultValue="book">
          <TabsList className="w-full">
            <TabsTrigger value="book" className="flex-1">Book</TabsTrigger>
            <TabsTrigger value="post" className="flex-1">Post</TabsTrigger>
          </TabsList>

          <TabsContent value="book" className="mt-4 space-y-4">
            {/* Sub-tabs: Browse vs Manual */}
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
          </TabsContent>

          <TabsContent value="post" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Create a post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {books.length > 0 && (
                  <div className="space-y-2">
                    <Label>About a book (optional)</Label>
                    <Select value={postBookId} onValueChange={setPostBookId}>
                      <SelectTrigger><SelectValue placeholder="Select a book" /></SelectTrigger>
                      <SelectContent>
                        {books.map(b => (
                          <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>What's on your mind?</Label>
                  <Textarea value={postContent} onChange={e => setPostContent(e.target.value)} placeholder="Share your thoughts about a book..." rows={4} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Make public</p>
                    <p className="text-xs text-muted-foreground">Share this with everyone</p>
                  </div>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                </div>
                <Button onClick={handlePost} className="w-full" disabled={posting || !postContent.trim()}>
                  {posting ? 'Posting...' : 'Create Post'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AddPage;
