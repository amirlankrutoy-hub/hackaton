import { requireUser, json } from "@/lib/supabase/route";
import { weekStartKey, dayStartIso } from "@/lib/time";

export async function GET(request) {
  const { admin, error } = await requireUser(request);
  if (error) return error;
  const { data, error: dbError } = await admin.rpc("get_leaderboard", { p_week_start: dayStartIso(weekStartKey()), p_limit: 200 });
  if (dbError) {
    console.error("leaderboard failed", dbError);
    return json({ error: "Не удалось загрузить рейтинг", code: "SERVER" }, 500);
  }
  return json({
    entries: data.map((r) => ({
      id: r.id,
      name: r.display_name,
      username: r.username,
      avatar: r.equipped?.avatar || "avatar-fox",
      frame: r.equipped?.frame || null,
      xp: r.xp,
      weeklyXp: Number(r.weekly_xp),
      lessonsCompleted: r.lessons_completed,
      grade: r.grade,
      demo: false,
    })),
  });
}
