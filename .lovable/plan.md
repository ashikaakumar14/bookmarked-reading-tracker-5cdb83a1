

## Book Reading Tracker — Implementation Plan

### 1. Backend Setup (Lovable Cloud)
- Enable authentication with email/password
- Create database tables:
  - **profiles** (id, user_id, username, email, created_at)
  - **books** (id, user_id, title, genre, author, tags, status [want_to_read/reading/read], date_added, start_date, finish_date, pages_read, total_pages, rating, review_notes)
  - **lists** (id, user_id, name, created_at) — custom user lists
  - **list_books** (id, list_id, book_id) — junction table
  - **public_posts** (id, user_id, book_id, content, created_at, is_public)
- RLS policies: users can only access their own data; public posts visible to all

### 2. Auth Pages
- **Login page** — email & password, link to sign up
- **Sign up page** — username, email, password
- Clean, mobile-first card-based layout

### 3. Dashboard Page (Home)
- **Circular ring chart** showing reading progress for each currently-reading book (pages_read / total_pages)
- **"Books read this year" metric** — count of books with status=read and finish_date in current year
- Quick glance at recently added or in-progress books

### 4. Add Page
- Central **"+"** button with options to:
  - Add a new book (form with all book fields)
  - Add a review/note to an existing book
  - Create a public post about a book
- Mobile-friendly bottom sheet or modal forms

### 5. List Page
- Default lists: **Currently Reading**, **Want to Read**, **Read**
- Ability to **create custom lists** and assign books to them
- Book cards showing title, author, status, progress bar
- Filter/sort options

### 6. Navigation
- Bottom tab bar (mobile-first): Dashboard, Add (+), Lists
- Clean, minimal design with good typography and spacing

### 7. Public Posts
- Toggle on a post to make it public
- A public feed or shareable link for individual posts

