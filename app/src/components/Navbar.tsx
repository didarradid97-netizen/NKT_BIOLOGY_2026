import { useState } from "react";
import { Link, useLocation } from "react-router";
import { isAuthenticated, clearAuth } from "@/lib/storage";
import {
  Microscope, Home, FileText, User, BookOpen, Bot, PenLine,
  Sparkles, FolderOpen, LogOut, Menu, X, ChevronDown, Search,
  BarChart3, Users, Trophy, Video, Bell, GraduationCap, Brain,
  Mic, ScanLine, Swords, Globe, FlaskConical, Briefcase, Zap,
} from "lucide-react";

const mainLinks = [
  { path: "/", label: "Басты", icon: Home },
  { path: "/tests", label: "Тесттер", icon: FileText },
  { path: "/syllabus", label: "Силлабус", icon: GraduationCap },
  { path: "/search", label: "Іздеу", icon: Search },
];

const testLinks = [
  { path: "/my-tests", label: "Менің тесттерім", icon: FolderOpen },
  { path: "/test-creator", label: "Тест құру", icon: PenLine },
  { path: "/ai-test-generator", label: "AI генератор", icon: Sparkles },
];

const aiHubLinks = [
  { path: "/ai-trainer", label: "AI Жаттықтырушы", icon: Bot },
  { path: "/ai-diagnosis", label: "AI Диагноз", icon: Brain },
  { path: "/voice-teacher", label: "Voice Teacher", icon: Mic },
  { path: "/smart-scan", label: "Smart Scan", icon: ScanLine },
  { path: "/mentor", label: "AI Mentor", icon: Zap },
];

const gameLinks = [
  { path: "/duel", label: "Duel Mode", icon: Swords },
  { path: "/global-rating", label: "Global Rating", icon: Globe },
  { path: "/daily", label: "Daily Hub", icon: Zap },
  { path: "/virtual-lab", label: "Virtual Lab", icon: FlaskConical },
  { path: "/achievements", label: "Жетістіктер", icon: Trophy },
];

const otherLinks = [
  { path: "/resources", label: "Материалдар", icon: BookOpen },
  { path: "/teacher-hub", label: "Базар", icon: Briefcase },
  { path: "/profile", label: "Профиль", icon: User },
];

export default function Navbar() {
  const location = useLocation();
  const [mobOpen, setMobOpen] = useState(false);
  const [testMenuOpen, setTestMenuOpen] = useState(false);
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [gameMenuOpen, setGameMenuOpen] = useState(false);
  const authenticated = isAuthenticated();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-[100] bg-[#0f172a]/85 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 font-extrabold text-base sm:text-lg tracking-tight flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10b981] to-[#3b82f6] flex items-center justify-center shadow-lg shadow-[#10b981]/20">
              <Microscope className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-[#34d399] to-[#3b82f6] bg-clip-text text-transparent">
              NKT BIOLOGY
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {mainLinks.map((link) => (
              <Link key={link.path} to={link.path}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${isActive(link.path) ? "bg-[#10b981]/12 text-[#6ee7b7]" : "text-[#94a3b8] hover:bg-white/[0.05] hover:text-[#e2e8f0]"}`}>
                {link.label}
              </Link>
            ))}

            {/* Test dropdown */}
            <div className="relative">
              <button onClick={() => { setTestMenuOpen((s) => !s); setAiMenuOpen(false); setGameMenuOpen(false); }}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${testLinks.some((l) => isActive(l.path)) ? "bg-[#10b981]/12 text-[#6ee7b7]" : "text-[#94a3b8] hover:bg-white/[0.05] hover:text-[#e2e8f0]"}`}>
                <FileText className="w-3.5 h-3.5" /> Тесттерім<ChevronDown className={`w-3 h-3 transition-transform ${testMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {testMenuOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-[#1e293b] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-[101]">
                  {testLinks.map((link) => (
                    <Link key={link.path} to={link.path} onClick={() => setTestMenuOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all ${isActive(link.path) ? "bg-[#10b981]/10 text-[#6ee7b7]" : "text-[#94a3b8] hover:bg-white/[0.04] hover:text-[#e2e8f0]"}`}>
                      <link.icon className="w-3.5 h-3.5" />{link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* AI Hub dropdown */}
            <div className="relative">
              <button onClick={() => { setAiMenuOpen((s) => !s); setTestMenuOpen(false); setGameMenuOpen(false); }}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${aiHubLinks.some((l) => isActive(l.path)) ? "bg-[#a855f7]/12 text-[#d8b4fe]" : "text-[#94a3b8] hover:bg-white/[0.05] hover:text-[#e2e8f0]"}`}>
                <Bot className="w-3.5 h-3.5" /> AI Hub<ChevronDown className={`w-3 h-3 transition-transform ${aiMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {aiMenuOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-[#1e293b] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-[101]">
                  {aiHubLinks.map((link) => (
                    <Link key={link.path} to={link.path} onClick={() => setAiMenuOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all ${isActive(link.path) ? "bg-[#a855f7]/10 text-[#d8b4fe]" : "text-[#94a3b8] hover:bg-white/[0.04] hover:text-[#e2e8f0]"}`}>
                      <link.icon className="w-3.5 h-3.5" />{link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Game dropdown */}
            <div className="relative">
              <button onClick={() => { setGameMenuOpen((s) => !s); setTestMenuOpen(false); setAiMenuOpen(false); }}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${gameLinks.some((l) => isActive(l.path)) ? "bg-[#f59e0b]/12 text-[#fbbf24]" : "text-[#94a3b8] hover:bg-white/[0.05] hover:text-[#e2e8f0]"}`}>
                <Trophy className="w-3.5 h-3.5" /> Ойын<ChevronDown className={`w-3 h-3 transition-transform ${gameMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {gameMenuOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-[#1e293b] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-[101]">
                  {gameLinks.map((link) => (
                    <Link key={link.path} to={link.path} onClick={() => setGameMenuOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all ${isActive(link.path) ? "bg-[#f59e0b]/10 text-[#fbbf24]" : "text-[#94a3b8] hover:bg-white/[0.04] hover:text-[#e2e8f0]"}`}>
                      <link.icon className="w-3.5 h-3.5" />{link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {otherLinks.map((link) => (
              <Link key={link.path} to={link.path}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${isActive(link.path) ? "bg-[#10b981]/12 text-[#6ee7b7]" : "text-[#94a3b8] hover:bg-white/[0.05] hover:text-[#e2e8f0]"}`}>
                {link.label}
              </Link>
            ))}

            <Link to="/progress" className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${isActive("/progress") ? "bg-[#10b981]/12 text-[#6ee7b7]" : "text-[#94a3b8] hover:bg-white/[0.05] hover:text-[#e2e8f0]"}`}>Прогресс</Link>
            <Link to="/group-test" className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${isActive("/group-test") ? "bg-[#10b981]/12 text-[#6ee7b7]" : "text-[#94a3b8] hover:bg-white/[0.05] hover:text-[#e2e8f0]"}`}>Топтық</Link>
            <Link to="/live" className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${isActive("/live") ? "bg-[#10b981]/12 text-[#6ee7b7]" : "text-[#94a3b8] hover:bg-white/[0.05] hover:text-[#e2e8f0]"}`}>Тірі сабақ</Link>
            <Link to="/updates" className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${isActive("/updates") ? "bg-[#f59e0b]/12 text-[#fbbf24]" : "text-[#fbbf24] hover:bg-[#f59e0b]/10"}`}><Bell className="w-3 h-3" />Жаңалықтар</Link>

            {authenticated && (
              <button onClick={() => { clearAuth(); window.location.reload(); }}
                className="ml-1 p-2 rounded-xl bg-white/[0.06] text-[#94a3b8] hover:text-red-400 hover:bg-red-500/10 transition-all" title="Шығу">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobOpen((s) => !s)} className="lg:hidden p-2 rounded-xl bg-white/[0.06] text-[#cbd5e1]">
            {mobOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobOpen && (
        <div className="fixed inset-0 z-[200] bg-[#0f172a]/98 backdrop-blur-2xl flex flex-col p-5 gap-1 lg:hidden overflow-y-auto">
          <button onClick={() => setMobOpen(false)} className="absolute top-4 right-4 p-2 rounded-xl bg-white/[0.1] text-white"><X className="w-5 h-5" /></button>

          <div className="px-4 py-2 text-xs font-bold text-[#475569] uppercase tracking-wider">Негізгі</div>
          {mainLinks.map((l) => (
            <Link key={l.path} to={l.path} onClick={() => setMobOpen(false)} className="flex items-center gap-3 p-4 rounded-2xl text-lg font-semibold text-[#e2e8f0] bg-white/[0.04]">
              <l.icon className="w-5 h-5 text-[#10b981]" />{l.label}
            </Link>
          ))}

          <div className="px-4 py-2 text-xs font-bold text-[#475569] uppercase tracking-wider">AI Hub</div>
          {aiHubLinks.map((l) => (
            <Link key={l.path} to={l.path} onClick={() => setMobOpen(false)} className="flex items-center gap-3 p-4 rounded-2xl text-base font-medium text-[#cbd5e1] bg-white/[0.02] ml-2">
              <l.icon className="w-4 h-4" />{l.label}
            </Link>
          ))}

          <div className="px-4 py-2 text-xs font-bold text-[#475569] uppercase tracking-wider">Ойын</div>
          {gameLinks.map((l) => (
            <Link key={l.path} to={l.path} onClick={() => setMobOpen(false)} className="flex items-center gap-3 p-4 rounded-2xl text-base font-medium text-[#cbd5e1] bg-white/[0.02] ml-2">
              <l.icon className="w-4 h-4" />{l.label}
            </Link>
          ))}

          <div className="px-4 py-2 text-xs font-bold text-[#475569] uppercase tracking-wider">Тесттерім</div>
          {testLinks.map((l) => (
            <Link key={l.path} to={l.path} onClick={() => setMobOpen(false)} className="flex items-center gap-3 p-4 rounded-2xl text-base font-medium text-[#cbd5e1] bg-white/[0.02] ml-2">
              <l.icon className="w-4 h-4" />{l.label}
            </Link>
          ))}

          <div className="px-4 py-2 text-xs font-bold text-[#475569] uppercase tracking-wider">Қосымша</div>
          {otherLinks.map((l) => (
            <Link key={l.path} to={l.path} onClick={() => setMobOpen(false)} className="flex items-center gap-3 p-4 rounded-2xl text-lg font-semibold text-[#e2e8f0] bg-white/[0.04]">
              <l.icon className="w-5 h-5 text-[#3b82f6]" />{l.label}
            </Link>
          ))}
          <Link to="/progress" onClick={() => setMobOpen(false)} className="flex items-center gap-3 p-4 rounded-2xl text-lg font-semibold text-[#e2e8f0] bg-white/[0.04]">
            <BarChart3 className="w-5 h-5 text-[#10b981]" />Прогресс
          </Link>
          <Link to="/group-test" onClick={() => setMobOpen(false)} className="flex items-center gap-3 p-4 rounded-2xl text-lg font-semibold text-[#e2e8f0] bg-white/[0.04]">
            <Users className="w-5 h-5 text-[#f59e0b]" />Топтық тест
          </Link>
          <Link to="/live" onClick={() => setMobOpen(false)} className="flex items-center gap-3 p-4 rounded-2xl text-lg font-semibold text-[#e2e8f0] bg-white/[0.04]">
            <Video className="w-5 h-5 text-[#ef4444]" />Тірі сабақ
          </Link>
          <Link to="/updates" onClick={() => setMobOpen(false)} className="flex items-center gap-3 p-4 rounded-2xl text-lg font-semibold text-[#fbbf24] bg-[#f59e0b]/10 border border-[#f59e0b]/20">
            <Bell className="w-5 h-5 text-[#f59e0b]" />Жаңалықтар
          </Link>

          {authenticated && (
            <button onClick={() => { clearAuth(); window.location.reload(); }} className="flex items-center gap-3 p-4 rounded-2xl text-lg font-semibold text-red-400 bg-red-500/10 mt-auto">
              <LogOut className="w-5 h-5" />Шығу
            </button>
          )}
        </div>
      )}
    </>
  );
}
