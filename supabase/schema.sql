-- =====================================================================
-- EduQuest — схема базы данных Supabase (PostgreSQL)
-- Выполните этот файл в Supabase → SQL Editor, затем supabase/seed.sql
-- (seed генерируется командой `npm run db:seed-sql` из учебного контента).
--
-- Принцип безопасности: ученик может ЧИТАТЬ только свои строки (RLS),
-- но не может ничего ЗАПИСЫВАТЬ напрямую. Все изменения прогресса, XP и
-- Lumos выполняет серверный API-маршрут /api/action с ключом service_role
-- после повторной проверки ответов. service_role обходит RLS и хранится
-- только на сервере (переменная SUPABASE_SERVICE_ROLE_KEY).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- Справочники учебной программы ----------

create table if not exists public.grades (
  id smallint primary key check (id between 1 and 11),
  title text not null
);

create table if not exists public.subjects (
  id text primary key,
  title text not null,
  description text,
  category text,
  grade_from smallint not null references public.grades(id),
  grade_to smallint not null references public.grades(id),
  has_content boolean not null default false
);

create table if not exists public.chapters (
  id text primary key,
  subject_id text not null references public.subjects(id) on delete cascade,
  title text not null,
  position int not null
);

create table if not exists public.lessons (
  id text primary key,
  subject_id text not null references public.subjects(id) on delete cascade,
  chapter_id text not null references public.chapters(id) on delete cascade,
  title text not null,
  grade smallint not null references public.grades(id),
  position int not null,
  minutes int
);

-- Вопросы и правильные ответы: доступ только у сервера (нет политик чтения).
create table if not exists public.questions (
  id text primary key,
  lesson_id text not null references public.lessons(id) on delete cascade,
  type text not null check (type in ('mcq','definition','formula','image','fill','match','order')),
  prompt text not null,
  payload jsonb not null,          -- варианты, пары, шаги, пояснение
  answer jsonb not null,           -- правильный ответ
  position int not null
);

create table if not exists public.achievements (
  id text primary key,
  title text not null,
  description text,
  condition text,
  rarity text not null check (rarity in ('common','rare','epic','legendary')),
  reward_xp int not null default 0,
  reward_lumos int not null default 0
);

create table if not exists public.shop_items (
  id text primary key,
  category text not null,
  name text not null,
  description text,
  price int not null check (price >= 0),
  consumable boolean not null default false
);

create table if not exists public.daily_quest_pool (
  id text primary key,
  title text not null,
  metric text not null,
  target int not null
);

-- ---------- Пользовательские данные ----------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  username text not null unique check (username ~ '^[a-zA-Z0-9_]{3,20}$'),
  grade smallint not null default 7 references public.grades(id),
  language text not null default 'ru',
  equipped jsonb not null default '{}'::jsonb,
  is_public boolean not null default true,
  hide_real_name boolean not null default false,
  show_in_leaderboard boolean not null default true,
  xp int not null default 0 check (xp >= 0),
  lumos int not null default 0 check (lumos >= 0),
  lessons_completed int not null default 0,
  boosts jsonb not null default '{}'::jsonb,
  counters jsonb not null default '{}'::jsonb,
  last_lesson_id text,
  version int not null default 0,          -- оптимистическая блокировка
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null,
  completed boolean not null default false,
  best_correct int,
  last_correct int,
  attempts int not null default 0,
  failures int not null default 0,
  perfect boolean not null default false,
  viewed_at timestamptz,
  completed_at timestamptz,
  last_at timestamptz,
  primary key (user_id, lesson_id)
);

create table if not exists public.game_results (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null,
  correct int not null,
  mistakes int not null,
  total int not null,
  passed boolean not null,
  perfect boolean not null,
  xp int not null default 0,
  lumos int not null default 0,
  at timestamptz not null
);
create index if not exists game_results_user_at on public.game_results(user_id, at desc);

create table if not exists public.exam_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject_id text not null,
  attempts int not null default 0,
  best_percent int not null default 0,
  last_percent int,
  passed boolean not null default false,
  passed_at timestamptz,
  primary key (user_id, subject_id)
);

create table if not exists public.exam_results (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject_id text not null,
  correct int not null,
  total int not null,
  percent int not null,
  passed boolean not null,
  xp int not null default 0,
  lumos int not null default 0,
  at timestamptz not null
);

-- История начислений XP (основа глобального и недельного рейтинга).
create table if not exists public.xp_events (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount int not null check (amount > 0),
  reason text not null,
  key text not null,
  at timestamptz not null
);
create index if not exists xp_events_user_at on public.xp_events(user_id, at);

-- История операций с Lumos (начисления > 0, покупки < 0).
create table if not exists public.lumos_transactions (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount int not null,
  reason text not null,
  key text not null,
  at timestamptz not null
);

-- Уникальный ключ награды — защита от повторного начисления на уровне БД.
create table if not exists public.reward_claims (
  user_id uuid not null references public.profiles(id) on delete cascade,
  key text not null,
  at timestamptz not null,
  primary key (user_id, key)
);

create table if not exists public.user_achievements (
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null,
  primary key (user_id, achievement_id)
);

create table if not exists public.inventory (
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null,
  qty int not null default 1 check (qty >= 0),
  acquired_at timestamptz not null,
  primary key (user_id, item_id)
);

-- Дневная активность (по календарю Asia/Tashkent): серии и ежедневные задания.
create table if not exists public.activity_days (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  stats jsonb not null default '{}'::jsonb,
  primary key (user_id, day)
);

create table if not exists public.career_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  answers jsonb not null,
  ranking jsonb not null,
  at timestamptz not null
);

create table if not exists public.notifications (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  text text,
  read boolean not null default false,
  at timestamptz not null
);

-- ---------- Row Level Security ----------

do $$
declare t text;
begin
  foreach t in array array[
    'grades','subjects','chapters','lessons','questions','achievements','shop_items','daily_quest_pool',
    'profiles','lesson_progress','game_results','exam_progress','exam_results','xp_events',
    'lumos_transactions','reward_claims','user_achievements','inventory','activity_days',
    'career_results','notifications'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Каталоги открыты для чтения (кроме вопросов с ответами).
do $$
declare t text;
begin
  foreach t in array array['grades','subjects','chapters','lessons','achievements','shop_items','daily_quest_pool'] loop
    execute format('drop policy if exists "catalog read" on public.%I', t);
    execute format('create policy "catalog read" on public.%I for select to anon, authenticated using (true)', t);
  end loop;
end $$;

drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id);

-- Свои строки — только чтение. Политик insert/update/delete нет:
-- изменить XP, Lumos или результаты с клиента невозможно.
do $$
declare t text;
begin
  foreach t in array array[
    'lesson_progress','game_results','exam_progress','exam_results','xp_events','lumos_transactions',
    'reward_claims','user_achievements','inventory','activity_days','career_results','notifications'
  ] loop
    execute format('drop policy if exists "own rows read" on public.%I', t);
    execute format('create policy "own rows read" on public.%I for select to authenticated using (auth.uid() = user_id)', t);
  end loop;
end $$;

-- ---------- Профиль при регистрации ----------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_username text := coalesce(new.raw_user_meta_data->>'username', '');
  v_grade smallint := coalesce(nullif(new.raw_user_meta_data->>'grade', '')::smallint, 7);
begin
  if v_username !~ '^[a-zA-Z0-9_]{3,20}$' or exists (select 1 from public.profiles where username = v_username) then
    v_username := 'user_' || substr(replace(new.id::text, '-', ''), 1, 10);
  end if;
  insert into public.profiles (id, name, username, grade)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'name', ''), 'Ученик'), v_username, least(greatest(v_grade, 1), 11));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Рейтинг ----------
-- Возвращает только публичные поля учеников, разрешивших показ в рейтинге.
-- Lumos в рейтинг не входит. Недельный XP — сумма xp_events с начала недели.
create or replace function public.get_leaderboard(p_week_start timestamptz, p_limit int default 100)
returns table (
  id uuid, display_name text, username text, equipped jsonb, xp int,
  weekly_xp bigint, lessons_completed int, grade smallint
)
language sql stable security definer set search_path = public as $$
  select p.id,
         case when p.hide_real_name then p.username else p.name end,
         p.username,
         jsonb_build_object('avatar', p.equipped->>'avatar', 'frame', p.equipped->>'frame'),
         p.xp,
         coalesce((select sum(e.amount) from public.xp_events e where e.user_id = p.id and e.at >= p_week_start), 0),
         p.lessons_completed,
         p.grade
  from public.profiles p
  where p.show_in_leaderboard
  order by p.xp desc, p.created_at asc
  limit least(p_limit, 500);
$$;

revoke all on function public.get_leaderboard(timestamptz, int) from public;
grant execute on function public.get_leaderboard(timestamptz, int) to authenticated;

insert into public.grades (id, title)
select g, g || ' класс' from generate_series(1, 11) g
on conflict (id) do nothing;
