import "dotenv/config";
import express from "express";
import multer from "multer";
import Anthropic from "@anthropic-ai/sdk";

const PORT = Number(process.env.PORT) || 3001;
const DOC_TYPES = new Set(["Invoice", "Contract", "Medical", "Tax", "Letter"]);

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 8 },
  fileFilter(_req, file, cb) {
    const ok = ["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype);
    cb(ok ? null : new Error("Only JPG and PNG images are supported"), ok);
  },
});

const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID?.trim();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  ...(workspaceId
    ? { defaultHeaders: { "anthropic-workspace-id": workspaceId } }
    : {}),
});

if (!workspaceId) {
  console.warn(
    "ANTHROPIC_WORKSPACE_ID is not set. Multi-workspace API keys require it (Settings → Workspaces in the Claude Console).",
  );
}

function nextRecordId() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `PT-${n}`;
}

function mediaTypeFor(file) {
  if (file.mimetype === "image/png") return "image/png";
  return "image/jpeg";
}

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1].trim() : text.trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in model response");
  return JSON.parse(raw.slice(start, end + 1));
}

function buildPrompt(preference) {
  const preferenceHint =
    preference === "native"
      ? "Prefer field values in the document's original language."
      : preference === "both"
        ? "Include English values; if the document is not English, append the original in parentheses."
        : "Translate field values to English when the document is not already in English.";

  return `You are digitizing a scanned paper document for an archive system called Papertrail.
Analyze the attached image(s) of the same document (pages in order) and extract structured metadata.

${preferenceHint}

Respond with ONLY a JSON object (no markdown) matching this shape:
{
  "title": "short human title for the record",
  "type": "Invoice" | "Contract" | "Medical" | "Tax" | "Letter",
  "fields": [{ "label": "string", "value": "string" }],
  "language": "detected language name in English, e.g. English or Japanese",
  "confidence": "detection confidence as a percentage string like 96.2%",
  "pages": number
}

Rules:
- Pick the closest type from the allowed enum.
- Extract 3-8 of the most useful label/value fields (parties, dates, amounts, ids, etc.).
- pages should equal how many page images you received (or a best estimate from content).
- If something is illegible, use an empty string for that value.`;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/detect-language", (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Upload failed" });
    }

    try {
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(500).json({ error: "ANTHROPIC_API_KEY is not configured" });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "An image file is required" });
      }

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 256,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaTypeFor(file),
                  data: file.buffer.toString("base64"),
                },
              },
              {
                type: "text",
                text: `Detect the primary written language on this scanned document page.
Respond with ONLY a JSON object (no markdown):
{ "language": "English name of the language", "confidence": "percentage like 98.4%" }
If the page has little or no text, use language "Unknown" and a low confidence.`,
              },
            ],
          },
        ],
      });

      const text = message.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n");

      let parsed;
      try {
        parsed = extractJson(text);
      } catch {
        return res.status(502).json({
          error: "Failed to parse language detection response",
          raw: text.slice(0, 300),
        });
      }

      return res.json({
        language: typeof parsed.language === "string" ? parsed.language : "Unknown",
        confidence: typeof parsed.confidence === "string" ? parsed.confidence : "—",
      });
    } catch (error) {
      console.error("detect-language error:", error);
      return res.status(502).json({
        error: error instanceof Error ? error.message : "Language detection failed",
      });
    }
  });
});

app.post("/api/process", (req, res) => {
  upload.array("files", 8)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Upload failed" });
    }

    try {
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(500).json({ error: "ANTHROPIC_API_KEY is not configured" });
      }

      const files = req.files ?? [];
      if (files.length === 0) {
        return res.status(400).json({ error: "At least one image file is required" });
      }

      const preference = ["english", "native", "both"].includes(req.body?.preference)
        ? req.body.preference
        : "english";

      const imageBlocks = files.map((file) => ({
        type: "image",
        source: {
          type: "base64",
          media_type: mediaTypeFor(file),
          data: file.buffer.toString("base64"),
        },
      }));

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: [...imageBlocks, { type: "text", text: buildPrompt(preference) }],
          },
        ],
      });

      const text = message.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n");

      let parsed;
      try {
        parsed = extractJson(text);
      } catch {
        return res.status(502).json({
          error: "Failed to parse Claude Vision response as JSON",
          raw: text.slice(0, 500),
        });
      }

      const type = DOC_TYPES.has(parsed.type) ? parsed.type : "Letter";
      const fields = Array.isArray(parsed.fields)
        ? parsed.fields
            .filter((f) => f && typeof f.label === "string")
            .map((f) => ({
              label: String(f.label),
              value: f.value == null ? "" : String(f.value),
            }))
        : [];

      const id = nextRecordId();
      const record = {
        id,
        type,
        title: typeof parsed.title === "string" && parsed.title.trim()
          ? parsed.title.trim()
          : files[0].originalname.replace(/\.[^.]+$/, ""),
        status: "Digitized",
        pages: Number.isFinite(Number(parsed.pages)) ? Math.max(1, Math.round(Number(parsed.pages))) : files.length,
        box: "00",
        completionLabel: "Completed",
        fields,
        annotations: [],
        comments: [],
        language: typeof parsed.language === "string" ? parsed.language : "Unknown",
        confidence: typeof parsed.confidence === "string" ? parsed.confidence : "—",
      };

      return res.json(record);
    } catch (error) {
      console.error("process error:", error);
      return res.status(502).json({
        error: error instanceof Error ? error.message : "Claude Vision request failed",
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Papertrail API listening on http://localhost:${PORT}`);
});
