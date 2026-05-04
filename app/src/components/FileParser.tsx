export async function parseFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "txt" || file.type === "text/plain") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Файлды оқу қатесі"));
      reader.readAsText(file);
    });
  }

  if (ext === "pdf" || file.type === "application/pdf") {
    // Frontend-те толық PDF парсинг қиын. Backend қолданыңыз немесе pdfjs-dist қосыңыз.
    // Осында негізгі тексті алу үшін қарапайым тәсіл:
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result || "");
        // PDF ішінен мәтінді бөліп алу (қарапайым heuristic)
        const cleaned = text
          .replace(/[^\x20-\x7E\xC0-\xFF\s]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        if (cleaned.length > 50) resolve(cleaned);
        else
          reject(
            new Error(
              "PDF мәтіні алынбады. Backend /api/parse/file endpoint жасаңыз немесе pdfjs-dist кітапханасын қосыңыз."
            )
          );
      };
      reader.onerror = () => reject(new Error("PDF оқу қатесі"));
      reader.readAsText(file);
    });
  }

  if (ext === "docx" || file.type.includes("wordprocessingml")) {
    // DOCX үшін mammoth.js кітапханасы қажет. Backend арқылы оңай.
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          // Егер mammoth орнатылған болса қолдануға болады
          const mammoth = await import("mammoth");
          const result = await mammoth.extractRawText({ arrayBuffer: reader.result as ArrayBuffer });
          if (result.value && result.value.length > 20) resolve(result.value);
          else reject(new Error("DOCX мәтіні бос"));
        } catch {
          reject(
            new Error(
              'DOCX оқу үшін "npm install mammoth" командасын орындаңыз'
            )
          );
        }
      };
      reader.onerror = () => reject(new Error("DOCX оқу қатесі"));
      reader.readAsArrayBuffer(file);
    });
  }

  throw new Error("Қолдау көрсетілмейтін формат. TXT, PDF, DOCX жүктеңіз.");
}

export function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

export function isSupportedFile(fileName: string): boolean {
  const ext = getFileExtension(fileName);
  return ["txt", "pdf", "docx"].includes(ext);
}
