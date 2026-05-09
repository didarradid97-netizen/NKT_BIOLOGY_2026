// ============================================
// 🎙 API: Whisper STT (Speech-to-Text)
// Groq Audio API → Vercel Function
// ============================================

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_AUDIO_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

module.exports = async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  if (!GROQ_API_KEY) {
    return res.status(500).json({
      error: "GROQ_API_KEY not configured",
      fallback: true,
    });
  }

  try {
    // Parse multipart form data
    const formidable = require("formidable");
    const form = formidable({ multiples: false });

    const [fields, files] = await form.parse(req);
    const audioFile = files.file?.[0];

    if (!audioFile) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    // Send to Groq Whisper
    const fs = require("fs");
    const FormData = require("form-data");
    const formData = new FormData();

    formData.append("file", fs.createReadStream(audioFile.filepath), {
      filename: audioFile.originalFilename || "audio.webm",
      contentType: audioFile.mimetype || "audio/webm",
    });
    formData.append("model", "whisper-large-v3");
    formData.append("response_format", "json");
    formData.append("language", "ru"); // Russian for biology terms

    const response = await fetch(GROQ_AUDIO_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Groq Audio API error:", error);
      return res.status(502).json({
        error: "Transcription failed",
        details: error,
        fallback: true,
      });
    }

    const data = await response.json();

    // Cleanup temp file
    try { fs.unlinkSync(audioFile.filepath); } catch {}

    return res.status(200).json({
      text: data.text || "",
      language: data.language || "ru",
      duration: data.duration || 0,
    });

  } catch (err) {
    console.error("Voice API error:", err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
      fallback: true,
    });
  }
};
