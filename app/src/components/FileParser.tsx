// ============================================
// 📎 ФАЙЛ ПАРСИНГ — ТЕК КЛИЕНТ (СЕРВЕРСІЗ)
// ============================================
// Тек TXT файлдар қолдау көрсетіледі.
// PDF/DOCX браузерде толық оқылмайды (құпиялылық + кітапханалар).

export async function parseFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  // ✅ TXT - тікелей оқу (браузерде жұмыс істейді)
  if (ext === "txt" || file.type === "text/plain") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("TXT файлды оқу қатесі"));
      reader.readAsText(file);
    });
  }

  // ❌ PDF/DOCX — серверсіз нұсқада қолдау көрсетілмейді
  if (ext === "pdf" || file.type === "application/pdf") {
    throw new Error(
      "PDF файлдары браузерде оқылмайды. " +
      "Алдын ала мәтінді TXT файлына салып жүктеңіз."
    );
  }

  if (ext === "docx" || file.type.includes("wordprocessingml")) {
    throw new Error(
      "DOCX файлдары браузерде оқылмайды. " +
      "Word-тен Файл → Сақтау → Жас TXT құжаты ретінде сақтаңыз."
    );
  }

  throw new Error("Қолдау көрсетілмейтін формат. Тек TXT жүктеңіз.");
}

export function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

export function isSupportedFile(fileName: string): boolean {
  const ext = getFileExtension(fileName);
  return ext === "txt";
}
