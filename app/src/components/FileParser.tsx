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
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result || "");
        const cleaned = text
          .replace(/[^\x20-\x7E\xC0-\xFF\s]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        if (cleaned.length > 50) resolve(cleaned);
        else
          reject(
            new Error(
              "PDF мәтіні алынбады. Backend /api/parse/file endpoint жасаңыз."
            )
          );
      };
      reader.onerror = () => reject(new Error("PDF оқу қатесі"));
      reader.readAsText(file);
    });
  }

  if (ext === "docx" || file.type.includes("wordprocessingml")) {
    // mammoth кітапханасы қажет. Орнату: npm install mammoth
    return new Promise((_resolve, reject) => {
      reject(
        new Error(
          'DOCX оқу үшін терминалда "npm install mammoth" командасын орындаңыз, содан кейін қайта build жасаңыз.'
        )
      );
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

