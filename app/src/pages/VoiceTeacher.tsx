// ============================================
// 🎙 VOICE TEACHER — Сұрақты дыбыспен түсіндіру
// ============================================
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import {
  Mic, Play, Pause, Volume2, ArrowLeft, Loader2, BookOpen,
  Headphones, Sparkles, RefreshCw,
} from "lucide-react";

interface VoiceLesson {
  id: string;
  title: string;
  topic: string;
  duration: string;
  text: string;
}

const LESSONS: VoiceLesson[] = [
  { id: "v1", title: "Митоз қалай жүреді?", topic: "Жасуша", duration: "45с", text: "Митоз — соматикалық жасушалардың көбеюі. Төрт фаза бар: профаза, метафаза, анафаза, телофаза. Профазада хромосомалар қысқарып, қоюланады. Метафазада экваторлық тақтаға тұрады. Анафазада хроматидалар бөлекке кетеді. Телофазада екі жасуша түзіледі. Нәтижесі: 2н = 2н, яғни хромосома саны өзгермейді." },
  { id: "v2", title: "Фотосинтез формуласы", topic: "Өсімдік", duration: "40с", text: "Фотосинтез — жарық энергиясын химиялық энергияға айналдыру. Формуласы: 6 көмірқышқыл газы плюс 6 су, хлорофилл мен күн энергиясы арқылы, глюкоза плюс 6 оттегіне айналады. Жарық реакциясы гранада, қараңғы реакциясы стромада жүреді." },
  { id: "v3", title: "ДНҚ құрылымы", topic: "Генетика", duration: "50с", text: "ДНҚ — дезоксирибонуклеин қышқылы. Екі спираль тізбегінен тұрады. Нуклеотидтерден құралады: фосфор қышқылы, декстроза қант, азотты негіз. Аденин әрқашан тиминмен, гуанин цитозинмен жұптасады. Репликация полимераза ферменті арқылы S фазада жүреді." },
  { id: "v4", title: "Табиғи сұрыпталу", topic: "Эволюция", duration: "42с", text: "Табиғи сұрыпталу — Чарльз Дарвиннің негізгі теориясы. Өзгергіштік пен белгілі бір қасиеттер артықшылығы. Тиімді қасиеттер өмір сүруге көмектеседі және ұрпаққа беріледі. Мысалы: ақ аю Солтүстік полюста, қара аю тропикте." },
  { id: "v5", title: "Қан құрамы", topic: "Адам", duration: "38с", text: "Қан — сұйық дәнекер ұлпасы. Плазма плюс формал элементтер. Эритроциттер оттегін тасымалдайды, лейкоциттер қорғаныс, тромбоциттер қан ұюы. Гемоглобин темірге бай ақуыз, оттегімен байланысады. Қалыпты қан қысымы 120 бөлінген 80." },
];

export default function VoiceTeacher() {
  const navigate = useNavigate();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playVoice = async (lesson: VoiceLesson) => {
    if (playingId === lesson.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    setLoadingId(lesson.id);
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "Сен — кәсіпқой биология оқытушысысың. Қазақша. Тек қана сұраққа қатысты қысқа түсіндірме бер." },
            { role: "user", content: `Осы тақырыпты дыбысқа айналдыру үшін қысқа мәтін бер: ${lesson.title}. 3-4 сөйлем.` },
          ],
          temperature: 0.7,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const text = data.response || lesson.text;

      // Browser speech synthesis
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ru-RU"; // Бірінші қазақша болса қиын, орысша fallback
      utterance.rate = 0.9;
      utterance.onend = () => setPlayingId(null);
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
      setPlayingId(lesson.id);
    } catch {
      // Fallback — browser TTS
      const utterance = new SpeechSynthesisUtterance(lesson.text);
      utterance.lang = "ru-RU";
      utterance.rate = 0.9;
      utterance.onend = () => setPlayingId(null);
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
      setPlayingId(lesson.id);
    } finally {
      setLoadingId(null);
    }
  };

  const stopVoice = () => {
    speechSynthesis.cancel();
    setPlayingId(null);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0] flex flex-col">
      <Navbar />
      <div className="max-w-[800px] mx-auto px-4 py-8 w-full">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Басты бетке
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#ef4444] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#f59e0b]/20">
            <Headphones className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">🎙 Voice Teacher</h1>
          <p className="text-sm text-[#94a3b8]">Автобуста, қараңғыда тыңда — үйрен</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400 mb-4 flex items-center gap-2">
            <Volume2 className="w-4 h-4" />{error}
          </div>
        )}

        <div className="space-y-4">
          {LESSONS.map((lesson) => (
            <div key={lesson.id} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 flex items-center justify-between gap-4 hover:bg-white/[0.06] transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${playingId === lesson.id ? "bg-[#f59e0b]/20 animate-pulse" : "bg-white/[0.06]"}`}>
                  {playingId === lesson.id ? <Pause className="w-5 h-5 text-[#f59e0b]" /> : <Mic className="w-5 h-5 text-[#94a3b8]" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold">{lesson.title}</h3>
                  <p className="text-xs text-[#64748b]">{lesson.topic} • {lesson.duration}</p>
                </div>
              </div>
              <button
                onClick={() => playingId === lesson.id ? stopVoice() : playVoice(lesson)}
                disabled={loadingId === lesson.id}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${playingId === lesson.id ? "bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/20" : "bg-[#10b981]/15 text-[#6ee7b7] border border-[#10b981]/20 hover:bg-[#10b981]/25"}`}
              >
                {loadingId === lesson.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : playingId === lesson.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {loadingId === lesson.id ? "Жүктелуде..." : playingId === lesson.id ? "Тоқтату" : "Тыңдау"}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-gradient-to-r from-[#f59e0b]/10 to-[#ef4444]/10 border border-[#f59e0b]/20 rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#f59e0b]" /> Кеңес</h3>
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            Телефонды қалтаныңда ұста, құлаққап кигенде тыңда. 1 сабақ = 1 тема. 
            Күніне 3 сабақ тыңдасаң, 1 аптада генетиканы толық қайталайсың!
          </p>
        </div>

        <div className="flex justify-center mt-6">
          <button onClick={() => navigate("/ai-trainer")} className="px-5 py-2.5 rounded-xl bg-white/[0.06] text-[#e2e8f0] font-medium flex items-center gap-2 hover:bg-white/[0.10]">
            <BookOpen className="w-4 h-4" /> AI Жаттықтырушы
          </button>
        </div>
      </div>
    </div>
  );
}
