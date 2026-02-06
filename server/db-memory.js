/**
 * Banco em memória (pure JS) para Vercel quando Turso não está configurado.
 * Evita carregar better-sqlite3 (módulo nativo que falha no serverless).
 * Dados efêmeros: recriados a cada cold start.
 */
import { randomUUID } from "crypto";

const users = new Map();
const usersByEmail = new Map();
const userStories = new Set();
const stories = new Map();

function norm(s) {
  return (s || "").toString().toLowerCase().trim();
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
  "o-encontro-as-escuras": { excerpt: "Uma noite de mistério em um hotel de luxo.", fullExcerpt: "Uma noite de mistério em um hotel de luxo. Ela não sabia quem a esperava, mas o desejo era irresistível." },
  "segredos-do-escritorio": { excerpt: "O que acontece entre reuniões e corredores vazios.", fullExcerpt: "O que acontece entre reuniões e corredores vazios. Uma tensão que não pode mais ser ignorada." },
  "a-viagem-de-verao": { excerpt: "Uma cabana isolada, dois desconhecidos, e uma tempestade.", fullExcerpt: "Uma cabana isolada, dois desconhecidos, e uma tempestade que mudaria tudo." },
  "cartas-de-amor-proibido": { excerpt: "Palavras que não poderiam ser ditas em voz alta.", fullExcerpt: "Palavras que não poderiam ser ditas em voz alta. Um romance epistolar que atravessa limites." },
  "a-danca-da-meia-noite": { excerpt: "No baile de máscaras, identidades se perdem e desejos se revelam.", fullExcerpt: "No baile de máscaras, identidades se perdem e desejos se revelam. Uma noite para esquecer quem você é." },
  "confissoes-ao-luar": { excerpt: "À beira do mar, sob as estrelas, dois corações revelam o que esconderam.", fullExcerpt: "À beira do mar, sob as estrelas, dois corações finalmente revelam o que sempre esconderam." },
};

function toStoryRow(s) {
  if (!s) return null;
  return {
    id: s.id,
    title: s.title,
    excerpt: s.excerpt,
    fullExcerpt: s.fullExcerpt,
    category: s.category,
    readTime: s.readTime,
    price: s.price,
    isPremium: Boolean(s.isPremium),
    imageUrl: s.imageUrl || "",
    mediaUrl: s.mediaUrl,
    mediaType: s.mediaType,
    tags: Array.isArray(s.tags) ? s.tags : [],
    publishedAt: s.publishedAt,
    views: s.views || 0,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export async function createUser(email, passwordHash, accessType = "per_story", isAdmin = false) {
  const id = randomUUID();
  const e = norm(email);
  const u = { id, email: e, password_hash: passwordHash, access_type: accessType, is_admin: !!isAdmin, created_at: new Date().toISOString() };
  users.set(id, u);
  usersByEmail.set(e, u);
  return { id, email: u.email, access_type: accessType, is_admin: isAdmin };
}

export async function findUserByEmail(email) {
  const u = usersByEmail.get(norm(email));
  if (!u) return null;
  return { ...u, is_admin: Boolean(u.is_admin) };
}

export async function findUserById(id) {
  const u = users.get(id);
  if (!u) return null;
  const { password_hash, ...rest } = u;
  return { ...rest, is_admin: Boolean(u.is_admin) };
}

export async function addStoryAccess(userId, storyId) {
  userStories.add(`${userId}|${storyId}`);
}

export async function hasStoryAccess(userId, storyId) {
  const u = users.get(userId);
  if (!u) return false;
  if (u.access_type === "lifetime") return true;
  return userStories.has(`${userId}|${storyId}`);
}

export async function getUserPurchasedStories(userId) {
  const out = [];
  for (const key of userStories) {
    if (key.startsWith(userId + "|")) out.push(key.split("|")[1]);
  }
  return out;
}

export async function listStories() {
  const list = Array.from(stories.values()).sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || "") || (b.createdAt || "").localeCompare(a.createdAt || ""));
  return list.map(toStoryRow);
}

export async function getStoryById(id) {
  return toStoryRow(stories.get(id));
}

export async function createStory(data) {
  const now = new Date().toISOString();
  const id = (data.id || "").trim() || randomUUID();
  const s = {
    id,
    title: data.title || "",
    excerpt: data.excerpt || "",
    fullExcerpt: data.fullExcerpt || data.full_excerpt || "",
    category: data.category || "",
    readTime: data.readTime || data.read_time || "0 min",
    price: data.price != null ? data.price : null,
    isPremium: data.isPremium !== false,
    imageUrl: data.imageUrl || data.image_url || "",
    mediaUrl: data.mediaUrl || data.media_url,
    mediaType: data.mediaType || data.media_type,
    tags: Array.isArray(data.tags) ? data.tags : [],
    publishedAt: data.publishedAt || data.published_at || now.slice(0, 10),
    views: data.views != null ? data.views : 0,
    createdAt: now,
    updatedAt: now,
  };
  stories.set(id, s);
  return toStoryRow(s);
}

export async function updateStory(id, data) {
  const existing = stories.get(id);
  if (!existing) return null;
  const s = {
    ...existing,
    title: data.title ?? existing.title,
    excerpt: data.excerpt ?? existing.excerpt,
    fullExcerpt: data.fullExcerpt ?? data.full_excerpt ?? existing.fullExcerpt,
    category: data.category ?? existing.category,
    readTime: data.readTime ?? data.read_time ?? existing.readTime,
    price: data.price != null ? data.price : existing.price,
    isPremium: data.isPremium !== undefined ? !!data.isPremium : existing.isPremium,
    imageUrl: data.imageUrl ?? data.image_url ?? existing.imageUrl,
    mediaUrl: data.mediaUrl ?? data.media_url ?? existing.mediaUrl,
    mediaType: data.mediaType ?? data.media_type ?? existing.mediaType,
    tags: Array.isArray(data.tags) ? data.tags : existing.tags,
    publishedAt: data.publishedAt ?? data.published_at ?? existing.publishedAt,
    views: data.views != null ? data.views : existing.views,
    updatedAt: new Date().toISOString(),
  };
  stories.set(id, s);
  return toStoryRow(s);
}

export async function deleteStory(id) {
  stories.delete(id);
  return true;
}

export async function setUserAdmin(userId, isAdmin = true) {
  const u = users.get(userId);
  if (u) u.is_admin = !!isAdmin;
}

export async function setAdminByEmail(email) {
  const u = usersByEmail.get(norm(email));
  if (!u) return false;
  u.is_admin = true;
  return true;
}

export async function updatePasswordByEmail(email, passwordHash) {
  const u = usersByEmail.get(norm(email));
  if (!u) return false;
  u.password_hash = passwordHash;
  return true;
}

export async function countStories() {
  return stories.size;
}

const DEFAULTS = [
  { id: "o-encontro-as-escuras", title: "O Encontro às Escuras", ...SEED_TEXTS["o-encontro-as-escuras"], category: "Romance", readTime: "12 min", price: 8.9, isPremium: false, tags: ["romance", "mistério", "hotel", "encontro"], publishedAt: "2024-01-15", views: 2847, imageUrl: SEED_IMAGES["o-encontro-as-escuras"] },
  { id: "segredos-do-escritorio", title: "Segredos do Escritório", ...SEED_TEXTS["segredos-do-escritorio"], category: "Suspense", readTime: "18 min", price: 8.9, isPremium: true, tags: ["suspense", "escritório", "tensão", "proibido"], publishedAt: "2024-01-20", views: 4521, imageUrl: SEED_IMAGES["segredos-do-escritorio"] },
  { id: "a-viagem-de-verao", title: "A Viagem de Verão", ...SEED_TEXTS["a-viagem-de-verao"], category: "Aventura", readTime: "25 min", price: 8.9, isPremium: true, tags: ["aventura", "cabana", "tempestade", "verão"], publishedAt: "2024-02-01", views: 3892, imageUrl: SEED_IMAGES["a-viagem-de-verao"] },
  { id: "cartas-de-amor-proibido", title: "Cartas de Amor Proibido", ...SEED_TEXTS["cartas-de-amor-proibido"], category: "Drama", readTime: "15 min", price: 8.9, isPremium: false, tags: ["drama", "cartas", "proibido", "paixão"], publishedAt: "2024-02-10", views: 2156, imageUrl: SEED_IMAGES["cartas-de-amor-proibido"] },
  { id: "a-danca-da-meia-noite", title: "A Dança da Meia-Noite", ...SEED_TEXTS["a-danca-da-meia-noite"], category: "Fantasia", readTime: "20 min", price: 8.9, isPremium: true, tags: ["fantasia", "baile", "máscaras", "mistério"], publishedAt: "2024-02-20", views: 5234, imageUrl: SEED_IMAGES["a-danca-da-meia-noite"] },
  { id: "confissoes-ao-luar", title: "Confissões ao Luar", ...SEED_TEXTS["confissoes-ao-luar"], category: "Romance", readTime: "10 min", price: 8.9, isPremium: false, tags: ["romance", "praia", "reencontro", "confissão"], publishedAt: "2024-03-01", views: 1987, imageUrl: SEED_IMAGES["confissoes-ao-luar"] },
];

export async function seedStoriesIfEmpty() {
  if (stories.size > 0) return;
  for (const d of DEFAULTS) {
    await createStory(d);
  }
}

export default null;
