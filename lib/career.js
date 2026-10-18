// Тест «Кем стать?». Результат — ориентир для размышлений, а не приговор:
// интересы меняются, и любую профессию можно освоить при желании.

export const DIRECTIONS = {
  it: {
    title: "IT и программирование",
    emoji: "💻",
    color: "#4f46e5",
    description: "Создание программ, сайтов, игр, систем искусственного интеллекта и защита данных.",
    subjects: ["informatics", "math", "algebra", "english", "physics"],
    skills: ["Логическое мышление", "Внимательность к деталям", "Умение учиться новому", "Английский язык"],
    professions: ["Программист", "Веб-разработчик", "Специалист по данным", "Разработчик игр", "Специалист по кибербезопасности"],
    lessons: ["inf-algorithms", "inf-binary", "math-natural"],
  },
  medicine: {
    title: "Медицина и здоровье",
    emoji: "🩺",
    color: "#e11d48",
    description: "Забота о здоровье людей: диагностика, лечение, профилактика и создание лекарств.",
    subjects: ["biology", "chemistry", "physics", "russian", "english"],
    skills: ["Сочувствие", "Ответственность", "Стрессоустойчивость", "Память"],
    professions: ["Врач", "Медсестра / медбрат", "Фармацевт", "Стоматолог", "Лаборант"],
    lessons: ["bio-cell", "chem-acids-bases", "bio-photosynthesis"],
  },
  engineering: {
    title: "Инженерия и технологии",
    emoji: "⚙️",
    color: "#0891b2",
    description: "Проектирование машин, зданий, энергосистем, роботов и транспорта.",
    subjects: ["physics", "math", "geometry", "drawing", "informatics"],
    skills: ["Пространственное мышление", "Расчёты", "Работа руками", "Командная работа"],
    professions: ["Инженер-строитель", "Инженер-энергетик", "Робототехник", "Архитектор", "Инженер-механик"],
    lessons: ["phys-force", "phys-motion", "math-area"],
  },
  science: {
    title: "Наука и исследования",
    emoji: "🔭",
    color: "#7c3aed",
    description: "Поиск ответов на загадки природы: опыты, наблюдения и открытия.",
    subjects: ["chemistry", "physics", "biology", "math", "geography"],
    skills: ["Любопытство", "Критическое мышление", "Терпение", "Аккуратность"],
    professions: ["Химик-исследователь", "Физик", "Астроном", "Генетик", "Геолог"],
    lessons: ["chem-reactions", "chem-periodic", "phys-density"],
  },
  design: {
    title: "Дизайн и творчество",
    emoji: "🎨",
    color: "#db2777",
    description: "Создание красивого и удобного: от интерфейсов и одежды до архитектуры и анимации.",
    subjects: ["technology", "drawing", "literature", "informatics", "history-world"],
    skills: ["Креативность", "Чувство стиля", "Наблюдательность", "Умение слышать заказчика"],
    professions: ["UI/UX-дизайнер", "Графический дизайнер", "Аниматор", "Дизайнер одежды", "Мастер народных ремёсел"],
    lessons: ["math-area", "inf-computer", "hist-silkroad"],
  },
  business: {
    title: "Экономика и бизнес",
    emoji: "📊",
    color: "#ca8a04",
    description: "Управление деньгами, компаниями и проектами, запуск собственного дела.",
    subjects: ["economics", "math", "english", "law", "geography"],
    skills: ["Организованность", "Умение договариваться", "Финансовая грамотность", "Лидерство"],
    professions: ["Предприниматель", "Экономист", "Финансовый аналитик", "Маркетолог", "Менеджер проектов"],
    lessons: ["math-percent", "math-decimals", "hist-silkroad"],
  },
  education: {
    title: "Образование",
    emoji: "📖",
    color: "#2563eb",
    description: "Обучение и развитие других людей: школа, университет, онлайн-курсы.",
    subjects: ["literature", "russian", "uzbek", "history-uz", "upbringing"],
    skills: ["Умение объяснять", "Терпение", "Эмпатия", "Публичные выступления"],
    professions: ["Учитель", "Воспитатель", "Методист онлайн-курсов", "Психолог", "Тренер"],
    lessons: ["eng-vocab-school", "hist-scholars", "math-fractions"],
  },
  law: {
    title: "Право и общество",
    emoji: "⚖️",
    color: "#475569",
    description: "Защита прав людей, справедливость, государственное управление и дипломатия.",
    subjects: ["law", "history-uz", "history-world", "russian", "english"],
    skills: ["Аргументация", "Чувство справедливости", "Работа с текстами", "Ораторское мастерство"],
    professions: ["Юрист", "Адвокат", "Судья", "Дипломат", "Государственный служащий"],
    lessons: ["hist-independence", "hist-temur", "hist-ancient"],
  },
  ecology: {
    title: "Экология и аграрные науки",
    emoji: "🌱",
    color: "#16a34a",
    description: "Охрана природы, рациональное использование воды и земли, современное сельское хозяйство.",
    subjects: ["biology", "geography", "chemistry", "nature"],
    skills: ["Любовь к природе", "Наблюдательность", "Системное мышление", "Работа на открытом воздухе"],
    professions: ["Эколог", "Агроном", "Специалист по водным ресурсам", "Лесник", "Биотехнолог"],
    lessons: ["bio-ecosystems", "bio-kingdoms", "bio-photosynthesis"],
  },
  media: {
    title: "Медиа и коммуникации",
    emoji: "🎙️",
    color: "#ea580c",
    description: "Журналистика, блогинг, переводы, реклама и всё, что связано с рассказом историй.",
    subjects: ["literature", "uzbek", "russian", "english", "history-world"],
    skills: ["Грамотная речь", "Любознательность", "Общительность", "Иностранные языки"],
    professions: ["Журналист", "Переводчик", "Копирайтер", "Видеоблогер", "PR-специалист"],
    lessons: ["eng-present-simple", "eng-past-simple", "eng-vocab-school"],
  },
};

// Каждый вариант добавляет баллы направлениям.
export const CAREER_QUESTIONS = [
  {
    id: "subjects",
    text: "Какие уроки тебе нравятся больше всего?",
    options: [
      { text: "Информатика и математика", w: { it: 3, engineering: 1, business: 1 } },
      { text: "Биология и химия", w: { medicine: 2, science: 2, ecology: 1 } },
      { text: "Литература и языки", w: { media: 3, education: 1, law: 1 } },
      { text: "История и право", w: { law: 3, education: 1, media: 1 } },
      { text: "Технология и рисование", w: { design: 3, engineering: 1 } },
    ],
  },
  {
    id: "freeTime",
    text: "Чем ты любишь заниматься в свободное время?",
    options: [
      { text: "Играть в компьютерные игры и разбираться, как они устроены", w: { it: 3, design: 1 } },
      { text: "Рисовать, фотографировать, снимать видео", w: { design: 3, media: 1 } },
      { text: "Гулять на природе, ухаживать за растениями и животными", w: { ecology: 3, medicine: 1 } },
      { text: "Читать книги и смотреть документальные фильмы", w: { science: 2, education: 1, media: 1 } },
      { text: "Организовывать игры и встречи с друзьями", w: { business: 2, education: 1, law: 1 } },
    ],
  },
  {
    id: "activity",
    text: "Что тебе ближе всего?",
    options: [
      { text: "Создавать что-то новое", w: { design: 2, it: 1, engineering: 1 } },
      { text: "Исследовать и делать открытия", w: { science: 3, ecology: 1 } },
      { text: "Программировать и автоматизировать", w: { it: 3 } },
      { text: "Помогать людям", w: { medicine: 2, education: 2 } },
      { text: "Организовывать проекты и вести команду", w: { business: 3, law: 1 } },
    ],
  },
  {
    id: "task",
    text: "Какое школьное задание ты выберешь?",
    options: [
      { text: "Собрать модель моста, который выдержит груз", w: { engineering: 3 } },
      { text: "Провести опыт и записать результаты", w: { science: 2, medicine: 1 } },
      { text: "Написать статью для школьной газеты", w: { media: 3 } },
      { text: "Подготовить бизнес-план школьной ярмарки", w: { business: 3 } },
      { text: "Провести урок для младших школьников", w: { education: 3 } },
    ],
  },
  {
    id: "skill",
    text: "Какой навык ты хочешь развить?",
    options: [
      { text: "Логику и программирование", w: { it: 2, engineering: 1 } },
      { text: "Убедительно выступать и спорить", w: { law: 2, media: 1, business: 1 } },
      { text: "Творческое мышление", w: { design: 2, media: 1 } },
      { text: "Заботу о здоровье — своём и чужом", w: { medicine: 3 } },
      { text: "Понимание природы и экологии", w: { ecology: 2, science: 1 } },
    ],
  },
  {
    id: "place",
    text: "Где бы ты хотел(а) работать?",
    options: [
      { text: "В современном IT-офисе или удалённо", w: { it: 2, design: 1, media: 1 } },
      { text: "В больнице или лаборатории", w: { medicine: 2, science: 2 } },
      { text: "На стройке, заводе или в конструкторском бюро", w: { engineering: 3 } },
      { text: "На природе, в поле, в заповеднике", w: { ecology: 3 } },
      { text: "В школе, университете, суде или министерстве", w: { education: 2, law: 2 } },
    ],
  },
  {
    id: "problem",
    text: "Какую проблему ты хотел(а) бы решить?",
    options: [
      { text: "Нехватку воды и спасение Аральского моря", w: { ecology: 3, science: 1 } },
      { text: "Лечение болезней", w: { medicine: 3, science: 1 } },
      { text: "Доступное образование для всех детей", w: { education: 3, it: 1 } },
      { text: "Создание новых рабочих мест", w: { business: 3, law: 1 } },
      { text: "Удобные умные города и транспорт", w: { engineering: 2, it: 2 } },
    ],
  },
  {
    id: "team",
    text: "Какую роль ты обычно берёшь в командном проекте?",
    options: [
      { text: "Лидер: распределяю задачи", w: { business: 2, law: 1 } },
      { text: "Генератор идей", w: { design: 2, media: 1 } },
      { text: "Технический специалист: делаю сложную часть", w: { it: 2, engineering: 2 } },
      { text: "Исследователь: ищу информацию и факты", w: { science: 2, law: 1 } },
      { text: "Тот, кто поддерживает и помогает всем", w: { education: 2, medicine: 1 } },
    ],
  },
  {
    id: "dream",
    text: "Какой заголовок о себе ты хотел(а) бы прочитать через 15 лет?",
    options: [
      { text: "«Создатель популярного приложения из Ташкента»", w: { it: 3, business: 1 } },
      { text: "«Учёный открыл новое лекарство»", w: { medicine: 2, science: 2 } },
      { text: "«Новый мост и метро построены по проекту выпускника нашей школы»", w: { engineering: 3 } },
      { text: "«Книга молодого автора переведена на 10 языков»", w: { media: 3, education: 1 } },
      { text: "«Фермеры удвоили урожай благодаря экологичным технологиям»", w: { ecology: 3, business: 1 } },
    ],
  },
  {
    id: "values",
    text: "Что для тебя важнее всего в работе?",
    options: [
      { text: "Справедливость и порядок", w: { law: 3 } },
      { text: "Красота и самовыражение", w: { design: 3 } },
      { text: "Польза людям", w: { medicine: 2, education: 2 } },
      { text: "Новые знания и открытия", w: { science: 3 } },
      { text: "Свобода и высокий доход", w: { business: 2, it: 2 } },
    ],
  },
];

/** answers: массив индексов выбранных вариантов. Возвращает направления по убыванию. */
export function scoreCareer(answers) {
  const totals = Object.fromEntries(Object.keys(DIRECTIONS).map((k) => [k, 0]));
  CAREER_QUESTIONS.forEach((q, i) => {
    const opt = q.options[answers[i]];
    if (!opt) return;
    for (const [dir, w] of Object.entries(opt.w)) totals[dir] += w;
  });
  const max = Math.max(1, ...Object.values(totals));
  return Object.entries(totals)
    .map(([id, score]) => ({ id, score, percent: Math.round((score / max) * 100) }))
    .sort((a, b) => b.score - a.score);
}
