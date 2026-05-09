import { useState } from "react";
import { importCustomTests, exportCustomTests } from "@/lib/customTestStorage";
import {
  Download,
  Upload,
  Check,
  AlertCircle,
  FileJson,
} from "lucide-react";

export function JsonImportExport({ onChange }: { onChange: () => void }) {
  const [jsonText, setJsonText] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleExport = () => {
    const tests = exportCustomTests();
    const json = JSON.stringify(tests, null, 2);
    setJsonText(json);

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nkt_tests_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setMessage({ type: "ok", text: `${tests.length} тест экспортталды` });
  };

  const handleImport = () => {
    setMessage(null);
    try {
      const data = JSON.parse(jsonText);
      if (!Array.isArray(data)) throw new Error("JSON массив болуы керек");
      importCustomTests(data);
      setMessage({ type: "ok", text: `${data.length} тест импортталды` });
      onChange();
    } catch (err) {
      setMessage({ type: "err", text: "Қате JSON форматы: " + (err as Error).message });
    }
  };

  const handleFileImport = async (file: File) => {
    setMessage(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error("JSON массив болуы керек");
      importCustomTests(data);
      setMessage({ type: "ok", text: `${data.length} тест импортталды` });
      setJsonText(text);
      onChange();
    } catch (err) {
      setMessage({ type: "err", text: "Файл қатесі: " + (err as Error).message });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileJson className="w-5 h-5 text-[#f59e0b]" />
        <h3 className="font-semibold text-[#e2e8f0]">JSON Импорт / Экспорт</h3>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[#fbbf24] text-sm font-medium hover:bg-[#f59e0b]/15 transition-all"
        >
          <Download className="w-4 h-4" />
          Экспорт
        </button>
        <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#60a5fa] text-sm font-medium hover:bg-[#3b82f6]/15 transition-all cursor-pointer">
          <Upload className="w-4 h-4" />
          Файл жүктеу
          <input
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileImport(file);
              e.target.value = "";
            }}
          />
        </label>
        <button
          onClick={handleImport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-sm font-medium shadow-lg shadow-[#10b981]/20 hover:shadow-[#10b981]/30 transition-all"
        >
          <Check className="w-4 h-4" />
          Импорт
        </button>
      </div>

      <textarea
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        placeholder='[{"id":"custom_1","title":"Менің тестім","questions":[{"text":"Сұрақ?","options":["А","Б","В","Г"],"correctAnswer":0}]}]'
        rows={8}
        className="w-full bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-3 text-xs font-mono text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[#f59e0b] resize-none"
      />

      {message && (
        <div
          className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl ${
            message.type === "ok"
              ? "bg-[#10b981]/10 text-[#6ee7b7] border border-[#10b981]/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {message.type === "ok" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}
    </div>
  );
}
