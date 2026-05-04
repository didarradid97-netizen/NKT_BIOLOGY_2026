import { useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { isAuthenticated } from "@/lib/storage";
import { getCustomTests, saveCustomTest, deleteCustomTest, CustomTest, CustomQuestion } from "@/lib/customTestStorage";
import { useTilt } from "@/hooks/use3DEffects";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Edit3,
  Clock,
  ImagePlus,
  X,
  Check,
  Save,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
} from "lucide-react";

type Mode = "list" | "edit" | "create";

export default function TestCreator() {
  const navigate = useNavigate();
  const location = useLocation();
  const editId = (location.state as { editTestId?: string } | null)?.editTestId;
  const preloaded = editId ? getCustomTests().find((t) => t.id === editId) : null;
  
  const [mode, setMode] = useState<Mode>(preloaded ? "edit" : "list");
  const [tests, setTests] = useState<CustomTest[]>(getCustomTests());
  const [editingTest, setEditingTest] = useState<CustomTest | null>(preloaded || null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isAuthenticated()) {
    navigate("/login");
    return null;
  }

  const refresh = () => setTests(getCustomTests());

  const handleDelete = (id: string) => {
    if (confirm("Бұл тесті жойғыңыз келе ме?")) {
      deleteCustomTest(id);
      refresh();
    }
  };

  const handleDuplicate = (test: CustomTest) => {
    const copy: CustomTest = {
      ...test,
      id: "custom_" + Date.now(),
      title: test.title + " (көшірме)",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveCustomTest(copy);
    refresh();
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0]">
      <nav className="sticky top-0 z-50 bg-[#0f172a]/85 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => (mode === "list" ? navigate("/") : setMode("list"))}
            className="flex items-center gap-2 text-sm font-medium text-[#94a3b8] hover:text-[#6ee7b7] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {mode === "list" ? "Басты" : "Тесттер тізімі"}
          </button>
          <h1 className="font-bold text-lg bg-gradient-to-r from-[#34d399] to-[#3b82f6] bg-clip-text text-transparent">
            {mode === "list" ? "Өз тестіңді құру" : mode === "create" ? "Жаңа тест" : "Тест өңдеу"}
          </h1>
          {mode === "list" && (
            <button
              onClick={() => {
                setEditingTest(null);
                setMode("create");
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-sm font-semibold shadow-lg shadow-[#10b981]/20 hover:shadow-[#10b981]/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Тест құру</span>
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {mode === "list" ? (
          <TestList
            tests={tests}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            onEdit={(t) => {
              setEditingTest(t);
              setMode("edit");
            }}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onTake={(t) => navigate(`/custom-test/${t.id}`)}
          />
        ) : (
          <TestEditor
            test={editingTest}
            onSave={() => {
              refresh();
              setMode("list");
            }}
            onCancel={() => setMode("list")}
          />
        )}
      </div>
    </div>
  );
}

function TestList({
  tests,
  expandedId,
  setExpandedId,
  onEdit,
  onDelete,
  onDuplicate,
  onTake,
}: {
  tests: CustomTest[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  onEdit: (t: CustomTest) => void;
  onDelete: (id: string) => void;
  onDuplicate: (t: CustomTest) => void;
  onTake: (t: CustomTest) => void;
}) {
  if (tests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-[#475569]" />
        </div>
        <h2 className="text-lg font-semibold text-[#cbd5e1] mb-2">Тесттер жоқ</h2>
        <p className="text-sm text-[#64748b] max-w-xs">
          Өзіңіздің тақырыбыңыз бойынша тест жасаңыз. Сұрақтарды қосып, жауап нұсқаларын белгілеңіз.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tests.map((test) => {
        const isOpen = expandedId === test.id;
        return (
          <div
            key={test.id}
            className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-white/[0.14] transition-all"
          >
            <button
              onClick={() => setExpandedId(isOpen ? null : test.id)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#e2e8f0] truncate">{test.title}</h3>
                <p className="text-xs text-[#64748b] mt-0.5 truncate">{test.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-[#475569]">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {test.questions.length} сұрақ
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {test.timeLimit} мин
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#10b981]/10 text-[#6ee7b7] border border-[#10b981]/20">
                    {test.category}
                  </span>
                </div>
              </div>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-[#64748b] flex-shrink-0 ml-3" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#64748b] flex-shrink-0 ml-3" />
              )}
            </button>

            {isOpen && (
              <div className="px-4 pb-4 border-t border-white/[0.06]">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                  <button
                    onClick={() => onTake(test)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-sm font-semibold shadow-lg shadow-[#10b981]/20 active:scale-95 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    Тапсыру
                  </button>
                  <button
                    onClick={() => onEdit(test)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-[#cbd5e1] text-sm font-medium hover:bg-white/[0.10] active:scale-95 transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                    Өңдеу
                  </button>
                  <button
                    onClick={() => onDuplicate(test)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-[#cbd5e1] text-sm font-medium hover:bg-white/[0.10] active:scale-95 transition-all"
                  >
                    <Copy className="w-4 h-4" />
                    Көшірме
                  </button>
                  <button
                    onClick={() => onDelete(test.id)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/15 active:scale-95 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Жою
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TestEditor({
  test,
  onSave,
  onCancel,
}: {
  test: CustomTest | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(test?.title || "");
  const [description, setDescription] = useState(test?.description || "");
  const [category, setCategory] = useState(test?.category || "Негізгі");
  const [timeLimit, setTimeLimit] = useState(test?.timeLimit || 30);
  const [questions, setQuestions] = useState<CustomQuestion[]>(
    test?.questions || [createEmptyQuestion(0)]
  );
  const [activeQ, setActiveQ] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const fileRef = useRef<HTMLInputElement>(null);

  function createEmptyQuestion(idx: number): CustomQuestion {
    return {
      id: "q_" + Date.now() + "_" + idx,
      text: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    };
  }

  const addQuestion = () => {
    setQuestions((prev) => [...prev, createEmptyQuestion(prev.length)]);
    setActiveQ(questions.length);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    const next = questions.filter((_, i) => i !== idx);
    setQuestions(next);
    if (activeQ >= next.length) setActiveQ(next.length - 1);
  };

  const duplicateQuestion = (idx: number) => {
    const q = questions[idx];
    const copy: CustomQuestion = {
      ...q,
      id: "q_" + Date.now(),
      text: q.text + " (көшірме)",
    };
    const next = [...questions];
    next.splice(idx + 1, 0, copy);
    setQuestions(next);
    setActiveQ(idx + 1);
  };

  const updateQuestion = (idx: number, patch: Partial<CustomQuestion>) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, ...patch } : q))
    );
  };

  const handleImageUpload = (idx: number, file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert("Сурет 2МБ-дан аспауы керек");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateQuestion(idx, { image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!title.trim()) errs.push("Тест атауын жазыңыз");
    questions.forEach((q, i) => {
      if (!q.text.trim()) errs.push(`Сұрақ ${i + 1}: мәтін жоқ`);
      q.options.forEach((opt, j) => {
        if (!opt.trim()) errs.push(`Сұрақ ${i + 1}: жауап ${j + 1} бос`);
      });
    });
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload: CustomTest = {
      id: test?.id || "custom_" + Date.now(),
      title: title.trim(),
      description: description.trim(),
      category,
      timeLimit,
      questions,
      createdAt: test?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveCustomTest(payload);
    onSave();
  };

  const q = questions[activeQ];

  return (
    <div className="max-w-[800px] mx-auto space-y-4 pb-20">
      {/* Errors */}
      {errors.length > 0 && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <div className="flex items-center gap-2 font-medium mb-1">
            <AlertCircle className="w-4 h-4" />
            Қателер:
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Meta */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider">
          Тест туралы
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs text-[#64748b] mb-1">Тест атауы</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Мысалы: Клетка биологиясы"
              className="w-full bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[#10b981] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-[#64748b] mb-1">Сипаттама</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Қысқаша сипаттама"
              className="w-full bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[#10b981] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#64748b] mb-1">Санат</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm text-[#f1f5f9] outline-none focus:border-[#10b981]"
            >
              {["Негізгі", "Тереңдетілген", "Толық", "Жаңа"].map((c) => (
                <option key={c} value={c} className="bg-[#0f172a]">
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#64748b] mb-1">Уақыт шектеуі (мин)</label>
            <input
              type="number"
              min={1}
              max={180}
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="w-full bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm text-[#f1f5f9] outline-none focus:border-[#10b981]"
            />
          </div>
        </div>
      </div>

      {/* Question tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveQ(i)}
            className={`flex-shrink-0 w-10 h-10 rounded-xl text-sm font-semibold flex items-center justify-center transition-all ${
              i === activeQ
                ? "bg-gradient-to-r from-[#10b981] to-[#059669] text-white shadow-lg shadow-[#10b981]/20"
                : "bg-white/[0.04] border border-white/[0.08] text-[#64748b] hover:bg-white/[0.08]"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={addQuestion}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/[0.04] border border-dashed border-white/[0.14] text-[#64748b] hover:text-[#10b981] hover:border-[#10b981]/30 flex items-center justify-center transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Question editor */}
      {q && (
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#cbd5e1]">Сұрақ {activeQ + 1}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => duplicateQuestion(activeQ)}
                className="p-2 rounded-lg bg-white/[0.06] text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-white/[0.10] transition-all"
                title="Көшірме"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => removeQuestion(activeQ)}
                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/15 transition-all"
                title="Жою"
                disabled={questions.length <= 1}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#64748b] mb-1">Сұрақ мәтіні</label>
            <textarea
              value={q.text}
              onChange={(e) => updateQuestion(activeQ, { text: e.target.value })}
              placeholder="Сұрақты осында жазыңыз..."
              rows={3}
              className="w-full bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-3 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[#10b981] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)] resize-none"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs text-[#64748b] mb-1">Сурет (қалауынша)</label>
            {q.image ? (
              <div className="relative inline-block">
                <img
                  src={q.image}
                  alt="Сұрақ суреті"
                  className="max-h-48 rounded-xl border border-white/[0.08]"
                />
                <button
                  onClick={() => updateQuestion(activeQ, { image: undefined })}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white shadow-lg"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-dashed border-white/[0.14] text-[#64748b] hover:text-[#10b981] hover:border-[#10b981]/30 transition-all text-sm"
              >
                <ImagePlus className="w-4 h-4" />
                Сурет қосу
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(activeQ, file);
                e.target.value = "";
              }}
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="block text-xs text-[#64748b]">Жауап нұсқалары (дұрысын белгілеңіз)</label>
            {q.options.map((opt, j) => (
              <div key={j} className="flex items-center gap-3">
                <button
                  onClick={() => updateQuestion(activeQ, { correctAnswer: j })}
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                    q.correctAnswer === j
                      ? "bg-[#10b981] border-[#10b981] text-white shadow-lg shadow-[#10b981]/20"
                      : "border-white/[0.18] text-[#64748b] hover:border-[#10b981]/50"
                  }`}
                >
                  {String.fromCharCode(65 + j)}
                </button>
                <input
                  value={opt}
                  onChange={(e) => {
                    const next = [...q.options];
                    next[j] = e.target.value;
                    updateQuestion(activeQ, { options: next });
                  }}
                  placeholder={`${j + 1}-ші нұсқа`}
                  className="flex-1 bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[#10b981]"
                />
              </div>
            ))}
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-xs text-[#64748b] mb-1">Түсініктеме (қалауынша)</label>
            <textarea
              value={q.explanation}
              onChange={(e) => updateQuestion(activeQ, { explanation: e.target.value })}
              placeholder="Дұрыс жауаптың түсіндірмесі..."
              rows={2}
              className="w-full bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-3 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[#10b981] resize-none"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/[0.08] p-4 z-50">
        <div className="max-w-[800px] mx-auto flex items-center justify-between gap-3">
          <div className="text-xs text-[#64748b]">
            {questions.length} сұрақ • {timeLimit} мин
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-[#cbd5e1] text-sm font-medium hover:bg-white/[0.10] transition-all"
            >
              Болдырмау
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-sm font-semibold shadow-lg shadow-[#10b981]/20 hover:shadow-[#10b981]/30 flex items-center gap-2 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              Сақтау
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
