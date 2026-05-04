import { useState } from "react";
import { useNavigate } from "react-router";
import { isAuthenticated } from "@/lib/storage";
import { getCustomTests, deleteCustomTest, saveCustomTest, CustomTest } from "@/lib/customTestStorage";
import { JsonImportExport } from "@/components/JsonParser";
import {
  ArrowLeft,
  Play,
  Edit3,
  Copy,
  Trash2,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Sparkles,
  PenLine,
  Download,
  Upload,
} from "lucide-react";

export default function MyTests() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<CustomTest[]>(getCustomTests());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);

  if (!isAuthenticated()) {
    navigate("/login");
    return null;
  }

  const refresh = () => setTests(getCustomTests());

  const handleDelete = (id: string) => {
    if (confirm("Бұл тесті жою керек пе?")) {
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
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-medium text-[#94a3b8] hover:text-[#6ee7b7] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Басты
          </button>
          <h1 className="font-bold text-lg bg-gradient-to-r from-[#34d399] to-[#3b82f6] bg-clip-text text-transparent">
            Менің тесттерім
          </h1>
          <button
            onClick={() => setShowJson((s) => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.12] text-[#cbd5e1] text-xs font-medium hover:bg-white/[0.10] transition-all"
          >
            {showJson ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            JSON
          </button>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-4 py-6 space-y-6">
        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigate("/test-creator")}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-[#10b981]/30 hover:bg-white/[0.06] transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PenLine className="w-5 h-5 text-[#10b981]" />
            </div>
            <span className="text-sm font-medium text-[#cbd5e1]">Қолмен құру</span>
          </button>
          <button
            onClick={() => navigate("/ai-test-generator")}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-[#a855f7]/30 hover:bg-white/[0.06] transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#a855f7]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-[#a855f7]" />
            </div>
            <span className="text-sm font-medium text-[#cbd5e1]">AI генератор</span>
          </button>
          <button
            onClick={() => setShowJson(true)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-[#3b82f6]/30 hover:bg-white/[0.06] transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5 text-[#3b82f6]" />
            </div>
            <span className="text-sm font-medium text-[#cbd5e1]">Жүктеу</span>
          </button>
          <button
            onClick={() => setShowJson(true)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-[#f59e0b]/30 hover:bg-white/[0.06] transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Download className="w-5 h-5 text-[#f59e0b]" />
            </div>
            <span className="text-sm font-medium text-[#cbd5e1]">Экспорт</span>
          </button>
        </div>

        {/* JSON Panel */}
        {showJson && (
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
            <JsonImportExport onChange={refresh} />
          </div>
        )}

        {/* Tests list */}
        {tests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8 text-[#475569]" />
            </div>
            <h2 className="text-lg font-semibold text-[#cbd5e1] mb-2">Тесттер жоқ</h2>
            <p className="text-sm text-[#64748b] max-w-xs">
              Жоғарыдағы батырмалар арқылы тест құрыңыз немесе JSON файлын жүктеңіз.
            </p>
          </div>
        ) : (
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
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[#e2e8f0] truncate">{test.title}</h3>
                        {test.id.startsWith("ai_") && (
                          <span className="px-1.5 py-0.5 rounded-md bg-[#a855f7]/10 text-[#a78bfa] text-[10px] font-bold border border-[#a855f7]/20">
                            AI
                          </span>
                        )}
                      </div>
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
                        <span className="text-[#334155]">
                          {new Date(test.createdAt).toLocaleDateString("kk-KZ")}
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
                          onClick={() => navigate(`/custom-test/${test.id}`)}
                          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-sm font-semibold shadow-lg shadow-[#10b981]/20 active:scale-95 transition-all"
                        >
                          <Play className="w-4 h-4" />
                          Тапсыру
                        </button>
                        <button
                          onClick={() => navigate("/test-creator", { state: { editTestId: test.id } })}
                          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-[#cbd5e1] text-sm font-medium hover:bg-white/[0.10] active:scale-95 transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                          Өңдеу
                        </button>
                        <button
                          onClick={() => handleDuplicate(test)}
                          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-[#cbd5e1] text-sm font-medium hover:bg-white/[0.10] active:scale-95 transition-all"
                        >
                          <Copy className="w-4 h-4" />
                          Көшірме
                        </button>
                        <button
                          onClick={() => handleDelete(test.id)}
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
        )}
      </div>
    </div>
  );
}
