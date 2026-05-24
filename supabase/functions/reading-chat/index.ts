import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user's books
    const { data: books, error: booksError } = await supabase
      .from("books")
      .select("*")
      .eq("user_id", userId)
      .order("date_added", { ascending: false });

    if (booksError) {
      console.error("Books fetch error:", booksError);
      return new Response(JSON.stringify({ error: "Failed to fetch reading data" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const currentYear = now.getFullYear();

    // Build reading context summary
    const readingContext = buildReadingContext(books || [], now, currentYear);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a friendly, insightful reading assistant. You have access to the user's personal reading data below. Use ONLY this data to answer questions about their reading habits, patterns, and to provide personalized recommendations.

${readingContext}

Guidelines:
- Be conversational, warm, and encouraging about their reading journey.
- When recommending books, base suggestions on their preferred genres, authors, and reading patterns.
- For comparisons (week over week, month over month), use the dates available in the data.
- If asked about data you don't have, let them know politely.
- Keep responses concise but insightful.
- Use markdown formatting for readability.
- Today's date is ${now.toISOString().split("T")[0]}.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("reading-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildReadingContext(books: any[], now: Date, currentYear: number): string {
  if (!books.length) return "USER'S READING DATA:\nNo books tracked yet.";

  const reading = books.filter((b: any) => b.status === "reading");
  const read = books.filter((b: any) => b.status === "read");
  const wantToRead = books.filter((b: any) => b.status === "want_to_read");
  const readThisYear = read.filter((b: any) => b.finish_date && new Date(b.finish_date).getFullYear() === currentYear);

  // Genre breakdown
  const genres: Record<string, number> = {};
  books.forEach((b: any) => { if (b.genre) genres[b.genre] = (genres[b.genre] || 0) + 1; });

  // Author breakdown
  const authors: Record<string, number> = {};
  books.forEach((b: any) => { if (b.author) authors[b.author] = (authors[b.author] || 0) + 1; });

  let ctx = `USER'S READING DATA (${books.length} total books):\n\n`;
  ctx += `Currently reading: ${reading.length} books\n`;
  ctx += `Finished: ${read.length} books (${readThisYear.length} this year)\n`;
  ctx += `Want to read: ${wantToRead.length} books\n\n`;

  if (Object.keys(genres).length) {
    ctx += "GENRES: " + Object.entries(genres).sort((a, b) => b[1] - a[1]).map(([g, c]) => `${g} (${c})`).join(", ") + "\n\n";
  }
  if (Object.keys(authors).length) {
    ctx += "AUTHORS: " + Object.entries(authors).sort((a, b) => b[1] - a[1]).map(([a, c]) => `${a} (${c})`).join(", ") + "\n\n";
  }

  ctx += "ALL BOOKS:\n";
  books.forEach((b: any) => {
    ctx += `- "${b.title}"${b.author ? ` by ${b.author}` : ""} | Status: ${b.status} | Genre: ${b.genre || "N/A"}`;
    if (b.total_pages) ctx += ` | Pages: ${b.pages_read}/${b.total_pages}`;
    if (b.rating) ctx += ` | Rating: ${b.rating}/5`;
    if (b.start_date) ctx += ` | Started: ${b.start_date}`;
    if (b.finish_date) ctx += ` | Finished: ${b.finish_date}`;
    if (b.review_notes) ctx += ` | Notes: ${b.review_notes}`;
    if (b.tags?.length) ctx += ` | Tags: ${b.tags.join(", ")}`;
    ctx += "\n";
  });

  return ctx;
}
