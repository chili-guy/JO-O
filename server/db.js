/**
 * Loader: na Vercel usa apenas db-vercel (Turso ou memória; nunca SQLite).
 * Local usa db-sqlite. Fallback para db-vercel se SQLite falhar (ex.: serverless sem binário nativo).
 */
let mod;
if (process.env.VERCEL === "1") {
  mod = await import("./db-vercel.js");
} else {
  try {
    mod = await import("./db-sqlite.js");
  } catch (e) {
    console.warn("db-sqlite indisponível, usando db-vercel (memória):", e?.message || e);
    mod = await import("./db-vercel.js");
  }
}

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
