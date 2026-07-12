import { supabase } from "@/integrations/supabase/client";

export type Document = {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  ai_summary: string | null;
  created_at: string;
};

const PAGE_SIZE = 6;

export async function searchDocuments(params: {
  q: string;
  category?: string | null;
  page?: number;
}): Promise<{ items: Document[]; total: number }> {
  const { q, category, page = 1 } = params;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("documents")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const term = q.trim();
  if (term) {
    // case-insensitive partial match across title, description, category
    const like = `%${term.replace(/[%_]/g, "")}%`;
    query = query.or(
      `title.ilike.${like},description.ilike.${like},content.ilike.${like},category.ilike.${like}`,
    );
  }
  if (category) query = query.eq("category", category);

  const { data, count, error } = await query;
  if (error) throw error;
  return { items: (data ?? []) as Document[], total: count ?? 0 };
}

export const SEARCH_PAGE_SIZE = PAGE_SIZE;

export async function getStats(): Promise<{ documents: number }> {
  const { count } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true });
  return { documents: count ?? 0 };
}

export async function logSearch(keyword: string) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("search_history").insert({
    user_id: data.user.id,
    keyword,
  });
}

export async function getSearchHistory() {
  const { data, error } = await supabase
    .from("search_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function deleteHistoryItem(id: string) {
  const { error } = await supabase.from("search_history").delete().eq("id", id);
  if (error) throw error;
}

export async function clearHistory() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  const { error } = await supabase.from("search_history").delete().eq("user_id", data.user.id);
  if (error) throw error;
}

export async function getBookmarks(): Promise<
  { id: string; document: Document; created_at: string }[]
> {
  const { data, error } = await supabase
    .from("bookmarks")
    .select("id, created_at, document:documents(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((b) => ({
    id: b.id as string,
    created_at: b.created_at as string,
    document: b.document as unknown as Document,
  }));
}

export async function getBookmarkIds(): Promise<Set<string>> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return new Set();
  const { data: rows } = await supabase.from("bookmarks").select("document_id");
  return new Set((rows ?? []).map((r) => r.document_id as string));
}

export async function toggleBookmark(documentId: string, currentlyBookmarked: boolean) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Please sign in to bookmark results.");
  if (currentlyBookmarked) {
    await supabase.from("bookmarks").delete().eq("document_id", documentId).eq("user_id", data.user.id);
  } else {
    await supabase.from("bookmarks").insert({ document_id: documentId, user_id: data.user.id });
  }
}
