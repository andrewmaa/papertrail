import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Add a Railway Postgres plugin (or local Postgres) and set DATABASE_URL.",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS records (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      pages INTEGER NOT NULL DEFAULT 1,
      box TEXT NOT NULL DEFAULT '00',
      completion_label TEXT NOT NULL DEFAULT 'Completed',
      fields JSONB NOT NULL DEFAULT '[]'::jsonb,
      annotations JSONB NOT NULL DEFAULT '[]'::jsonb,
      comments JSONB NOT NULL DEFAULT '[]'::jsonb,
      language TEXT,
      confidence TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS record_pages (
      id TEXT PRIMARY KEY,
      record_id TEXT NOT NULL REFERENCES records(id) ON DELETE CASCADE,
      page_index INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      filename TEXT,
      data BYTEA NOT NULL,
      UNIQUE (record_id, page_index)
    );

    CREATE INDEX IF NOT EXISTS record_pages_record_id_idx ON record_pages(record_id);
  `);

}

function storedMimeType(file) {
  if (file.mimetype === "application/pdf") return "application/pdf";
  if (file.mimetype === "image/png") return "image/png";
  return "image/jpeg";
}

function mapRecord(row, pageIds = [], pageTypes = []) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    status: row.status,
    pages: row.pages,
    box: row.box,
    completionLabel: row.completion_label,
    fields: row.fields ?? [],
    annotations: row.annotations ?? [],
    comments: row.comments ?? [],
    language: row.language ?? undefined,
    confidence: row.confidence ?? undefined,
    sourcePreviewUrls: pageIds.map((pageId) => `/api/pages/${pageId}`),
    sourcePreviewTypes: pageTypes,
  };
}

export async function listRecords() {
  const { rows } = await pool.query(
    `SELECT r.*, COALESCE(
       (SELECT json_agg(p.id ORDER BY p.page_index)
        FROM record_pages p WHERE p.record_id = r.id),
       '[]'::json
     ) AS page_ids, COALESCE(
       (SELECT json_agg(p.mime_type ORDER BY p.page_index)
        FROM record_pages p WHERE p.record_id = r.id),
       '[]'::json
     ) AS page_types
     FROM records r
     ORDER BY r.created_at DESC, r.id DESC`,
  );
  return rows.map((row) => mapRecord(row, row.page_ids ?? [], row.page_types ?? []));
}

export async function getRecordById(id) {
  const { rows } = await pool.query("SELECT * FROM records WHERE id = $1", [id]);
  if (rows.length === 0) return null;
  const pages = await pool.query(
    "SELECT id, mime_type FROM record_pages WHERE record_id = $1 ORDER BY page_index",
    [id],
  );
  return mapRecord(
    rows[0],
    pages.rows.map((p) => p.id),
    pages.rows.map((p) => p.mime_type),
  );
}

export async function getPageById(id) {
  const { rows } = await pool.query(
    "SELECT id, mime_type, filename, data FROM record_pages WHERE id = $1",
    [id],
  );
  return rows[0] ?? null;
}

export async function insertRecordWithPages(record, files) {
  const client = await pool.connect();
  const pageIds = [];
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO records (
        id, type, title, status, pages, box, completion_label,
        fields, annotations, comments, language, confidence
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10::jsonb,$11,$12)`,
      [
        record.id,
        record.type,
        record.title,
        record.status,
        record.pages,
        record.box,
        record.completionLabel,
        JSON.stringify(record.fields ?? []),
        JSON.stringify(record.annotations ?? []),
        JSON.stringify(record.comments ?? []),
        record.language ?? null,
        record.confidence ?? null,
      ],
    );

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const pageId = `${record.id}-p${i + 1}`;
      pageIds.push(pageId);
      await client.query(
        `INSERT INTO record_pages (id, record_id, page_index, mime_type, filename, data)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          pageId,
          record.id,
          i,
          storedMimeType(file),
          file.originalname ?? null,
          file.buffer,
        ],
      );
    }

    await client.query("COMMIT");
    return {
      ...record,
      sourcePreviewUrls: pageIds.map((pageId) => `/api/pages/${pageId}`),
      sourcePreviewTypes: files.map(storedMimeType),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteRecordsByIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const { rows } = await pool.query(
    "DELETE FROM records WHERE id = ANY($1::text[]) RETURNING id",
    [ids],
  );
  return rows.map((row) => row.id);
}
