/**
 * Loader:
 * - Vercel + TURSO_DATABASE_URL → Turso (persistente)
 * - Vercel sem Turso → db-memory (pure JS, efêmero; evita better-sqlite3 que falha no serverless)
 * - Local → SQLite (server/data)
 */
const isVercel = process.env.VERCEL === "1";
const useTurso = isVercel && process.env.TURSO_DATABASE_URL;
const useMemory = isVercel && !useTurso;

const mod = useTurso
  ? await import("./db-turso.js")
  : useMemory
    ? await import("./db-memory.js")
    : await import("./db-sqlite.js");

export const createUser = (...a) => mod.createUser(...a);
export const findUserByEmail = (...a) => mod.findUserByEmail(...a);
export const findUserById = (...a) => mod.findUserById(...a);
export const addStoryAccess = (...a) => mod.addStoryAccess(...a);
export const hasStoryAccess = (...a) => mod.hasStoryAccess(...a);
export const getUserPurchasedStories = (...a) => mod.getUserPurchasedStories(...a);
export const listStories = (...a) => mod.listStories(...a);
export const getStoryById = (...a) => mod.getStoryById(...a);
export const createStory = (...a) => mod.createStory(...a);
export const updateStory = (...a) => mod.updateStory(...a);
export const deleteStory = (...a) => mod.deleteStory(...a);
export const setUserAdmin = (...a) => mod.setUserAdmin(...a);
export const setAdminByEmail = (...a) => mod.setAdminByEmail(...a);
export const updatePasswordByEmail = (...a) => mod.updatePasswordByEmail(...a);
export const countStories = (...a) => mod.countStories(...a);
export const seedStoriesIfEmpty = (...a) => mod.seedStoriesIfEmpty(...a);
export const SEED_IMAGES = mod.SEED_IMAGES;
export const SEED_TEXTS = mod.SEED_TEXTS;

export default mod.default;
