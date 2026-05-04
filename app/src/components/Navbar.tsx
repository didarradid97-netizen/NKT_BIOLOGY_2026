import { useState } from "react";
import { Link, useLocation } from "react-router";
import { isAuthenticated, clearAuth } from "@/lib/storage";
import {
  Microscope,
  Home,
  FileText,
  User,
  BookOpen,
  Bot,
  PenLine,
  Sparkles,
  FolderOpen,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Search,
} from "lucide-react";

const mainLinks = [
  { path: "/", label: "Басты", icon: Home },
  { path: "/tests", label: "Тесттер", icon: FileText },
  { path: "/search", label: "Іздеу", icon: Search },
];

const testLinks = [
  { path: "/my-tests", label: "Менің тесттерім", icon: FolderOpen },
  { path: "/test-creator", label: "Тест құру", icon: PenLine },
  { path: "/ai-test-generator", label: "AI генератор", icon: Sparkles },
];

const otherLinks = [
  { path: "/ai-trainer", label: "AI Жаттықтырушы", icon: Bot },
  { path: "/resources", label: "Материалдар", icon: BookOpen },
  { path: "/profile", label: "Профиль", icon: User },
];

export default function Navbar() {
  const location = useLocation();
  const [mobOpen, setMobOpen] = useState(false);
  const [testMenuOpen, setTestMenuOpen] = useState(false);
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
          <div className="hidden md:flex items-center gap-1">
            {mainLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive(link.path)
                    ? "bg-[#10b981]/12 text-[#6ee7b7]"
                    : "text-[#94a3b8] hover:bg-white/[0.05] hover:text-[#e2e8f0]"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Test dropdown */}
            <div className="relative">
              <button
                onClick={() => setTestMenuOpen((s) => !s)}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  testLinks.some((l) => isActive(l.path))
                    ? "bg-[#10b981]/12 text-[#6ee7b7]"
                    : "text-[#94a3b8] hover:bg-white/[0.05] hover:text-[#e2e8f0]"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Менің тесттерім
                <ChevronDown className={`w-3 h-3 transition-transform ${testMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {testMenuOpen && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-[#1e293b] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-[101]">
                  {testLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setTestMenuOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all ${
                        isActive(link.path)
                          ? "bg-[#10b981]/10 text-[#6ee7b7]"
                          : "text-[#94a3b8] hover:bg-white/[0.04] hover:text-[#e2e8f0]"
                      }`}
                    >
                      <link.icon className="w-3.5 h-3.5" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {otherLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive(link.path)
                    ? "bg-[#10b981]/12 text-[#6ee7b7]"
                    : "text-[#94a3b8] hover:bg-white/[0.05] hover:text-[#e2e8f0]"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {authenticated && (
              <button
                onClick={() => {
                  clearAuth();
                  window.location.reload();
                }}
                className="ml-1 p-2 rounded-xl bg-white/[0.06] text-[#94a3b8] hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Шығу"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobOpen((s) => !s)}
            className="md:hidden p-2 rounded-xl bg-white/[0.06] text-[#cbd5e1]"
          >
            {mobOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobOpen && (
        <div className="fixed inset-0 z-[200] bg-[#0f172a]/98 backdrop-blur-2xl flex flex-col p-5 gap-1 md:hidden">
          <button
            onClick={() => setMobOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/[0.1] text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <Link to="/" onClick={() => setMobOpen(false)} className="flex items-center gap-3 p-4 rounded-2xl text-lg font-semibold text-[#e2e8f0] bg-white/[0.04]">
            <Home className="w-5 h-5 text-[#10b981]" /> Басты
          </Link>
          <Link to="/tests" onClick={() => setMobOpen(false)} className="flex items-center gap-3 p-4 rounded-2xl text-lg font-semibold text-[#e2e8f0] bg-white/[0.04]">
            <FileText className="w-5 h-5 text-[#10b981]" /> Тесттер
          </Link>
          <div className="px-4 py-2 text-xs font-bold text-[#475569] uppercase tracking-wider">Менің тесттерім</div>
          <Link to="/my-tests" onClick={() => setMobOpen(false)} className="flex items-center gap-3 p-4 rounded-2xl text-base font-medium text-[#cbd5e1] bg-white/[0.02] ml-2">
            <FolderOpen className="w-4 h-4" /> Тізім
          </Link>
          <Link to="/test-creator" onClick={() => setMobOpen(false)} className="flex items-center gap-3 p-4 rounded-2xl text-base font-medium text-[#cbd5e1] bg-white/[0.02] ml-2">
            <PenLine className="w-4 h-4" /> Қолмен құру
          </Link>
          <Link to="/ai-test-generator" onClick={() => setMobOpen(false)} className="flex items-center gap-3 p-4 rounded-2xl text-base font-medium text-[#cbd5e1] bg-white/[0.02] ml-2">
            <Sparkles className="w-4 h-4" /> AI генератор
          </Link>

          <div className="px-4 py-2 text-xs font-bold text-[#475569] uppercase tracking-wider">Қосымша</div>
          <Link to="/ai-trainer" onClick={() => setMobOpen(false)} className="flex items-center gap-3 p-4 rounded-2xl text-lg font-semibold text-[#e2e8f0] bg-white/[0.04]">
            <Bot className="w-5 h-5 text-[#a855f7]" /> AI Жаттықтырушы
          </Link>
          <Link to="/resources" onClick={() => setMobOpen(false)} className="flex items-center gap-3 p-4 rounded-2xl text-lg font-semibold text-[#e2e8f0] bg-white/[0.04]">
            <BookOpen className="w-5 h-5 text-[#3b82f6]" /> Материалдар
          </Link>
          <Link to="/profile" onClick={() => setMobOpen(false)} className="flex items-center gap-3 p-4 rounded-2xl text-lg font-semibold text-[#e2e8f0] bg-white/[0.04]">
            <User className="w-5 h-5 text-[#f59e0b]" /> Профиль
          </Link>

          {authenticated && (
            <button
              onClick={() => {
                clearAuth();
                window.location.reload();
              }}
              className="flex items-center gap-3 p-4 rounded-2xl text-lg font-semibold text-red-400 bg-red-500/10 mt-auto"
            >
              <LogOut className="w-5 h-5" /> Шығу
            </button>
          )}
        </div>
      )}
    </>
  );
}

