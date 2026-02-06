/**
 * Atualiza image_url e textos (excerpt, fullExcerpt) dos contos pré-cadastrados.
 * Use quando o banco já existir: corrige imagem (ex.: A Viagem de Verão) e aplica textos expandidos.
 * Uso: node server/scripts/update-story-images.js
 * (Execute a partir da raiz do projeto.)
 */
import { getStoryById, updateStory, SEED_IMAGES, SEED_TEXTS } from "../db.js";

let updated = 0;
for (const id of Object.keys(SEED_IMAGES)) {
  const story = await getStoryById(id);
  if (story) {
    const texts = SEED_TEXTS[id];
    const payload = {
      imageUrl: SEED_IMAGES[id],
      ...(texts ? { excerpt: texts.excerpt, fullExcerpt: texts.fullExcerpt } : {}),
    };
    await updateStory(id, payload);
    updated++;
    console.log(`OK: ${id} -> imagem e texto atualizados`);
  }
}
console.log(`\n${updated} conto(s) atualizado(s).`);
