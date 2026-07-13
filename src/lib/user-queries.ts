import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  display_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Preferences = {
  user_id: string;
  theme: "light" | "dark" | "system";
  enable_suggestions: boolean;
  save_history: boolean;
  enable_ai_summary: boolean;
  summary_length: "short" | "medium" | "long";
};

export async function getProfile(): Promise<Profile | null> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function updateProfile(patch: Partial<Pick<Profile, "display_name" | "full_name" | "avatar_url">>) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not signed in");
  const { error } = await supabase.from("profiles").update(patch).eq("id", u.user.id);
  if (error) throw error;
}

export async function uploadAvatar(file: File): Promise<string> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not signed in");
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${u.user.id}/avatar-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;
  const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365);
  const url = signed?.signedUrl ?? path;
  await updateProfile({ avatar_url: url });
  return url;
}

export async function getUserStats(): Promise<{ searches: number; bookmarks: number }> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return { searches: 0, bookmarks: 0 };
  const [s, b] = await Promise.all([
    supabase.from("search_history").select("id", { count: "exact", head: true }).eq("user_id", u.user.id),
    supabase.from("bookmarks").select("id", { count: "exact", head: true }).eq("user_id", u.user.id),
  ]);
  return { searches: s.count ?? 0, bookmarks: b.count ?? 0 };
}

export async function getPreferences(): Promise<Preferences> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", u.user.id)
    .maybeSingle();
  if (error) throw error;
  if (data) return data as Preferences;
  const defaults: Preferences = {
    user_id: u.user.id,
    theme: "system",
    enable_suggestions: true,
    save_history: true,
    enable_ai_summary: true,
    summary_length: "medium",
  };
  await supabase.from("user_preferences").insert(defaults);
  return defaults;
}

export async function updatePreferences(patch: Partial<Omit<Preferences, "user_id">>) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not signed in");
  const { error } = await supabase
    .from("user_preferences")
    .upsert({ user_id: u.user.id, ...patch }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function changePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function deleteAccount() {
  // Client-side cascade: remove user-owned rows, then sign out.
  // Full auth user deletion requires service role; we sign out after wiping data.
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  await supabase.from("bookmarks").delete().eq("user_id", u.user.id);
  await supabase.from("search_history").delete().eq("user_id", u.user.id);
  await supabase.from("user_preferences").delete().eq("user_id", u.user.id);
  await supabase.from("profiles").delete().eq("id", u.user.id);
  await supabase.auth.signOut();
}
