import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import { Search, X, Play, FileText } from "lucide-react";

interface QuestionItem {
  testId: string;
  testTitle: string;
  questionIndex: number;
  questionText: string;
  options: string[];
  correctAnswer?: number;
  explanation?: string;
}

export default function SearchQuestions() {
  const navigate = useNavigate();
  const [allQuestions, setAllQuestions] = useState<QuestionItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Барлық сұрақтарды жүктеу
  useEffect(() => {
    fetch("/tests/all-tests.json")
      .then((r) => r.json())
      .then((data) => {
        const questions: QuestionItem[] = [];
        Object.keys(data).forEach((testId) => {
          const test = data[testId];
          if (test.data && Array.isArray(test.data)) {
            test.data.forEach((q: any, idx: number) => {
              questions.push({
                testId,
                testTitle: test.title || testId,
                questionIndex: idx,
                questionText: q.q || q.question || "",
                options: q.options || [],
                correctAnswer: q.correct,
                explanation: q.explanation,
              });
            });
          }
        });
        setAllQuestions(questions);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Сұрақтарды жүктеу қатесі:", err);
        setLoading(false);
      });
  }, []);

  // Іздеу нәтижелері
  const results = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q || q.length < 2) return [];
    return allQuestions.filter((item) =>
      item.questionText.toLowerCase().includes(q)
    );
  }, [search, allQuestions]);

  // Бірдей сұрақтарды топтастыру (әртүрлі тесттерде бір сұрақ болуы мүмкін)
  const grouped = useMemo(() => {
    const map = new Map<string, QuestionItem[]>();
    results.forEach((item) => {
      const key = item.questionText;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    return Array.from(map.entries());
  }, [results]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center gap-3">
            <Search className="w-8 h-8 text-[#10b981]" />
            Сұрақтар бойынша іздеу
          </h1>
          <p className="text-white/60">
            Барлық {allQuestions.length} сұрақ ішінен іздеңіз
          </p>
        </div>

        {/* Іздеу жолы */}
        <div className="relative max-w-lg mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Сұрақ мәтіні бойынша іздеу... (мысалы: митоз, ДНҚ, фотосинтез)"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-10 py-3.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#10b981] focus:bg-white/[0.07] transition"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Нәтижелер */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-white/50">Сұрақтар жүктелуде...</span>
          </div>
        ) : search.length > 0 && search.length < 2 ? (
          <div className="text-center py-12 text-white/40">
            Іздеу үшін кемінде 2 таңба жазыңыз
          </div>
        ) : grouped.length === 0 && search.length >= 2 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-[#475569] mx-auto mb-3" />
            <p className="text-white/40">"{search}" бойынша ешқандай сұрақ табылмады</p>
            <p className="text-white/20 text-sm mt-1">Басқа сөзбен қайталаңыз</p>
          </div>
        ) : grouped.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-white/40 mb-4">
              <span className="text-[#10b981] font-semibold">{results.length}</span> сұрақ табылды ({" "}
              <span className="text-[#10b981] font-semibold">{grouped.length}</span> әртүрлі)
            </p>

            {grouped.map(([text, occurrences]) => (
              <div
                key={text}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/15 transition"
              >
                {/* Сұрақ мәтіні */}
                <p className="text-white font-medium mb-4 leading-relaxed text-base">
                  {occurrences[0].questionIndex + 1}. {text}
                </p>

                {/* Жауап нұсқалары */}
                {occurrences[0].options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {occurrences[0].options.map((opt: string, i: number) => (
                      <div
                        key={i}
                        className={`px-3 py-2 rounded-lg text-sm ${
                          i === occurrences[0].correctAnswer
                            ? "bg-[#10b981]/10 text-[#6ee7b7] border border-[#10b981]/30"
                            : "bg-white/[0.03] text-white/50 border border-white/[0.06]"
                        }`}
                      >
                        <span className="font-bold mr-2">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        {opt}
                      </div>
                    ))}
                  </div>
                )}

                {/* Түсініктеме */}
                {occurrences[0].explanation && (
                  <p className="text-xs text-[#64748b] bg-white/[0.03] rounded-lg p-3 mb-4">
                    <span className="text-[#a855f7] font-medium">Түсініктеме:</span>{" "}
                    {occurrences[0].explanation}
                  </p>
                )}

                {/* Тесттерге өту батырмалары */}
                <div className="flex flex-wrap gap-2">
                  {occurrences.map((occ) => (
                    <button
                      key={occ.testId}
                      onClick={() => navigate(`/test/${occ.testId}`)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 text-[#6ee7b7] text-xs font-medium hover:bg-[#10b981]/15 transition active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5" />
                      {occ.testTitle}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
