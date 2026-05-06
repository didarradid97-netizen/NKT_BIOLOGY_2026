// ============================================
// 📋 СИЛЛАБУС (OQU BAG'DARLAMASY) — localStorage
// ============================================
export interface Literature {
  id: string;
  type: "main" | "additional" | "internet";
  title: string;
  author: string;
  year: string;
  medium: "textbook" | "teaching Aid" | "digital" | "other";
  note?: string;
}

export interface SyllabusTopic {
  id: string;
  module: number;
  moduleName: string;
  topicName: string;
  hours: number;
  content: string;
  literatureIds: string[];
  homework?: string;
}

export interface CourseSyllabus {
  id: string;
  title: string;
  subject: string;
  course: string;
  credits: number;
  totalHours: number;
  lectures: number;
  practice: number;
  selfStudy: number;
  semester: string;
  language: "kk" | "ru";
  goals: string;
  outcomes: string[];
  topics: SyllabusTopic[];
  literature: Literature[];
  examTopics: string[];
  updatedAt: string;
}

const STORAGE_KEY = "nkt_syllabus";
const DEFAULT_SYLLABUS: CourseSyllabus = {
  id: "bio_ozp_2026",
  title: "Биология (ОЗП дайындығы)",
  subject: "Биология",
  course: "11 сынып / ҰБТ-ОЗП",
  credits: 3,
  totalHours: 136,
  lectures: 72,
  practice: 40,
  selfStudy: 24,
  semester: "2025-2026 оқу жылы",
  language: "kk",
  goals:
    "ОЗП/ҰБТ биология пәніне толық дайындық. Оқушылардың биологиялық түсініктерін қалыптастыру, тест тапсыру дағдыларын дамыту.",
  outcomes: [
    "Жасуша құрылысы мен функцияларын түсіндіреді",
    "Генетикалық заңдылықтарды қолданады",
    "Эволюциялық процестерді сипаттайды",
    "Экологиялық заңдылықтарды түсінеді",
    "Адам анатомиясы мен физиологиясын біледі",
  ],
  literature: [
    {
      id: "lit_1",
      type: "main",
      title: "Биология. Жалпы биология (ОЗП дайындығы)",
      author: "Б.И. Садвакасов, А.С. Бектұров",
      year: "2024",
      medium: "textbook",
      note: "11 сынып оқулығы",
    },
    {
      id: "lit_2",
      type: "main",
      title: "Биология. Адам және оның денсаулығы",
      author: "А.Т. Қасымжанов",
      year: "2024",
      medium: "textbook",
      note: "11 сынып оқулығы",
    },
    {
      id: "lit_3",
      type: "additional",
      title: "ОЗП биология: тест тапсырмалары жинағы",
      author: "Ұлттық тестілеу орталығы",
      year: "2025",
      medium: "teaching Aid",
      note: "Ресми тест жинағы",
    },
    {
      id: "lit_4",
      type: "additional",
      title: "Биология. Тақырыптық тесттер",
      author: "NKT BIOLOGY платформасы",
      year: "2026",
      medium: "digital",
      note: "Онлайн тесттер",
    },
    {
      id: "lit_5",
      type: "internet",
      title: "Khan Academy Biology (қазақ тілінде)",
      author: "Khan Academy",
      year: "2025",
      medium: "digital",
      note: "https://kk.khanacademy.org/science/biology",
    },
    {
      id: "lit_6",
      type: "internet",
      title: "NKT BIOLOGY платформасы",
      author: "NKT BIOLOGY",
      year: "2026",
      medium: "digital",
      note: "https://nkt-biology-2026.vercel.app",
    },
  ],
  topics: [
    // Модуль 1: Жасуша биологиясы
    {
      id: "t1",
      module: 1,
      moduleName: "Модуль 1: Жасуша биологиясы",
      topicName: "Тірі ағзалардың құрылымдық деңгейлері",
      hours: 4,
      content:
        "Биология пәнінің пәні. Тірі ағзалардың құрылымдық деңгейлері: молекулалық, жасушалық, ткань, органдар, организмдік, популяциялық, экожүйелік, биосфералық. Әр деңгейге мысалдар.",
      literatureIds: ["lit_1", "lit_4"],
      homework: "Деңгейлерді сызба түрінде түсіріңіз",
    },
    {
      id: "t2",
      module: 1,
      moduleName: "Модуль 1: Жасуша биологиясы",
      topicName: "Прокариоттық және эукариоттық жасушалар",
      hours: 6,
      content:
        "Прокариоттар: құрылымы, нуклеоид, рибосома (70S), плазмида, капсула, жабын. Эукариоттар: ядро, митохондрия, хлоропласт, Гольджи аппараты, ЭПТ, лизосома, вакуоль, цитоскелет, рибосома (80S). Салыстыру кестесі.",
      literatureIds: ["lit_1", "lit_5"],
      homework: "Прокариот vs Эукариот кестесі",
    },
    {
      id: "t3",
      module: 1,
      moduleName: "Модуль 1: Жасуша биологиясы",
      topicName: "Жасуша мембранасы және зат алмасу",
      hours: 6,
      content:
        "Мембрана құрылымы: фосфолипидтік қос қабат, ақуыздар, холестерин, гликокаликс. Өткізгіштік: жай диффузия, жеңілдетілген диффузия, активтік тасымал, эндо/экзоцитоз. Осмос, тургор.",
      literatureIds: ["lit_1", "lit_3"],
      homework: "Диффузия типтерін сызба түрінде көрсету",
    },
    {
      id: "t4",
      module: 1,
      moduleName: "Модуль 1: Жасуша биологиясы",
      topicName: "Эндоплазмалық тор, Гольджи аппараты, лизосома",
      hours: 4,
      content:
        "ЭПТ: тегіс және дәнекерлі бөліктер. Ақуыз синтезі және тасымалдау. Гольджи аппараты: өңдеу, сорттау, пакеттеу. Лизосома: ферменттер, автолиз, фагоцитоз.",
      literatureIds: ["lit_1"],
      homework: "ЭПТ → Гольджи → везикула тізбегін сызу",
    },
    {
      id: "t5",
      module: 1,
      moduleName: "Модуль 1: Жасуша биологиясы",
      topicName: "Митохондрия және энергетикалық алмасу",
      hours: 6,
      content:
        "Митохондрия құрылымы: сыртқы/ішкі мембрана, матрикс, кристалдар. Тыныс алу: гликолиз → Кребс циклі → тотығу фосфорлануы. АТФ синтезі. Анаэробты тыныс алу: ашу, молочная қышқылды брожение.",
      literatureIds: ["lit_1", "lit_3", "lit_5"],
      homework: "Тыныс алу фазаларын және АТФ түзілуін сызу",
    },
    {
      id: "t6",
      module: 1,
      moduleName: "Модуль 1: Жасуша биологиясы",
      topicName: "Хлоропласт және фотосинтез",
      hours: 6,
      content:
        "Хлоропласт құрылымы: тиллакоид, грана, строма. Фотосинтез формуласы. Жарық реакциялары: фотожүйе I/II, электрон тасымалдау тізбегі, АТФ және NADPH түзілуі. Кальвин циклі: CO₂ бекіту, глюкоза түзілуі. C3, C4, CAM өсімдіктер.",
      literatureIds: ["lit_1", "lit_3"],
      homework: "Жарық және қараңғы реакциялар салыстыру кестесі",
    },
    // Модуль 2: Генетика
    {
      id: "t7",
      module: 2,
      moduleName: "Модуль 2: Генетика",
      topicName: "ДНҚ құрылымы және репликациясы",
      hours: 6,
      content:
        "ДНҚ құрылымы: нуклеотид, азотты негіздер (A-T, G-C), қант (дезоксирибоза), фосфат. Двойная спираль. Репликация: S-фаза, полимераза, басқарушы және кешіктірілген тізбектер, Оказаки фрагменттері, теломераза.",
      literatureIds: ["lit_1", "lit_3", "lit_5"],
      homework: "Репликация сызбасын түсіру",
    },
    {
      id: "t8",
      module: 2,
      moduleName: "Модуль 2: Генетика",
      topicName: "РНҚ, транскрипция және трансляция",
      hours: 6,
      content:
        "РНҚ түрлері: иРНҚ, тРНҚ, рРНҚ. Транскрипция: полимераза, промотор, TATA-бокс, терминация. РНҚ процессинг: кэп, поли(А) құйрығы, сплайсинг. Трансляция: инициация, элонгация, терминация, рибосома, тРНҚ.",
      literatureIds: ["lit_1", "lit_3"],
      homework: "Транскрипция vs трансляция кестесі",
    },
    {
      id: "t9",
      module: 2,
      moduleName: "Модуль 2: Генетика",
      topicName: "Мендель заңдары",
      hours: 6,
      content:
        "1 заң: гомозиготалы × гомозиготалы → F1 (гетерозигота), F2 (3:1). 2 заң: еркін комбинациялану, диңгибридті шағылыстыру (9:3:3:1). 3 заң: тізбекті доминанталық. Толық, жартылай, кодоминанталық. Тест есептері.",
      literatureIds: ["lit_1", "lit_3"],
      homework: "Екігендік шағылыстыру есептерін шешу (5 есеп)",
    },
    {
      id: "t10",
      module: 2,
      moduleName: "Модуль 2: Генетика",
      topicName: "Митоз және мейоз",
      hours: 6,
      content:
        "Митоз: профаза, метафаза, анафаза, телофаза. 2n→2n. Мейоз: I (редукциялық) және II (екінші бөліну). Кроссинговер. Гаметалар түзілуі. 2n→n. Сперматогенез және оогенез.",
      literatureIds: ["lit_1", "lit_3", "lit_4"],
      homework: "Митоз vs мейоз салыстыру кестесі",
    },
    {
      id: "t11",
      module: 2,
      moduleName: "Модуль 2: Генетика",
      topicName: "Мутациялар және гендік инженерия",
      hours: 4,
      content:
        "Мутациялар: гендік (нүктелік), хромосомалық, геномдық. Мутагендер. Гендік инженерия: рестрикция ферменттері, векторлар (плазмида), трансформация. ПЦР. CRISPR-Cas9.",
      literatureIds: ["lit_1", "lit_3", "lit_5"],
      homework: "ПЦР принципін түсіндіру",
    },
    // Модуль 3: Эволюция
    {
      id: "t12",
      module: 3,
      moduleName: "Модуль 3: Эволюция",
      topicName: "Эволюция туралы ілімдер",
      hours: 4,
      content:
        "Ламарктизм: пайдалану/пайдаланбау, мұралану. Дарвинизм: өзгергіштік, өзірек күрес, табиғи сұрыпталу. Нео-дарвинизм: популяциялық генетика, Харди-Вайнберг заңы.",
      literatureIds: ["lit_1"],
      homework: "Ламарк vs Дарвин салыстыру",
    },
    {
      id: "t13",
      module: 3,
      moduleName: "Модуль 3: Эволюция",
      topicName: "Түр түзу және табиғи сұрыпталу",
      hours: 4,
      content:
        "Түр түзу факторлары: мутация, гендік айырбас, табиғи сұрыпталу, изоляция. Табиғи сұрыпталу түрлері: тұрақтылықты сақтау, бағытты, бөліну. Симпатриялық және аллопатриялық түр түзу.",
      literatureIds: ["lit_1", "lit_3"],
      homework: "Табиғи сұрыпталу типтерін мысалмен түсіндіру",
    },
    {
      id: "t14",
      module: 3,
      moduleName: "Модуль 3: Эволюция",
      topicName: "Адам эволюциясы",
      hours: 4,
      content:
        "Гоминида: Homo habilis, Homo erectus, Homo neanderthalensis, Homo sapiens. Бипедализм, ми көлемінің ұлғаюы, құрал жасау, тіл, мәдениет.",
      literatureIds: ["lit_1", "lit_5"],
      homework: "Адам эволюциясы сызбасын түсіру",
    },
    // Модуль 4: Экология
    {
      id: "t15",
      module: 4,
      moduleName: "Модуль 4: Экология",
      topicName: "Экожүйелер және трофикалық байланыстар",
      hours: 6,
      content:
        "Экожүйе: өндірушілер, тұтынушылар, ыдыратқыштар. Азықтық тізбек және тор. Трофикалық деңгейлер. Энергия ағыны: 10% заңы (Линдеман). Биопродукция.",
      literatureIds: ["lit_1", "lit_3"],
      homework: "Азықтық тізбек мысалын құру (5 буын)",
    },
    {
      id: "t16",
      module: 4,
      moduleName: "Модуль 4: Экология",
      topicName: "Тірі ағзалардың өзара әрекеттесуі",
      hours: 4,
      content:
        "Симбиоз: мутуализм, комменсализм, паразитизм. Бәсекелестік. Хищник-жертва қатынасы. Популяция, биогеоценоз, биосфера.",
      literatureIds: ["lit_1"],
      homework: "Симбиоз типтерін мысалмен түсіндіру",
    },
    {
      id: "t17",
      module: 4,
      moduleName: "Модуль 4: Экология",
      topicName: "Биологиялық әртүрлілік және қорғау",
      hours: 4,
      content:
        "Түрлік, гендік, экожүйелік әртүрлілік. Қызыл кітап. Қорғалатын аймақтар: қорық, ұлттық парк, заказник. Халықаралық конвенциялар.",
      literatureIds: ["lit_1", "lit_5"],
      homework: "Қазақстандағы қорықтар тізімі",
    },
    // Модуль 5: Адам және оның денсаулығы
    {
      id: "t18",
      module: 5,
      moduleName: "Модуль 5: Адам және оның денсаулығы",
      topicName: "Адам нерв жүйесі",
      hours: 6,
      content:
        "Нейрон құрылымы: дендрит, дене, аксон, синапс. Ми бөліктері: сопақша, көпір, мишық, аралық, мишық, ми қыртысы. Рефлекстер: шартты, шартсыз. Анализаторлар: көз, құлақ.",
      literatureIds: ["lit_2", "lit_3"],
      homework: "Рефлекстік доғаны сызу",
    },
    {
      id: "t19",
      module: 5,
      moduleName: "Модуль 5: Адам және оның денсаулығы",
      topicName: "Қанайналым және тыныс алу жүйелері",
      hours: 6,
      content:
        "Жүрек құрылымы: 4 камера, қапқалар. Қанайналым шеңберлері: кішкентай және үлкен. Қан: плазма, эритроцит, лейкоцит, тромбоцит. Тыныс алу: мұрын, гортань, трахея, бронх, альвеол.",
      literatureIds: ["lit_2", "lit_3"],
      homework: "Үлкен және кішен қанайналым шеңберлерін сызу",
    },
    {
      id: "t20",
      module: 5,
      moduleName: "Модуль 5: Адам және оның денсаулығы",
      topicName: "Ас қорыту және эндокриндік жүйе",
      hours: 4,
      content:
        "Ас қорыту: ауыз, асқазан, ұлтабар, ішек. Ферменттер: амилаза, пепсин, трипсин, липаза. Эндокрин бездері: қалқанша, бүйрек үсті, үнжыбар (инсулин, глюкагон). Гормондар.",
      literatureIds: ["lit_2", "lit_3"],
      homework: "Эндокрин бездері мен гормондары кестесі",
    },
    {
      id: "t21",
      module: 5,
      moduleName: "Модуль 5: Адам және оның денсаулығы",
      topicName: "Иммундық жүйе және денсаулық",
      hours: 4,
      content:
        "Иммунитет: табиғи және жүректі. B- және T-лимфоциттер. Антиденелер. Вакцинация. АІТВ, СПИД. Денсаулық сақтау.",
      literatureIds: ["lit_2", "lit_3", "lit_5"],
      homework: "Вакцинация принципін түсіндіру",
    },
    {
      id: "t22",
      module: 5,
      moduleName: "Модуль 5: Адам және оның денсаулығы",
      topicName: "Адам генетикасы және мұралану",
      hours: 4,
      content:
        "Хромосомалық ауытқулар: Даун синдромы (21-трісомия), Тернер, Клайнфельтер. Тұқым қуалайтын аурулар: гемофилия, дальтонизм. Гендік кеңес беру.",
      literatureIds: ["lit_2", "lit_3"],
      homework: "Трісомияларды салыстыру кестесі",
    },
  ],
  examTopics: [
    "Жасуша құрылысы мен функциялары",
    "Генетикалық материал және оның көбейтуі",
    "Мендель заңдары және есептер",
    "Митоз, мейоз және гаметогенез",
    "Эволюциялық процестер",
    "Экожүйелер және трофикалық байланыстар",
    "Адам анатомиясы және физиологиясы",
    "Иммунитет және денсаулық",
  ],
  updatedAt: new Date().toISOString(),
};

export function getSyllabus(): CourseSyllabus {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CourseSyllabus;
      return { ...DEFAULT_SYLLABUS, ...parsed, id: DEFAULT_SYLLABUS.id };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SYLLABUS;
}

export function saveSyllabus(syllabus: CourseSyllabus): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(syllabus));
}

export function addLiterature(syllabus: CourseSyllabus, lit: Omit<Literature, "id">): CourseSyllabus {
  const newLit: Literature = {
    ...lit,
    id: "lit_" + Date.now(),
  };
  const updated = { ...syllabus, literature: [...syllabus.literature, newLit] };
  saveSyllabus(updated);
  return updated;
}

export function removeLiterature(syllabus: CourseSyllabus, litId: string): CourseSyllabus {
  const updated = {
    ...syllabus,
    literature: syllabus.literature.filter((l) => l.id !== litId),
    topics: syllabus.topics.map((t) => ({
      ...t,
      literatureIds: t.literatureIds.filter((id) => id !== litId),
    })),
  };
  saveSyllabus(updated);
  return updated;
}

export function getLiteratureById(syllabus: CourseSyllabus, id: string): Literature | undefined {
  return syllabus.literature.find((l) => l.id === id);
}

export function resetToDefault(): CourseSyllabus {
  saveSyllabus(DEFAULT_SYLLABUS);
  return DEFAULT_SYLLABUS;
}
