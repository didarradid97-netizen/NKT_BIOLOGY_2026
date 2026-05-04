import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import { BookOpen, ArrowLeft, ExternalLink, FileText, Video } from "lucide-react";

const materials = [
  { title: "Клетка биологиясы", type: "PDF", url: "#" },
  { title: "Генетика негіздері", type: "PDF", url: "#" },
  { title: "Экология тақырыптары", type: "PDF", url: "#" },
  { title: "Эволюция теориясы", type: "PDF", url: "#" },
  { title: "Физиология негіздері", type: "PDF", url: "#" },
  { title: "Биохимия қысқаша", type: "PDF", url: "#" },
];

export default function ResourcesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Артқа
        </button>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Материалдар</h1>
          <p className="text-white/60">ОЗП-ға дайындыққа қажетті барлық материалдар</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {materials.map((material) => (
            <a
              key={material.title}
              href={material.url}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:bg-white/10 transition group"
            >
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                {material.type === "PDF" ? (
                  <FileText className="w-6 h-6 text-emerald-400" />
                ) : (
                  <Video className="w-6 h-6 text-emerald-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{material.title}</h3>
                <span className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded-lg">
                  {material.type}
                </span>
              </div>
              <ExternalLink className="w-5 h-5 text-white/30 group-hover:text-white/60 transition" />
            </a>
          ))}
        </div>

        <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <BookOpen className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Толық оқулық</h2>
          <p className="text-white/60 mb-6">Барлық тақырыптар бойынша толық оқулықты жүктеңіз</p>
          <button className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition">
            Жүктеу
          </button>
        </div>
      </div>
    </div>
  );
}
