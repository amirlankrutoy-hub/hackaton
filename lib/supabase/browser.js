"use client";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "../config";

let client = null;

/** Браузерный клиент Supabase (публичный anon-ключ, права ограничены RLS). */
export function getBrowserSupabase() {
  if (!isSupabaseConfigured) return null;
  if (!client) client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}
