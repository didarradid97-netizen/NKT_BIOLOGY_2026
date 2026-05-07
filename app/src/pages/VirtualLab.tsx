// ============================================
// 🧪 VIRTUAL LAB — Drag & Drop (simplified interactive)
// ============================================
import { useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import {
  FlaskConical, ArrowLeft, RotateCcw, CheckCircle, XCircle,
  Zap, Dna, Microscope, Atom, Droplets,
} from "lucide-react";

interface LabItem {
  id: string;
  label: string;
  icon: any;
  color: string;
}

interface LabSlot {
  id: string;
  label: string;
  correctItem: string;
  filled: string | null;
}

const LAB_ITEMS: LabItem[] = [
  { id: "dna", label: "ДНҚ", icon: Dna, color: "#ef4444" },
  { id: "mito", label: "Митохондрия", icon: Zap, color: "#f59e0b" },
  { id: "ribo", label: "Рибосома", icon: Atom, color: "#3b82f6" },
  { id: "chloro", label: "Хлоропласт", icon: Droplets, color: "#10b981" },
  { id: "nucleus", label: "Ядро", icon: Microscope, color: "#a855f7" },
];

const INITIAL_SLOTS: LabSlot[] = [
  { id: "s1", label: "Генетикалық ақпарат сақтайтын орын", correctItem: "nucleus", filled: null },
  { id: "s2", label: "Энергетикалық станция (АТФ)", correctItem: "mito", filled: null },
  { id: "s3", label: "Нәруыз синтездейтін құрылым", correctItem: "ribo", filled: null },
  { id: "s4", label: "Фотосинтез жүретін органоид", correctItem: "chloro", filled: null },
  { id: "s5", label: "Тұқым қуалайтын материал", correctItem: "dna", filled: null },
];

export default function VirtualLab() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState<LabSlot[]>(INITIAL_SLOTS);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleDragStart = (itemId: string) => setDraggedItem(itemId);

  const handleDrop = (slotId: string) => {
    if (!draggedItem) return;
    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, filled: draggedItem } : s)));
    setDraggedItem(null);
  };

  const checkResults = () => {
    setShowResult(true);
  };

  const reset = () => {
    setSlots(INITIAL_SLOTS.map((s) => ({ ...s, filled: null })));
    setShowResult(false);
  };

  const correctCount = slots.filter((s) => s.filled === s.correctItem).length;
  const allFilled = slots.every((s) => s.filled !== null);

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0] flex flex-col">
      <Navbar />
      <div className="max-w-[800px] mx-auto px-4 py-8 w-full">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Басты бетке
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#06b6d4] to-[#3b82f6] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#06b6d4]/20">
            <FlaskConical className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">🧪 Virtual Lab</h1>
          <p className="text-sm text-[#94a3b8]">Drag & Drop — құрылымдарды орнына қой</p>
        </div>

        {/* Draggable items */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-5">
          <h3 className="text-sm font-bold mb-3">🔬 Лаборатория заттары</h3>
          <div className="flex flex-wrap gap-3">
            {LAB_ITEMS.map((item) => {
              const used = slots.some((s) => s.filled === item.id);
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  draggable={!used}
                  onDragStart={() => handleDragStart(item.id)}
                  onClick={() => {
                    // Mobile tap to select
                    if (draggedItem === item.id) setDraggedItem(null);
                    else if (!used) setDraggedItem(item.id);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${used ? "opacity-30 border-white/[0.04] bg-white/[0.02]" : draggedItem === item.id ? "border-[#06b6d4]/40 bg-[#06b6d4]/15 shadow-lg shadow-[#06b6d4]/10" : "border-white/[0.12] bg-white/[0.06] hover:bg-white/[0.08] cursor-grab"}`}
                  style={{ borderColor: draggedItem === item.id ? item.color : undefined }}
                >
                  <Icon className="w-4 h-4" style={{ color: item.color }} />
                  {item.label}
                </button>
              );
            })}
          </div>
          {draggedItem && (
            <p className="text-xs text-[#06b6d4] mt-3">👆 Қазір {LAB_ITEMS.find((i) => i.id === draggedItem)?.label} таңдалды. Төмендегі орындардың біреуіне басыңыз.</p>
          )}
        </div>

        {/* Drop zones */}
        <div className="space-y-3 mb-6">
          {slots.map((slot) => {
            const filledItem = LAB_ITEMS.find((i) => i.id === slot.filled);
            const isCorrect = showResult && slot.filled === slot.correctItem;
            const isWrong = showResult && slot.filled !== null && slot.filled !== slot.correctItem;
            return (
              <div
                key={slot.id}
                onClick={() => draggedItem && handleDrop(slot.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(slot.id)}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isCorrect ? "bg-[#10b981]/10 border-[#10b981]/30" : isWrong ? "bg-red-500/10 border-red-500/30" : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05]"}`}
              >
                <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center text-[#64748b] font-bold text-sm flex-shrink-0">
                  {filledItem ? <filledItem.icon className="w-5 h-5" style={{ color: filledItem.color }} /> : "?"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{slot.label}</p>
                  {filledItem && (
                    <p className="text-xs" style={{ color: filledItem.color }}>{filledItem.label}</p>
                  )}
                </div>
                {showResult && (
                  <div className="flex-shrink-0">
                    {isCorrect ? <CheckCircle className="w-5 h-5 text-[#10b981]" /> : isWrong ? <XCircle className="w-5 h-5 text-red-400" /> : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {showResult && (
          <div className="text-center mb-6">
            <p className="text-2xl font-bold mb-2">
              {correctCount === slots.length ? "🎉 Тамаша! Барлығы дұрыс!" : `${correctCount}/${slots.length} дұрыс`}
            </p>
            <p className="text-sm text-[#94a3b8]">Қателерді қайталап, құрылымдарды есте сақта!</p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="px-5 py-2.5 rounded-xl bg-white/[0.06] text-[#e2e8f0] font-medium flex items-center gap-2 hover:bg-white/[0.10]">
            <RotateCcw className="w-4 h-4" /> Қайта
          </button>
          <button onClick={checkResults} disabled={!allFilled} className={`px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all ${allFilled ? "bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white shadow-[#06b6d4]/20" : "bg-white/[0.04] text-[#64748b] cursor-not-allowed"}`}>
            <CheckCircle className="w-4 h-4" /> Тексеру
          </button>
        </div>
      </div>
    </div>
  );
}
