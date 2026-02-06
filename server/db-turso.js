/**
 * Banco Turso (libsql) para Vercel serverless. Use quando VERCEL=1 e TURSO_DATABASE_URL estiver definido.
 * API async; mesmo esquema e funções que db-sqlite.
 */
import { createClient } from "@libsql/client";
import { randomUUID } from "crypto";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

function getClient() {
  if (!url) throw new Error("TURSO_DATABASE_URL não definido. Configure na Vercel para a API funcionar.");
  return createClient({ url, authToken: authToken || undefined });
}

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    access_type TEXT NOT NULL CHECK(access_type IN ('lifetime', 'per_story')),
    is_admin INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS user_stories (
    user_id TEXT NOT NULL,
    story_id TEXT NOT NULL,
    purchased_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, story_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_user_stories_user ON user_stories(user_id)`,
  `CREATE TABLE IF NOT EXISTS stories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    full_excerpt TEXT NOT NULL,
    category TEXT NOT NULL,
    read_time TEXT NOT NULL,
    price REAL,
    is_premium INTEGER NOT NULL DEFAULT 1,
    image_url TEXT,
    media_url TEXT,
    media_type TEXT CHECK(media_type IN ('image', 'video', 'audio')),
    tags TEXT NOT NULL DEFAULT '[]',
    published_at TEXT NOT NULL,
    views INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`,
];

let schemaPromise;
async function ensureSchema() {
  if (!schemaPromise) {
    const client = getClient();
    for (const sql of schemaStatements) {
      await client.execute(sql);
    }
    try {
      await client.execute("ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0");
    } catch (_) {}
    schemaPromise = Promise.resolve();
  }
  return schemaPromise;
}

function rowToStory(row) {
  if (!row) return null;
  let tags = [];
  try {
    tags = JSON.parse(row.tags || "[]");
  } catch (_) {}
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    fullExcerpt: row.full_excerpt,
    category: row.category,
    readTime: row.read_time,
    price: row.price != null ? row.price : undefined,
    isPremium: Boolean(row.is_premium),
    imageUrl: row.image_url || "",
    mediaUrl: row.media_url || undefined,
    mediaType: row.media_type || undefined,
    tags,
    publishedAt: row.published_at,
    views: row.views || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const SEED_IMAGES = {
  "o-encontro-as-escuras": "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80",
  "segredos-do-escritorio": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  "a-viagem-de-verao": "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=800",
  "cartas-de-amor-proibido": "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&q=80",
  "a-danca-da-meia-noite": "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80",
  "confissoes-ao-luar": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
};

export const SEED_TEXTS = {
  "o-encontro-as-escuras": { excerpt: "Uma noite de mistério em um hotel de luxo. Ela não sabia quem a esperava, mas o desejo era irresistível...", fullExcerpt: "A chuva batia suavemente contra as janelas do Grand Hotel Riviera..." },
  "segredos-do-escritorio": { excerpt: "O que acontece entre reuniões e corredores vazios...", fullExcerpt: "Era sempre depois das sete da noite que o escritório se transformava..." },
  "a-viagem-de-verao": { excerpt: "Uma cabana isolada, dois desconhecidos...", fullExcerpt: "A cabana surgiu como uma miragem entre as árvores..." },
  "cartas-de-amor-proibido": { excerpt: "Palavras que não poderiam ser ditas em voz alta...", fullExcerpt: "A primeira carta chegou numa terça-feira comum..." },
  "a-danca-da-meia-noite": { excerpt: "No baile de máscaras, identidades se perdem...", fullExcerpt: "O salão do Palácio Vermelho fervilhava de máscaras..." },
  "confissoes-ao-luar": { excerpt: "À beira do mar, sob as estrelas...", fullExcerpt: "A praia estava deserta quando Juliana tirou os sapatos..." },
};

export async function createUser(email, passwordHash, accessType = "per_story", isAdmin = false) {
  await ensureSchema();
  const id = randomUUID();
  const client = getClient();
  await client.execute({
    sql: "INSERT INTO users (id, email, password_hash, access_type, is_admin) VALUES (?, ?, ?, ?, ?)",
    args: [id, email.toLowerCase().trim(), passwordHash, accessType, isAdmin ? 1 : 0],
  });
  return { id, email: email.toLowerCase().trim(), access_type: accessType, is_admin: isAdmin };
}

export async function findUserByEmail(email) {
  await ensureSchema();
  const client = getClient();
  const r = await client.execute({
    sql: "SELECT id, email, password_hash, access_type, is_admin, created_at FROM users WHERE email = ?",
    args: [email.toLowerCase().trim()],
  });
  const row = r.rows[0];
  if (row) row.is_admin = Boolean(row.is_admin);
  return row ?? null;
}

export async function findUserById(id) {
  await ensureSchema();
  const client = getClient();
  const r = await client.execute({
    sql: "SELECT id, email, access_type, is_admin, created_at FROM users WHERE id = ?",
    args: [id],
  });
  const row = r.rows[0];
  if (row) row.is_admin = Boolean(row.is_admin);
  return row ?? null;
}

export async function addStoryAccess(userId, storyId) {
  await ensureSchema();
  const client = getClient();
  await client.execute({
    sql: "INSERT OR IGNORE INTO user_stories (user_id, story_id) VALUES (?, ?)",
    args: [userId, storyId],
  });
}

export async function hasStoryAccess(userId, storyId) {
  const user = await findUserById(userId);
  if (!user) return false;
  if (user.access_type === "lifetime") return true;
  await ensureSchema();
  const client = getClient();
  const r = await client.execute({
    sql: "SELECT 1 FROM user_stories WHERE user_id = ? AND story_id = ?",
    args: [userId, storyId],
  });
  return r.rows.length > 0;
}

export async function getUserPurchasedStories(userId) {
  await ensureSchema();
  const client = getClient();
  const r = await client.execute({
    sql: "SELECT story_id FROM user_stories WHERE user_id = ?",
    args: [userId],
  });
  return r.rows.map((row) => row.story_id);
}

export async function listStories() {
  await ensureSchema();
  const client = getClient();
  const r = await client.execute("SELECT * FROM stories ORDER BY published_at DESC, created_at DESC");
  return r.rows.map((row) => rowToStory(row));
}

export async function getStoryById(id) {
  await ensureSchema();
  const client = getClient();
  const r = await client.execute({ sql: "SELECT * FROM stories WHERE id = ?", args: [id] });
  return rowToStory(r.rows[0] ?? null);
}

export async function createStory(data) {
  const slug = (data.title || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const id = (data.id || "").trim() || (slug ? `${slug}-${randomUUID().slice(0, 8)}` : randomUUID());
  const tags = JSON.stringify(Array.isArray(data.tags) ? data.tags : []);
  await ensureSchema();
  const client = getClient();
  await client.execute({
    sql: `INSERT INTO stories (id, title, excerpt, full_excerpt, category, read_time, price, is_premium, image_url, media_url, media_type, tags, published_at, views)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id, data.title || "", data.excerpt || "", data.fullExcerpt || data.full_excerpt || "",
      data.category || "", data.readTime || data.read_time || "0 min",
      data.price != null ? data.price : null, data.isPremium !== false ? 1 : 0,
      data.imageUrl || data.image_url || null, data.mediaUrl || data.media_url || null, data.mediaType || data.media_type || null,
      tags, data.publishedAt || data.published_at || new Date().toISOString().slice(0, 10), data.views != null ? data.views : 0,
    ],
  });
  return getStoryById(id);
}

export async function updateStory(id, data) {
  const existing = await getStoryById(id);
  if (!existing) return null;
  const tags = JSON.stringify(Array.isArray(data.tags) ? data.tags : existing.tags);
  await ensureSchema();
  const client = getClient();
  await client.execute({
    sql: `UPDATE stories SET title = ?, excerpt = ?, full_excerpt = ?, category = ?, read_time = ?, price = ?, is_premium = ?, image_url = ?, media_url = ?, media_type = ?, tags = ?, published_at = ?, views = ?, updated_at = datetime('now') WHERE id = ?`,
    args: [
      data.title ?? existing.title, data.excerpt ?? existing.excerpt, data.fullExcerpt ?? data.full_excerpt ?? existing.fullExcerpt,
      data.category ?? existing.category, data.readTime ?? data.read_time ?? existing.readTime,
      data.price != null ? data.price : existing.price, data.isPremium !== undefined ? (data.isPremium ? 1 : 0) : (existing.isPremium ? 1 : 0),
      data.imageUrl ?? data.image_url ?? existing.imageUrl, data.mediaUrl ?? data.media_url ?? existing.mediaUrl, data.mediaType ?? data.media_type ?? existing.mediaType,
      tags, data.publishedAt ?? data.published_at ?? existing.publishedAt, data.views != null ? data.views : existing.views, id,
    ],
  });
  return getStoryById(id);
}

export async function deleteStory(id) {
  await ensureSchema();
  const client = getClient();
  await client.execute({ sql: "DELETE FROM stories WHERE id = ?", args: [id] });
  return true;
}

export async function setUserAdmin(userId, isAdmin = true) {
  await ensureSchema();
  const client = getClient();
  await client.execute({ sql: "UPDATE users SET is_admin = ? WHERE id = ?", args: [isAdmin ? 1 : 0, userId] });
}

export async function setAdminByEmail(email) {
  const user = await findUserByEmail(email);
  if (!user) return false;
  await setUserAdmin(user.id, true);
  return true;
}

export async function updatePasswordByEmail(email, passwordHash) {
  await ensureSchema();
  const client = getClient();
  const r = await client.execute({ sql: "UPDATE users SET password_hash = ? WHERE email = ?", args: [passwordHash, email.toLowerCase().trim()] });
  return r.rowsAffected > 0;
}

export async function countStories() {
  await ensureSchema();
  const client = getClient();
  const r = await client.execute("SELECT COUNT(*) as n FROM stories");
  return Number(r.rows[0]?.n ?? 0);
}

export async function seedStoriesIfEmpty() {
  const n = await countStories();
  if (n > 0) return;
  const defaults = [
    { id: "o-encontro-as-escuras", title: "O Encontro às Escuras", ...SEED_TEXTS["o-encontro-as-escuras"], category: "Romance", readTime: "12 min", price: 8.9, isPremium: false, tags: ["romance", "mistério", "hotel", "encontro"], publishedAt: "2024-01-15", views: 2847, imageUrl: SEED_IMAGES["o-encontro-as-escuras"] },
    { id: "segredos-do-escritorio", title: "Segredos do Escritório", ...SEED_TEXTS["segredos-do-escritorio"], category: "Suspense", readTime: "18 min", price: 8.9, isPremium: true, tags: ["suspense", "escritório", "tensão", "proibido"], publishedAt: "2024-01-20", views: 4521, imageUrl: SEED_IMAGES["segredos-do-escritorio"] },
    { id: "a-viagem-de-verao", title: "A Viagem de Verão", ...SEED_TEXTS["a-viagem-de-verao"], category: "Aventura", readTime: "25 min", price: 8.9, isPremium: true, tags: ["aventura", "cabana", "tempestade", "verão"], publishedAt: "2024-02-01", views: 3892, imageUrl: SEED_IMAGES["a-viagem-de-verao"] },
    { id: "cartas-de-amor-proibido", title: "Cartas de Amor Proibido", ...SEED_TEXTS["cartas-de-amor-proibido"], category: "Drama", readTime: "15 min", price: 8.9, isPremium: false, tags: ["drama", "cartas", "proibido", "paixão"], publishedAt: "2024-02-10", views: 2156, imageUrl: SEED_IMAGES["cartas-de-amor-proibido"] },
    { id: "a-danca-da-meia-noite", title: "A Dança da Meia-Noite", ...SEED_TEXTS["a-danca-da-meia-noite"], category: "Fantasia", readTime: "20 min", price: 8.9, isPremium: true, tags: ["fantasia", "baile", "máscaras", "mistério"], publishedAt: "2024-02-20", views: 5234, imageUrl: SEED_IMAGES["a-danca-da-meia-noite"] },
    { id: "confissoes-ao-luar", title: "Confissões ao Luar", ...SEED_TEXTS["confissoes-ao-luar"], category: "Romance", readTime: "10 min", price: 8.9, isPremium: false, tags: ["romance", "praia", "reencontro", "confissão"], publishedAt: "2024-03-01", views: 1987, imageUrl: SEED_IMAGES["confissoes-ao-luar"] },
  ];
  for (const d of defaults) {
    await createStory(d);
  }
}

/** Nenhum código usa o default do db; o loader reexporta para compatibilidade com db-sqlite. */
export default null;
