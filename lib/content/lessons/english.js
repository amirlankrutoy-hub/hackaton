import { mcq, pic, fill, match, order, tf } from "../builders";

const course = {
  subjectId: "english",
  chapters: [
    {
      id: "eng-ch1",
      title: "Present Tenses",
      lessons: [
        {
          id: "eng-present-simple",
          title: "Present Simple",
          grade: 5,
          minutes: 8,
          emoji: "⏰",
          goal: "Рассказывать о привычках и фактах в Present Simple.",
          intro: "Hello! Сегодня научимся говорить о том, что ты делаешь каждый день. Это время Present Simple!",
          steps: [
            {
              title: "Когда используем",
              text: "Present Simple описывает регулярные действия, привычки и факты: I play football every day. Water boils at 100 °C. Слова-подсказки: always, usually, often, sometimes, never, every day, on Mondays.",
              simple: "Present Simple — это «обычно», «всегда», «каждый день».",
              visual: { type: "tense", tense: "simple" },
            },
            {
              title: "Окончание -s для he, she, it",
              text: "С he, she, it к глаголу добавляем -s: she reads, he plays. После -s, -sh, -ch, -x, -o добавляем -es: watches, goes. Если перед -y стоит согласная, y → ies: study → studies.",
              simple: "He, she, it — «любят» окончание -s: she likes, he goes.",
            },
            {
              title: "Отрицания и вопросы",
              text: "Используем помощников do / does: I don't like milk. She doesn't play tennis. Do you speak English? Does he live in Tashkent? Важно: после does глагол без -s — Does she play? (не «plays»).",
              simple: "Don't / doesn't — для отрицания, do / does — для вопроса. После does окончание -s пропадает.",
            },
          ],
          examples: [
            "Madina gets up at 7 o'clock. She has breakfast and goes to school. After school she usually does her homework. — Мадина встаёт в 7 часов, завтракает и идёт в школу. После школы она обычно делает уроки.",
            "Does your brother play football? — Yes, he does. He plays every Saturday. А вот: I don't play football, I play chess.",
          ],
          check: mcq("Выбери верный вариант: «He ___ in Samarkand.»", ["lives", "live", "living", "is live"], 0, "С he добавляем -s: he lives."),
          summary: [
            "Present Simple — привычки, расписания, факты.",
            "He / she / it + глагол-s (es, ies).",
            "Вопросы и отрицания — с do / does, после does глагол без -s.",
          ],
          faq: [
            { keys: ["have", "has"], answer: "Глагол have с he, she, it превращается в has: She has a cat. Но в вопросе: Does she have a cat?" },
            { keys: ["am", "is", "are", "be"], answer: "Глагол to be в Present Simple: I am, he/she/it is, we/you/they are. С ним do/does не нужны: Are you happy? She isn't at home." },
          ],
          questions: [
            fill("She ___ to school every day.", ["goes", "go", "going", "is go"], 0, "She → go + es = goes."),
            mcq("Как сказать «Он не любит молоко»?", ["He doesn't like milk.", "He don't like milk.", "He not like milk.", "He doesn't likes milk."], 0, "С he используем doesn't, после него глагол без -s."),
            fill("___ you speak English?", ["Do", "Does", "Are", "Is"], 0, "С you — do."),
            mcq("Какое слово — маркер Present Simple?", ["usually", "now", "yesterday", "at the moment"], 0, "Usually — «обычно»: регулярное действие."),
            match("Соедини глагол с формой для he / she / it", [["go", "goes"], ["study", "studies"], ["watch", "watches"], ["play", "plays"]], "-es после -o, -ch; y → ies после согласной; play — просто -s (перед y гласная)."),
            tf("В Present Simple окончание -s добавляют к глаголу после I и you", false, "Окончание -s нужно только с he, she, it."),
            order("Составь предложение", ["My", "brother", "plays", "football", "on Sundays"], "Подлежащее → глагол → дополнение → время."),
            mcq("The sun ___ in the east.", ["rises", "rise", "rising", "is rise"], 0, "Факт о природе — Present Simple, the sun = it → rises."),
            pic({ kind: "emoji", value: "⏰ 🪥 😁" }, "Как сказать «Я чищу зубы каждое утро»?", ["I brush my teeth every morning.", "I am brushing my teeth every morning.", "I brushed my teeth every morning.", "I brushes my teeth every morning."], 0, "Каждое утро — регулярное действие: Present Simple."),
          ],
        },
        {
          id: "eng-present-continuous",
          title: "Present Continuous",
          grade: 5,
          minutes: 8,
          emoji: "🏃",
          goal: "Описывать действия, которые происходят прямо сейчас.",
          intro: "Look! Сейчас ты учишь английский. Чтобы так сказать, нужно время Present Continuous!",
          steps: [
            {
              title: "Действие сейчас",
              text: "Present Continuous описывает действие, которое происходит в момент речи: I am reading now. Строится так: am / is / are + глагол с окончанием -ing. Маркеры: now, at the moment, right now, Look!, Listen!",
              simple: "Present Continuous = «прямо сейчас»: am / is / are + ing.",
              visual: { type: "tense", tense: "continuous" },
            },
            {
              title: "Правописание -ing",
              text: "Обычно просто добавляем -ing: read → reading. Немая -e исчезает: make → making. Короткий глагол с одной гласной перед согласной удваивает её: swim → swimming, run → running. -ie → -ying: lie → lying.",
              simple: "make → making, run → running, lie → lying.",
            },
            {
              title: "Simple или Continuous?",
              text: "Сравни: I usually walk to school (обычно), but today I am taking a bus (сегодня, сейчас). Некоторые глаголы — like, love, know, want, understand — почти не используются в Continuous: I know the answer (не «I am knowing»).",
              simple: "Обычно — Simple, прямо сейчас — Continuous. А «знать, любить, хотеть» — всегда Simple.",
            },
          ],
          examples: [
            "Listen! My sister is singing in the kitchen. Dad is cooking plov, and I am helping him. — Слушай! Сестра поёт на кухне, папа готовит плов, а я ему помогаю.",
            "What are you doing? — I'm doing my English homework. — Что ты делаешь? — Делаю домашку по английскому.",
          ],
          check: mcq("I ___ a letter now.", ["am writing", "write", "writes", "is writing"], 0, "Now → Present Continuous, с I — am + writing."),
          summary: [
            "am / is / are + V-ing — действие прямо сейчас.",
            "Маркеры: now, at the moment, Look!, Listen!",
            "Глаголы состояния (know, like, want) — в Present Simple.",
          ],
          faq: [
            { keys: ["будущ", "планы", "завтра"], answer: "Present Continuous также говорит о планах на ближайшее будущее: I am meeting my friend tomorrow. — Завтра я встречаюсь с другом." },
            { keys: ["вопрос", "как спросить"], answer: "В вопросе am / is / are выходит вперёд: Are you listening? Is she sleeping? What are they doing?" },
          ],
          questions: [
            fill("Look! The children ___ in the park.", ["are playing", "plays", "is playing", "play"], 0, "The children = they → are playing."),
            fill("I ___ my homework now.", ["am doing", "do", "does", "is doing"], 0, "Now → am doing."),
            mcq("Как правильно пишется?", ["swimming", "swiming", "swimmming", "swimeing"], 0, "Короткий глагол swim удваивает m: swimming."),
            match("Соедини глагол с формой -ing", [["make", "making"], ["run", "running"], ["lie", "lying"], ["read", "reading"]], "Помни правила: -e исчезает, согласная удваивается, ie → y."),
            mcq("Какое выражение — маркер Present Continuous?", ["at the moment", "every day", "often", "never"], 0, "At the moment — «в данный момент»."),
            tf("«I am knowing the answer» — правильное предложение", false, "Know — глагол состояния: правильно «I know the answer»."),
            mcq("Как сказать «Она сейчас не спит»?", ["She isn't sleeping now.", "She doesn't sleep now.", "She not sleeping now.", "She aren't sleeping now."], 0, "She → is not (isn't) + sleeping."),
            order("Составь вопрос", ["What", "are", "you", "doing", "now?"], "Вопросительное слово → are → you → doing."),
            pic({ kind: "emoji", value: "👦 📖" }, "What is the boy doing?", ["He is reading a book.", "He reads a book now.", "He read a book.", "He are reading a book."], 0, "Действие на картинке происходит сейчас: is reading."),
          ],
        },
      ],
    },
    {
      id: "eng-ch2",
      title: "Past & Vocabulary",
      lessons: [
        {
          id: "eng-past-simple",
          title: "Past Simple",
          grade: 6,
          minutes: 9,
          emoji: "📅",
          goal: "Рассказывать о событиях в прошлом с правильными и неправильными глаголами.",
          intro: "What did you do yesterday? Чтобы ответить, нужно время Past Simple. Поехали!",
          steps: [
            {
              title: "Правильные глаголы",
              text: "Past Simple описывает завершённые действия в прошлом: I played football yesterday. Правильные глаголы получают окончание -ed: watch → watched, stop → stopped, study → studied. Маркеры: yesterday, last week, two days ago, in 2020.",
              simple: "Было и закончилось — Past Simple. Обычно добавляем -ed.",
              visual: { type: "tense", tense: "past" },
            },
            {
              title: "Неправильные глаголы",
              text: "Неправильные глаголы нужно запомнить: go → went, see → saw, have → had, make → made, eat → ate, buy → bought, come → came, write → wrote. Глагол to be: I / he / she / it was, we / you / they were.",
              simple: "Неправильные глаголы — «особенные», их формы учим наизусть.",
              visual: { type: "wordcards", cards: [
                { front: "go", back: "went" },
                { front: "see", back: "saw" },
                { front: "buy", back: "bought" },
                { front: "eat", back: "ate" },
              ] },
            },
            {
              title: "Отрицания и вопросы",
              text: "Используем did / didn't, и глагол возвращается в начальную форму: I didn't go to school. Did you see the film? — Yes, I did. Ошибка: «Did you saw» — так нельзя!",
              simple: "Did уже «забрал» прошлое время — глагол после него в обычной форме.",
            },
          ],
          examples: [
            "Last summer I visited my grandparents in Fergana. We ate fresh apricots and went to the mountains. — Прошлым летом я ездил к бабушке и дедушке в Фергану. Мы ели свежий урюк и ходили в горы.",
            "Did you watch the football match yesterday? — No, I didn't. I was at the library.",
          ],
          check: mcq("Past Simple от «go» —", ["went", "goed", "gone", "goes"], 0, "Go — неправильный глагол: go → went."),
          summary: [
            "Past Simple — завершённые действия в прошлом.",
            "Правильные глаголы + -ed, неправильные — особая форма.",
            "Did / didn't + глагол в начальной форме.",
          ],
          faq: [
            { keys: ["was", "were"], answer: "Was — с I, he, she, it; were — с we, you, they: I was tired. They were happy. В вопросе: Were you at home?" },
            { keys: ["произнош", "ed"], answer: "Окончание -ed читается тремя способами: [t] после глухих (watched), [d] после звонких (played) и [id] после t и d (wanted, needed)." },
          ],
          questions: [
            fill("Yesterday I ___ to the cinema.", ["went", "go", "goes", "going"], 0, "Yesterday → Past Simple, go → went."),
            match("Соедини глагол с формой прошедшего времени", [["see", "saw"], ["buy", "bought"], ["eat", "ate"], ["have", "had"]], "Это неправильные глаголы — их нужно запомнить."),
            fill("___ you watch TV last night?", ["Did", "Do", "Were", "Does"], 0, "Вопрос в Past Simple — с did."),
            mcq("Как сказать «Мы не играли в футбол вчера»?", ["We didn't play football yesterday.", "We didn't played football yesterday.", "We don't play football yesterday.", "We not played football yesterday."], 0, "После didn't — начальная форма глагола."),
            mcq("Какое выражение — маркер Past Simple?", ["two days ago", "now", "every day", "tomorrow"], 0, "Ago — «тому назад»."),
            mcq("Past Simple от «study» —", ["studied", "studyed", "studed", "studies"], 0, "Согласная + y → ied."),
            tf("В вопросе с did основной глагол стоит в начальной форме: «Did she go?»", true, "Did уже показывает прошедшее время."),
            fill("They ___ at home yesterday evening.", ["were", "was", "are", "be"], 0, "They → were."),
            order("Составь предложение", ["I", "visited", "my", "grandmother", "last", "summer"], "Подлежащее → сказуемое → дополнение → время."),
          ],
        },
        {
          id: "eng-vocab-school",
          title: "School & Family",
          grade: 5,
          minutes: 7,
          emoji: "🎒",
          goal: "Выучить слова о школе и семье и полезные фразы для урока.",
          intro: "Words, words, words! Соберём полезный словарь: школа, семья и вежливые фразы.",
          steps: [
            {
              title: "In the classroom",
              text: "pen — ручка, pencil — карандаш, ruler — линейка, rubber (eraser) — ластик, schoolbag — портфель, board — доска, desk — парта, textbook — учебник, timetable — расписание, break — перемена.",
              simple: "Начни с предметов, которые лежат у тебя на парте!",
              visual: { type: "wordcards", cards: [
                { front: "ruler", back: "линейка" },
                { front: "rubber", back: "ластик" },
                { front: "timetable", back: "расписание" },
                { front: "break", back: "перемена" },
              ] },
            },
            {
              title: "My family",
              text: "mother, father — parents (родители); brother, sister; grandmother, grandfather — grandparents; aunt — тётя, uncle — дядя, cousin — двоюродный брат или сестра. Your father's sister is your aunt.",
              simple: "Parents — мама и папа, grandparents — бабушка и дедушка.",
            },
            {
              title: "Useful phrases",
              text: "Can I come in? — Можно войти? May I ask a question? — Можно задать вопрос? I don't understand. — Я не понимаю. Could you repeat, please? — Повторите, пожалуйста. How do you say … in English? — Как сказать … по-английски?",
              simple: "Вежливые фразы помогают на любом уроке.",
            },
          ],
          examples: [
            "This is my family. My father is a doctor, my mother is a teacher. I have one brother and two cousins. My grandparents live in Bukhara.",
            "— Excuse me, teacher, may I ask a question? How do you say «kitob» in English? — It's «book».",
          ],
          check: mcq("Что значит «timetable»?", ["расписание", "стол", "часы", "перемена"], 0, "Timetable — расписание уроков."),
          summary: [
            "Школьные слова: ruler, rubber, textbook, timetable, break.",
            "Семья: parents, grandparents, aunt, uncle, cousin.",
            "Фразы: May I ask a question? Could you repeat, please?",
          ],
          faq: [
            { keys: ["eraser", "rubber"], answer: "Rubber — британский вариант слова «ластик», eraser — американский. Оба правильные!" },
            { keys: ["предмет", "subjects"], answer: "Школьные предметы: Maths, Chemistry, Physics, Biology, History, Geography, Literature, Computer Science (Informatics), PE — Physical Education (физкультура)." },
          ],
          questions: [
            match("Соедини слово с переводом", [["ruler", "линейка"], ["rubber", "ластик"], ["schoolbag", "портфель"], ["board", "доска"]], "Это предметы из любого класса."),
            mcq("Как по-английски «двоюродный брат или сестра»?", ["cousin", "nephew", "uncle", "sister"], 0, "Cousin — и для брата, и для сестры."),
            mcq("Your father's sister is your…", ["aunt", "niece", "grandmother", "cousin"], 0, "Сестра папы — тётя (aunt)."),
            fill("Can I ___ in?", ["come", "coming", "comes", "came"], 0, "После can — начальная форма глагола."),
            mcq("Как по-английски «расписание уроков»?", ["timetable", "homework", "textbook", "break"], 0, "Homework — домашнее задание, textbook — учебник, break — перемена."),
            tf("«Grandparents» — это бабушка и дедушка", true, "Grand + parents = бабушка и дедушка."),
            mcq("Как вежливо попросить разрешения задать вопрос?", ["May I ask a question?", "Give me question!", "I question you.", "Ask me now!"], 0, "May I…? — самая вежливая форма просьбы."),
            order("Составь вопрос", ["How", "do", "you", "say", "«kitob»", "in English?"], "How do you say … in English? — очень полезная фраза."),
            pic({ kind: "emoji", value: "👨‍👩‍👧‍👦" }, "Who are your parents?", ["Your mother and father", "Your brother and sister", "Your aunt and uncle", "Your cousins"], 0, "Parents — родители: мама и папа."),
          ],
        },
      ],
    },
  ],
};

export default course;
