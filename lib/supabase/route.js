// Общая обвязка серверных маршрутов: проверка конфигурации и авторизации.
import { NextResponse } from "next/server";
import { getAdminSupabase, getRequestUser } from "./server";

export function json(data, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

/** Возвращает { admin, user } или готовый ответ с ошибкой. */
export async function requireUser(request) {
  const admin = getAdminSupabase();
  if (!admin) {
    return { error: json({ error: "Серверный режим не настроен: задайте NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY и SUPABASE_SERVICE_ROLE_KEY", code: "NOT_CONFIGURED" }, 503) };
  }
  const user = await getRequestUser(request, admin);
  if (!user) return { error: json({ error: "Требуется вход", code: "UNAUTHORIZED" }, 401) };
  return { admin, user };
}
