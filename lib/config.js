// Режим работы определяется переменными окружения (см. .env.example).
// Без Supabase приложение работает в честном демо-режиме: прогресс хранится
// только в этом браузере, а в интерфейсе это явно обозначено.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const APP_MODE = isSupabaseConfigured ? "supabase" : "demo";
