import "dotenv/config";
import express from "express";
import multer from "multer";
import Anthropic from "@anthropic-ai/sdk";
import {
  initDb,
  listRecords,
  getRecordById,
  getPageById,
  insertRecordWithPages,
  deleteRecordsByIds,
} from "./db.js";

const PORT = Number(process.env.PORT) || 3001;
const DOC_TYPES = new Set(["Invoice", "Contract", "Medical", "Tax", "Letter"]);

const app = express();

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, anthropic-workspace-id",
    );
  }
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});

app.use(express.json({ limit: "1mb" }));
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

app.get("/api/records", async (_req, res) => {
  try {
    const records = await listRecords();
    res.json(records);
  } catch (error) {
    console.error("list records error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to list records",
    });
  }
});

app.get("/api/records/:id", async (req, res) => {
  try {
    const record = await getRecordById(req.params.id);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  } catch (error) {
    console.error("get record error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to get record",
    });
  }
});


app.delete("/api/records", async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids.filter((id) => typeof id === "string" && id.trim())
      : [];
    if (ids.length === 0) {
      return res.status(400).json({ error: "Provide at least one record id" });
    }
    const deleted = await deleteRecordsByIds(ids);
    res.json({ deleted });
  } catch (error) {
    console.error("delete records error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to delete records",
    });
  }
});

app.get("/api/pages/:id", async (req, res) => {
  try {
    const page = await getPageById(req.params.id);
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.setHeader("Content-Type", page.mime_type);
    res.setHeader("Cache-Control", "private, max-age=3600");
    if (page.filename) {
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${String(page.filename).replace(/"/g, "")}"`,
      );
    }
    res.send(page.data);
  } catch (error) {
    console.error("get page error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to get page",
    });
  }
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
        model: "claude-haiku-4-5",
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

      const requestedId =
        typeof req.body?.recordId === "string" && /^PT-\d{4}$/.test(req.body.recordId)
          ? req.body.recordId
          : nextRecordId();

      const imageBlocks = files.map((file) => ({
        type: "image",
        source: {
          type: "base64",
          media_type: mediaTypeFor(file),
          data: file.buffer.toString("base64"),
        },
      }));

      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5",
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

      const record = {
        id: requestedId,
        type,
        title:
          typeof parsed.title === "string" && parsed.title.trim()
            ? parsed.title.trim()
            : files[0].originalname.replace(/\.[^.]+$/, ""),
        status: "Digitized",
        pages: Number.isFinite(Number(parsed.pages))
          ? Math.max(1, Math.round(Number(parsed.pages)))
          : files.length,
        box: "00",
        completionLabel: "Completed",
        fields,
        annotations: [],
        comments: [],
        language: typeof parsed.language === "string" ? parsed.language : "Unknown",
        confidence: typeof parsed.confidence === "string" ? parsed.confidence : "—",
      };

      const saved = await insertRecordWithPages(record, files);
      return res.json(saved);
    } catch (error) {
      console.error("process error:", error);
      return res.status(502).json({
        error: error instanceof Error ? error.message : "Claude Vision request failed",
      });
    }
  });
});

await initDb();
app.listen(PORT, () => {
  console.log(`Papertrail API listening on http://localhost:${PORT}`);
});
