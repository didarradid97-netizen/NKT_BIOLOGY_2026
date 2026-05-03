import { useNavigate } from "react-router";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-white/50 mb-6">Бет табылмады</p>
        <button onClick={() => navigate("/")} className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition inline-flex items-center gap-2">
          <Home className="w-5 h-5" /> Басты бетке оралу
        </button>
      </div>
    </div>
  );
}
