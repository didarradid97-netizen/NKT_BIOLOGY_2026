// ============================================
// 📋 СИЛЛАБУС БЕТІ (Smart ENU стилінде)
// ============================================
import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import {
  getSyllabus,
  saveSyllabus,
  addLiterature,
  removeLiterature,
  getLiteratureById,
  resetToDefault,
  type CourseSyllabus,
  type Literature,
} from "@/lib/syllabusStorage";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  GraduationCap,
  FileText,
  Plus,
  Trash2,
  Globe,
  Monitor,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Library,
  Target,
  CheckCircle2,
  Search,
} from "lucide-react";

type Tab = "overview" | "topics" | "literature" | "exam";

export default function SyllabusPage() {
  const navigate = useNavigate();
  const [syllabus, setSyllabus] = useState<CourseSyllabus>(getSyllabus);
  const [tab, setTab] = useState<Tab>("overview");
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([1]));
  const [search, setSearch] = useState("");

  // Әдебиет формасы
  const [showLitForm, setShowLitForm] = useState(false);
  const [litTitle, setLitTitle] = useState("");
  const [litAuthor, setLitAuthor] = useState("");
  const [litYear, setLitYear] = useState("");
  const [litType, setLitType] = useState<Literature["type"]>("main");
  const [litMedium, setLitMedium] = useState<Literature["medium"]>("textbook");
  const [litNote, setLitNote] = useState("");

  const modules = useMemo(() => {
    const map = new Map<number, typeof syllabus.topics>();
    for (const t of syllabus.topics) {
      if (!map.has(t.module)) map.set(t.module, []);
      map.get(t.module)!.push(t);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [syllabus]);

  const filteredTopics = useMemo(() => {
    if (!search.trim()) return syllabus.topics;
    const s = search.toLowerCase();
    return syllabus.topics.filter(
      (t) =>
        t.topicName.toLowerCase().includes(s) ||
        t.content.toLowerCase().includes(s) ||
        t.moduleName.toLowerCase().includes(s)
    );
  }, [syllabus, search]);

  const toggleModule = (m: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });
  };

  const handleAddLiterature = () => {
    if (!litTitle.trim()) return;
    const updated = addLiterature(syllabus, {
      type: litType,
      title: litTitle.trim(),
      author: litAuthor.trim() || "Белгісіз",
      year: litYear.trim() || "2026",
      medium: litMedium,
      note: litNote.trim() || undefined,
    });
    setSyllabus(updated);
    setLitTitle("");
    setLitAuthor("");
    setLitYear("");
    setLitNote("");
    setShowLitForm(false);
  };

  const handleRemoveLiterature = (id: string) => {
    if (!confirm("Әдебиетті өшіру керек пе?")) return;
    const updated = removeLiterature(syllabus, id);
    setSyllabus(updated);
  };

  const handleReset = () => {
    if (!confirm("Барлығын бастапқы қалпына келтіру керек пе? Барлық өзгертулер жойылады!")) return;
    setSyllabus(resetToDefault());
  };

  const litCounts = useMemo(() => {
    return {
      main: syllabus.literature.filter((l) => l.type === "main").length,
      additional: syllabus.literature.filter((l) => l.type === "additional").length,
      internet: syllabus.literature.filter((l) => l.type === "internet").length,
    };
  }, [syllabus]);

  const mediumIcon = (m: Literature["medium"]) => {
    switch (m) {
      case "textbook":
        return <BookOpen className="w-4 h-4" />;
      case "teaching Aid":
        return <FileText className="w-4 h-4" />;
      case "digital":
        return <Monitor className="w-4 h-4" />;
      default:
        return <Library className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0]">
      <Navbar />

      {/* Header */}
      <div className="max-w-[1200px] mx-auto px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-xl bg-white/[0.06] text-[#94a3b8] hover:text-[#e2e8f0] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#10b981] to-[#3b82f6] bg-clip-text text-transparent flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-[#10b981]" />
              Силлабус
            </h1>
            <p className="text-sm text-[#94a3b8]">{syllabus.title}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-white/[0.06] text-[#94a3b8] hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Бастапқы қалпына келтіру"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl w-fit">
          {[
            { key: "overview" as Tab, label: "Шолу", icon: Target },
            { key: "topics" as Tab, label: "Тақырыптар", icon: BookOpen },
            { key: "literature" as Tab, label: `Әдебиеттер (${syllabus.literature.length})`, icon: Library },
            { key: "exam" as Tab, label: "Емтихан", icon: CheckCircle2 },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-[#10b981]/15 text-[#6ee7b7] border border-[#10b981]/25"
                  : "text-[#64748b] hover:text-[#cbd5e1]"
              }`}
            >
              <t.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 pb-20">
        {/* ========== SHOLU ========== */}
        {tab === "overview" && (
          <div className="space-y-5">
            {/* Info cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Кредит", value: syllabus.credits, icon: GraduationCap },
                { label: "Барлығы сағат", value: syllabus.totalHours, icon: Clock },
                { label: "Лекция", value: syllabus.lectures, icon: BookOpen },
                { label: "Практика", value: syllabus.practice, icon: Target },
              ].map((c) => (
                <div key={c.label} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 text-center">
                  <c.icon className="w-5 h-5 text-[#10b981] mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{c.value}</div>
                  <div className="text-xs text-[#94a3b8]">{c.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
                <h3 className="font-bold text-[#e2e8f0] mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#10b981]" />
                  Курстың мақсаты
                </h3>
                <p className="text-sm text-[#94a3b8] leading-relaxed">{syllabus.goals}</p>
              </div>
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
                <h3 className="font-bold text-[#e2e8f0] mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3b82f6]" />
                  Күтілетін нәтижелер
                </h3>
                <ul className="space-y-2">
                  {syllabus.outcomes.map((o, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#94a3b8]">
                      <span className="w-5 h-5 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modules summary */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
              <h3 className="font-bold text-[#e2e8f0] mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#10b981]" />
                Модульдер тізімі ({modules.length} модуль, {syllabus.topics.length} тақырып)
              </h3>
              <div className="space-y-2">
                {modules.map(([modNum, topics]) => (
                  <div
                    key={modNum}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] cursor-pointer transition-all"
                    onClick={() => {
                      setTab("topics");
                      toggleModule(modNum);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 text-[#10b981] font-bold flex items-center justify-center text-sm">
                        {modNum}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#e2e8f0]">{topics[0]?.moduleName.replace(/Модуль \d+: /, "")}</div>
                        <div className="text-xs text-[#64748b]">{topics.length} тақырып • {topics.reduce((s, t) => s + t.hours, 0)} сағат</div>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[#475569]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== TOPICS ========== */}
        {tab === "topics" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Тақырып немесе модуль бойынша іздеу..."
                  className="w-full bg-white/[0.05] border border-white/[0.12] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[#10b981]"
                />
              </div>
              <span className="text-xs text-[#64748b]">{filteredTopics.length} тақырып</span>
            </div>

            {modules.map(([modNum, topics]) => {
              const modFiltered = topics.filter((t) => filteredTopics.includes(t));
              if (modFiltered.length === 0) return null;
              const expanded = expandedModules.has(modNum);

              return (
                <div key={modNum} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
                  <button
                    onClick={() => toggleModule(modNum)}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-white font-bold text-sm">
                        {modNum}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-[#e2e8f0] text-sm">
                          {topics[0]?.moduleName.replace(/Модуль \d+: /, "")}
                        </div>
                        <div className="text-xs text-[#64748b]">
                          {modFiltered.length} тақырып • {modFiltered.reduce((s, t) => s + t.hours, 0)} сағат
                        </div>
                      </div>
                    </div>
                    {expanded ? (
                      <ChevronUp className="w-4 h-4 text-[#475569]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#475569]" />
                    )}
                  </button>

                  {expanded && (
                    <div className="border-t border-white/[0.06]">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-[#64748b] text-xs border-b border-white/[0.06]">
                              <th className="text-left px-4 py-3 font-medium w-12">№</th>
                              <th className="text-left px-4 py-3 font-medium">Тақырып</th>
                              <th className="text-left px-4 py-3 font-medium w-20">Сағат</th>
                              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Мазмұны</th>
                              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell w-48">Әдебиет</th>
                            </tr>
                          </thead>
                          <tbody>
                            {modFiltered.map((topic, idx) => (
                              <tr
                                key={topic.id}
                                className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                              >
                                <td className="px-4 py-3 text-[#94a3b8]">{idx + 1}</td>
                                <td className="px-4 py-3">
                                  <div className="font-medium text-[#e2e8f0]">{topic.topicName}</div>
                                  {topic.homework && (
                                    <div className="text-xs text-amber-400/80 mt-1">📋 {topic.homework}</div>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-1 rounded-lg bg-[#10b981]/10 text-[#6ee7b7] text-xs font-medium">
                                    {topic.hours} с
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-[#94a3b8] hidden sm:table-cell max-w-xs">
                                  <p className="line-clamp-2">{topic.content}</p>
                                </td>
                                <td className="px-4 py-3 hidden lg:table-cell">
                                  <div className="flex flex-wrap gap-1">
                                    {topic.literatureIds.slice(0, 2).map((lid) => {
                                      const lit = getLiteratureById(syllabus, lid);
                                      return lit ? (
                                        <span
                                          key={lid}
                                          className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[#64748b] text-[10px]"
                                          title={lit.title}
                                        >
                                          {lit.author.split(" ")[0]}
                                        </span>
                                      ) : null;
                                    })}
                                    {topic.literatureIds.length > 2 && (
                                      <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[#64748b] text-[10px]">
                                        +{topic.literatureIds.length - 2}
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ========== LITERATURE ========== */}
        {tab === "literature" && (
          <div className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Негізгі", count: litCounts.main, color: "bg-[#10b981]/10 text-[#6ee7b7]" },
                { label: "Қосымша", count: litCounts.additional, color: "bg-[#3b82f6]/10 text-[#60a5fa]" },
                { label: "Интернет", count: litCounts.internet, color: "bg-[#a855f7]/10 text-[#c084fc]" },
              ].map((s) => (
                <div key={s.label} className={`${s.color} border border-white/[0.08] rounded-2xl p-4 text-center`}>
                  <div className="text-2xl font-bold">{s.count}</div>
                  <div className="text-xs mt-1 opacity-80">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Add button */}
            <button
              onClick={() => setShowLitForm(!showLitForm)}
              className="w-full py-3 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 text-[#6ee7b7] font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#10b981]/15 transition-all"
            >
              <Plus className="w-4 h-4" />
              Әдебиет қосу
            </button>

            {/* Form */}
            {showLitForm && (
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-[#e2e8f0]">Жаңа әдебиет</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#64748b] mb-1">Тақырып *</label>
                    <input
                      value={litTitle}
                      onChange={(e) => setLitTitle(e.target.value)}
                      placeholder="Кітап атауы"
                      className="w-full bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[#10b981]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#64748b] mb-1">Автор</label>
                    <input
                      value={litAuthor}
                      onChange={(e) => setLitAuthor(e.target.value)}
                      placeholder="Автор аты-жөні"
                      className="w-full bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[#10b981]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#64748b] mb-1">Жылы</label>
                    <input
                      value={litYear}
                      onChange={(e) => setLitYear(e.target.value)}
                      placeholder="2024"
                      className="w-full bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[#10b981]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#64748b] mb-1">Тип</label>
                    <select
                      value={litType}
                      onChange={(e) => setLitType(e.target.value as Literature["type"])}
                      className="w-full bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm text-[#f1f5f9] outline-none focus:border-[#10b981]"
                    >
                      <option value="main" className="bg-[#0f172a]">Негізгі</option>
                      <option value="additional" className="bg-[#0f172a]">Қосымша</option>
                      <option value="internet" className="bg-[#0f172a]">Интернет</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#64748b] mb-1">Сақтау құралы</label>
                    <select
                      value={litMedium}
                      onChange={(e) => setLitMedium(e.target.value as Literature["medium"])}
                      className="w-full bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm text-[#f1f5f9] outline-none focus:border-[#10b981]"
                    >
                      <option value="textbook" className="bg-[#0f172a]">Оқулық</option>
                      <option value="teaching Aid" className="bg-[#0f172a]">Оқу құралы</option>
                      <option value="digital" className="bg-[#0f172a]">Электронды</option>
                      <option value="other" className="bg-[#0f172a]">Басқа</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#64748b] mb-1">Ескерту</label>
                    <input
                      value={litNote}
                      onChange={(e) => setLitNote(e.target.value)}
                      placeholder="Қосымша ақпарат"
                      className="w-full bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[#10b981]"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddLiterature}
                    disabled={!litTitle.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-medium text-sm flex items-center gap-2 disabled:opacity-40 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Сақтау
                  </button>
                  <button
                    onClick={() => setShowLitForm(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.06] text-[#94a3b8] text-sm hover:bg-white/[0.10] transition-all"
                  >
                    Болдырмау
                  </button>
                </div>
              </div>
            )}

            {/* List by type */}
            {(["main", "additional", "internet"] as const).map((type) => {
              const items = syllabus.literature.filter((l) => l.type === type);
              if (items.length === 0) return null;
              return (
                <div key={type}>
                  <h3 className="text-sm font-bold text-[#94a3b8] uppercase tracking-wider mb-3">
                    {type === "main" ? "📗 Негізгі әдебиет" : type === "additional" ? "📘 Қосымша әдебиет" : "🌐 Интернет ресурстар"}
                  </h3>
                  <div className="space-y-2">
                    {items.map((lit) => (
                      <div
                        key={lit.id}
                        className="flex items-start gap-3 bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.06] transition-all"
                      >
                        <div className="w-9 h-9 rounded-lg bg-[#10b981]/10 text-[#10b981] flex items-center justify-center flex-shrink-0">
                          {mediumIcon(lit.medium)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[#e2e8f0] text-sm">{lit.title}</div>
                          <div className="text-xs text-[#94a3b8] mt-0.5">
                            {lit.author} • {lit.year}
                          </div>
                          {lit.note && <div className="text-xs text-[#64748b] mt-1">{lit.note}</div>}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[#64748b] text-[10px] font-medium">
                              {lit.medium === "textbook"
                                ? "Оқулық"
                                : lit.medium === "teaching Aid"
                                  ? "Оқу құралы"
                                  : lit.medium === "digital"
                                    ? "Электронды"
                                    : "Басқа"}
                            </span>
                            {lit.type === "internet" && (
                              <a
                                href={lit.note?.startsWith("http") ? lit.note : "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#3b82f6] hover:text-[#60a5fa] text-xs flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Ашу
                              </a>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveLiterature(lit.id)}
                          className="p-1.5 rounded-lg text-[#475569] hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                          title="Өшіру"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========== EXAM ========== */}
        {tab === "exam" && (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-[#10b981]/10 to-[#3b82f6]/10 border border-[#10b981]/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[#e2e8f0] mb-2 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#10b981]" />
                ОЗП/ҰБТ биологиясы бойынша емтихан тақырыптары
              </h3>
              <p className="text-sm text-[#94a3b8]">
                Бұл тақырыптар ОЗП-да міндетті түрде кездеседі. Әр тақырып бойынша тест тапсырып, қателерді талдау — ең тиімді дайындық.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {syllabus.examTopics.map((topic, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.06] transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#3b82f6] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#e2e8f0] text-sm">{topic}</div>
                  </div>
                  <button
                    onClick={() => {
                      setSearch(topic);
                      setTab("topics");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#10b981]/10 text-[#6ee7b7] text-xs font-medium hover:bg-[#10b981]/15 transition-all"
                  >
                    Тақырыпты табу
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
              <h3 className="font-bold text-[#e2e8f0] mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#f59e0b]" />
                Нақты кеңес
              </h3>
              <div className="space-y-2 text-sm text-[#94a3b8]">
                <p>1️⃣ Әр тақырыпты рет-ретімен оқыңыз</p>
                <p>2️⃣ Оқу біткен соң тест тапсырыңыз (мін. 20 сұрақ)</p>
                <p>3️⃣ Қате жіберген сұрақтарды белгілеп алыңыз</p>
                <p>4️⃣ AI Жаттықтырушыға сұрап, түсініктеме алыңыз</p>
                <p>5️⃣ Геймификациямен прогрессіңізді бақылаңыз</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
