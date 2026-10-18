// Только для серверных маршрутов (app/api/*). Ключ service_role никогда не
// попадает в браузер: у него нет префикса NEXT_PUBLIC_.
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, isSupabaseConfigured } from "../config";

export function getAdminSupabase() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isSupabaseConfigured || !key) return null;
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Проверяет Bearer-токен из запроса и возвращает пользователя Supabase или null. */
export async function getRequestUser(request, admin) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}
