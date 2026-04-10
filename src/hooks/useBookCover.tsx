import { useState, useEffect } from 'react';

const coverCache = new Map<string, string | null>();

export const useBookCover = (title: string, author?: string | null) => {
  const [coverUrl, setCoverUrl] = useState<string | null>(coverCache.get(title) ?? null);
  const [loading, setLoading] = useState(!coverCache.has(title));

  useEffect(() => {
    const key = title;
    if (coverCache.has(key)) {
      setCoverUrl(coverCache.get(key) ?? null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const query = author ? `${title} ${author}` : title;
    
    fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1&printType=books`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const url = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail?.replace('http://', 'https://') || null;
        coverCache.set(key, url);
        setCoverUrl(url);
      })
      .catch(() => {
        if (!cancelled) coverCache.set(key, null);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [title, author]);

  return { coverUrl, loading };
};
