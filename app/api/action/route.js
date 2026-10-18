// Все изменения прогресса проходят здесь: сервер сам загружает состояние,
// повторно проверяет ответы через общий движок и только потом начисляет награды.
import { requireUser, json } from "@/lib/supabase/route";
import { loadUserState, saveUserState, ConflictError } from "@/lib/supabase/persist";
import { runAction, EngineError, ACTION_TYPES } from "@/lib/engine";

export async function POST(request) {
  const { admin, user, error } = await requireUser(request);
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Некорректный запрос", code: "BAD_REQUEST" }, 400);
  }
  const { type, payload } = body || {};
  if (!ACTION_TYPES.includes(type)) return json({ error: "Неизвестное действие", code: "BAD_REQUEST" }, 400);

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const loaded = await loadUserState(admin, user.id);
      if (!loaded) return json({ error: "Профиль не найден", code: "NOT_FOUND" }, 404);
      const { state, result } = runAction(loaded.state, type, payload || {});
      await saveUserState(admin, user.id, loaded.state, state, loaded.version);
      return json({ state, result });
    } catch (e) {
      if (e instanceof EngineError) return json({ error: e.message, code: e.code }, 400);
      if (e instanceof ConflictError) continue; // параллельный запрос — пробуем ещё раз
      if (e?.code === "23505") return json({ error: "Такое значение уже занято (например, никнейм)", code: "DUPLICATE" }, 409);
      console.error("action failed", type, e);
      return json({ error: "Ошибка сервера", code: "SERVER" }, 500);
    }
  }
  return json({ error: "Слишком много одновременных запросов, попробуйте ещё раз", code: "CONFLICT" }, 409);
}
