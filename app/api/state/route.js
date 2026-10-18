import { requireUser, json } from "@/lib/supabase/route";
import { loadUserState } from "@/lib/supabase/persist";

export async function GET(request) {
  const { admin, user, error } = await requireUser(request);
  if (error) return error;
  try {
    const loaded = await loadUserState(admin, user.id);
    if (!loaded) return json({ error: "Профиль не найден", code: "NOT_FOUND" }, 404);
    return json({ state: loaded.state });
  } catch (e) {
    console.error("state load failed", e);
    return json({ error: "Не удалось загрузить прогресс", code: "SERVER" }, 500);
  }
}
