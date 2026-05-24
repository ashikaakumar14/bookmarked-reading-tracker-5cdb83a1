
-- Create book status enum
CREATE TYPE public.book_status AS ENUM ('want_to_read', 'reading', 'read');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  genre TEXT,
  tags TEXT[],
  status book_status NOT NULL DEFAULT 'want_to_read',
  date_added TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  start_date DATE,
  finish_date DATE,
  pages_read INTEGER NOT NULL DEFAULT 0,
  total_pages INTEGER,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own books" ON public.books FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own books" ON public.books FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own books" ON public.books FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own books" ON public.books FOR DELETE USING (auth.uid() = user_id);

-- Create lists table
CREATE TABLE public.lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lists" ON public.lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own lists" ON public.lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own lists" ON public.lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own lists" ON public.lists FOR DELETE USING (auth.uid() = user_id);

-- Create list_books junction table
CREATE TABLE public.list_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  UNIQUE(list_id, book_id)
);

ALTER TABLE public.list_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own list_books" ON public.list_books FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.lists WHERE id = list_books.list_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert their own list_books" ON public.list_books FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.lists WHERE id = list_books.list_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete their own list_books" ON public.list_books FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.lists WHERE id = list_books.list_id AND user_id = auth.uid()));

-- Create public_posts table
CREATE TABLE public.public_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES public.books(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.public_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own posts" ON public.public_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view public posts" ON public.public_posts FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert their own posts" ON public.public_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.public_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.public_posts FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
