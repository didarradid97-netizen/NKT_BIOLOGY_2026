// ============================================
// 🤖 MENTOR HUB — AI Mentor Avatar + Explain Like + Motivation
// ============================================
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import {
  getMentorSettings, saveMentorSettings, MENTOR_PROMPTS, EXPLAIN_PROMPTS,
  type MentorType, type ExplainMode,
} from "@/lib/mentorStorage";
import {
  Zap, ArrowLeft, User, Smile, Flame, Ghost, BookOpen, Baby,
  GraduationCap, Laugh, Timer, Skull, Heart, CheckCircle,
} from "lucide-react";

const MENTOR_ICONS: Record<MentorType, any> = { strict: Flame, friend: Smile, coach: Zap, meme: Ghost };
const MENTOR_LABELS: Record<MentorType, string> = { strict: "Қатал мұғалім", friend: "Дос сияқты", coach: "Motivating Coach", meme: "Gen Z Meme" };
const MENTOR_COLORS: Record<MentorType, string> = { strict: "#ef4444", friend: "#3b82f6", coach: "#10b981", meme: "#a855f7" };

const EXPLAIN_ICONS: Record<ExplainMode, any> = { child: Baby, student: GraduationCap, meme: Laugh, short: Timer, hardcore: Skull };
const EXPLAIN_LABELS: Record<ExplainMode, string> = { child: "Балаға", student: "Студентке", meme: "Меммен", short: "Қысқа", hardcore: "Hardcore" };

export default function MentorHub() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(getMentorSettings());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getMentorSettings());
  }, []);

  const update = (patch: Partial<typeof settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveMentorSettings(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0] flex flex-col">
      <Navbar />
      <div className="max-w-[700px] mx-auto px-4 py-8 w-full">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Басты бетке
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#a855f7]/20">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">🤖 AI Mentor</h1>
          <p className="text-sm text-[#94a3b8]">Сенің стиліңді, тонуңды таңда</p>
        </div>

        {/* Mentor Type */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-5">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-[#a855f7]" /> AI Келбеті</h3>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(MENTOR_LABELS) as MentorType[]).map((type) => {
              const Icon = MENTOR_ICONS[type];
              const active = settings.type === type;
              return (
                <button key={type} onClick={() => update({ type })}
                  className={`p-4 rounded-xl border text-left transition-all ${active ? "border-[#a855f7]/40 bg-[#a855f7]/10" : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05]"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5" style={{ color: MENTOR_COLORS[type] }} />
                    <span className="text-sm font-bold">{MENTOR_LABELS[type]}</span>
                  </div>
                  <p className="text-[10px] text-[#64748b] leading-relaxed">{MENTOR_PROMPTS[type].slice(0, 80)}...</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Explain Mode */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-5">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-[#3b82f6]" /> Түсіндіру Стилі</h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {(Object.keys(EXPLAIN_LABELS) as ExplainMode[]).map((mode) => {
              const Icon = EXPLAIN_ICONS[mode];
              const active = settings.explainMode === mode;
              return (
                <button key={mode} onClick={() => update({ explainMode: mode })}
                  className={`p-3 rounded-xl border text-center transition-all ${active ? "border-[#3b82f6]/40 bg-[#3b82f6]/10" : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05]"}`}>
                  <Icon className="w-5 h-5 mx-auto mb-1 text-[#94a3b8]" />
                  <span className="text-[10px] font-medium">{EXPLAIN_LABELS[mode]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">💪 Мотивация хабарлары</p>
              <p className="text-[10px] text-[#64748b]">Әр жауаптан кейін мотивациялық сөйлем</p>
            </div>
            <button onClick={() => update({ motivationEnabled: !settings.motivationEnabled })}
              className={`w-11 h-6 rounded-full transition-all relative ${settings.motivationEnabled ? "bg-[#10b981]" : "bg-white/[0.12]"}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${settings.motivationEnabled ? "left-[22px]" : "left-[2px]"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">🎙 Voice Mode</p>
              <p className="text-[10px] text-[#64748b]">AI жауабын дыбыспен оқу</p>
            </div>
            <button onClick={() => update({ voiceEnabled: !settings.voiceEnabled })}
              className={`w-11 h-6 rounded-full transition-all relative ${settings.voiceEnabled ? "bg-[#10b981]" : "bg-white/[0.12]"}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${settings.voiceEnabled ? "left-[22px]" : "left-[2px]"}`} />
            </button>
          </div>
        </div>

        {saved && (
          <div className="flex items-center justify-center gap-2 text-sm text-[#10b981] mb-4">
            <CheckCircle className="w-4 h-4" /> Сақталды!
          </div>
        )}

        <div className="bg-gradient-to-r from-[#a855f7]/10 to-[#ec4899]/10 border border-[#a855f7]/20 rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-2 flex items-center gap-2"><Heart className="w-4 h-4 text-[#ec4899]" /> Ағымдағы промпт</h3>
          <p className="text-xs text-[#94a3b8] leading-relaxed whitespace-pre-line">
            {MENTOR_PROMPTS[settings.type]}\n\n{EXPLAIN_PROMPTS[settings.explainMode]}
          </p>
        </div>
      </div>
    </div>
  );
}
