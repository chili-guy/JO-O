/**
 * Banco Turso (libsql) para Vercel. Usado quando VERCEL=1 e TURSO_DATABASE_URL estão definidos.
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

let schemaDone = false;
async function ensureSchema() {
  if (schemaDone) return;
  const client = getClient();
  for (const sql of schemaStatements) {
    await client.execute(sql);
  }
  try {
    await client.execute("ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0");
  } catch (_) {}
  schemaDone = true;
}

function rowToObj(row, columns) {
  if (!row || !columns) return null;
  const o = {};
  for (let i = 0; i < columns.length; i++) o[columns[i]] = row[i];
  return o;
}

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
  if (!row) return null;
  const o = rowToObj(row, r.columns);
  if (o) o.is_admin = Boolean(o.is_admin);
  return o;
}

export async function findUserById(id) {
  await ensureSchema();
  const client = getClient();
  const r = await client.execute({
    sql: "SELECT id, email, access_type, is_admin, created_at FROM users WHERE id = ?",
    args: [id],
  });
  const row = r.rows[0];
  if (!row) return null;
  const o = rowToObj(row, r.columns);
  if (o) o.is_admin = Boolean(o.is_admin);
  return o;
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
  const col = r.columns.indexOf("story_id");
  return r.rows.map((row) => row[col]);
}

function rowToStory(row, columns) {
  if (!row || !columns.length) return null;
  const o = {};
  for (let i = 0; i < columns.length; i++) o[columns[i]] = row[i];
  let tags = [];
  try {
    tags = JSON.parse(o.tags || "[]");
  } catch (_) {}
  return {
    id: o.id,
    title: o.title,
    excerpt: o.excerpt,
    fullExcerpt: o.full_excerpt,
    category: o.category,
    readTime: o.read_time,
    price: o.price != null ? o.price : undefined,
    isPremium: Boolean(o.is_premium),
    imageUrl: o.image_url || "",
    mediaUrl: o.media_url || undefined,
    mediaType: o.media_type || undefined,
    tags,
    publishedAt: o.published_at,
    views: o.views || 0,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  };
}

export async function listStories() {
  await ensureSchema();
  const client = getClient();
  const r = await client.execute(
    "SELECT * FROM stories ORDER BY published_at DESC, created_at DESC"
  );
  return r.rows.map((row) => rowToStory(row, r.columns));
}

export async function getStoryById(id) {
  await ensureSchema();
  const client = getClient();
  const r = await client.execute({ sql: "SELECT * FROM stories WHERE id = ?", args: [id] });
  return rowToStory(r.rows[0], r.columns);
}

export async function createStory(data) {
  await ensureSchema();
  const slug = (data.title || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const id = (data.id || "").trim() || (slug ? `${slug}-${randomUUID().slice(0, 8)}` : randomUUID());
  const tags = JSON.stringify(Array.isArray(data.tags) ? data.tags : []);
  const client = getClient();
  await client.execute({
    sql: `INSERT INTO stories (
      id, title, excerpt, full_excerpt, category, read_time, price, is_premium,
      image_url, media_url, media_type, tags, published_at, views
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      data.title || "",
      data.excerpt || "",
      data.fullExcerpt || data.full_excerpt || "",
      data.category || "",
      data.readTime || data.read_time || "0 min",
      data.price != null ? data.price : null,
      data.isPremium !== false ? 1 : 0,
      data.imageUrl || data.image_url || null,
      data.mediaUrl || data.media_url || null,
      data.mediaType || data.media_type || null,
      tags,
      data.publishedAt || data.published_at || new Date().toISOString().slice(0, 10),
      data.views != null ? data.views : 0,
    ],
  });
  return getStoryById(id);
}

export async function updateStory(id, data) {
  const existing = await getStoryById(id);
  if (!existing) return null;
  const tags = JSON.stringify(Array.isArray(data.tags) ? data.tags : existing.tags);
  const client = getClient();
  await client.execute({
    sql: `UPDATE stories SET
      title = ?, excerpt = ?, full_excerpt = ?, category = ?, read_time = ?,
      price = ?, is_premium = ?, image_url = ?, media_url = ?, media_type = ?,
      tags = ?, published_at = ?, views = ?, updated_at = datetime('now')
    WHERE id = ?`,
    args: [
      data.title ?? existing.title,
      data.excerpt ?? existing.excerpt,
      data.fullExcerpt ?? data.full_excerpt ?? existing.fullExcerpt,
      data.category ?? existing.category,
      data.readTime ?? data.read_time ?? existing.readTime,
      data.price != null ? data.price : existing.price,
      data.isPremium !== undefined ? (data.isPremium ? 1 : 0) : (existing.isPremium ? 1 : 0),
      data.imageUrl ?? data.image_url ?? existing.imageUrl,
      data.mediaUrl ?? data.media_url ?? existing.mediaUrl,
      data.mediaType ?? data.media_type ?? existing.mediaType,
      tags,
      data.publishedAt ?? data.published_at ?? existing.publishedAt,
      data.views != null ? data.views : existing.views,
      id,
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
  await client.execute({
    sql: "UPDATE users SET is_admin = ? WHERE id = ?",
    args: [isAdmin ? 1 : 0, userId],
  });
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
  const r = await client.execute({
    sql: "UPDATE users SET password_hash = ? WHERE email = ?",
    args: [passwordHash, email.toLowerCase().trim()],
  });
  return (r.rowsAffected || 0) > 0;
}

export async function countStories() {
  await ensureSchema();
  const client = getClient();
  const r = await client.execute("SELECT COUNT(*) as n FROM stories");
  const row = r.rows[0];
  return row ? row[0] : 0;
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
  "o-encontro-as-escuras": {
    excerpt: "Uma noite de mistério em um hotel de luxo. Ela não sabia quem a esperava, mas o desejo era irresistível...",
    fullExcerpt: `A chuva batia suavemente contra as janelas do Grand Hotel Riviera, criando uma melodia hipnótica que ecoava pelo corredor vazio do décimo andar. Marina ajustou o vestido de seda preta, sentindo o tecido deslizar sobre sua pele como uma carícia antecipada.

O bilhete dizia apenas: "Suíte 1012. Meia-noite. Não pergunte. Apenas venha."

Ela não deveria estar ali. Mulheres sensatas não seguem bilhetes anônimos deixados em sua mesa de trabalho. Mas havia algo naquela caligrafia elegante, naquele convite sussurrado no papel cor de champagne, que despertou uma curiosidade que há muito tempo jazia adormecida.

A porta da suíte estava entreaberta, revelando apenas uma fenda de luz dourada. O coração de Marina acelerou quando seus dedos tocaram a madeira fria. Do outro lado, velas tremulavam, lançando sombras dançantes pelas paredes revestidas de veludo bordô.

"Entre", disse uma voz masculina, grave e sedutora como o próprio pecado. "Eu estava esperando por você..."

E quando ela cruzou aquele limiar, Marina soube que nada em sua vida seria como antes.`,
  },
  "segredos-do-escritorio": {
    excerpt: "O que acontece entre reuniões e corredores vazios. Uma tensão que não pode mais ser ignorada...",
    fullExcerpt: `Era sempre depois das sete da noite que o escritório se transformava. As luzes fluorescentes davam lugar à penumbra suave, os teclados silenciavam, e apenas dois corações continuavam batendo naquele andar deserto.

Camila fingia revisar relatórios enquanto observava Ricardo pela divisória de vidro. Ele afrouxava a gravata, passava a mão pelos cabelos escuros, e ela se perguntava como seria sentir aqueles dedos percorrendo...

"Trabalhando até tarde de novo, Camila?"

A voz dele, tão perto, fez seu coração saltar. Quando ela se virou, Ricardo estava apoiado na entrada de sua sala, os olhos escuros fixos nos dela com uma intensidade que não deixava dúvidas sobre seus pensamentos.

"Alguém precisa terminar o relatório do Hoffman", ela respondeu, a voz mais rouca do que pretendia.

Ele fechou a porta atrás de si. O clique da fechadura ecoou como uma promessa.

"O Hoffman pode esperar", disse ele, aproximando-se. "Mas eu... eu já esperei tempo demais."

E quando os lábios dele finalmente encontraram os dela, Camila entendeu por que todas aquelas noites extras valeram a pena.`,
  },
  "a-viagem-de-verao": {
    excerpt: "Uma cabana isolada, dois desconhecidos, e uma tempestade que mudaria tudo. O calor do verão não era nada comparado ao que os esperava...",
    fullExcerpt: `A cabana surgiu como uma miragem entre as árvores, pequena e acolhedora, com fumaça saindo da chaminé. Ana não esperava encontrar alguém ali – muito menos alguém como ele.

Lucas estava cortando lenha quando ela chegou, encharcada pela tempestade que desabara sem aviso. Os músculos de seus braços se contraíam a cada golpe do machado, e gotas de suor – ou seria chuva? – escorriam pelo peito descoberto.

"Você está completamente molhada", ele disse, os olhos percorrendo seu corpo de uma forma que a fez esquecer do frio.

"Meu carro quebrou na estrada. Não consegui sinal..."

Ele abriu a porta da cabana com um sorriso que prometia problemas.

"Entre. Precisa tirar essas roupas antes que pegue um resfriado."

Dentro, a lareira crepitava, lançando sombras alaranjadas pelas paredes de madeira. Lucas entregou uma toalha a ela, os dedos roçando os seus por um momento a mais do que o necessário.

"O tempo diz que a tempestade vai durar a noite toda", ele murmurou. "Parece que você está presa aqui... comigo."

E Ana descobriu que existem tempestades muito mais intensas do que aquela que rugia lá fora.`,
  },
  "cartas-de-amor-proibido": {
    excerpt: "Palavras que não poderiam ser ditas em voz alta. Um romance epistolar que atravessa limites...",
    fullExcerpt: `A primeira carta chegou numa terça-feira comum, escondida entre contas e propagandas. O envelope era de papel italiano, o endereço escrito à mão com tinta sépia.

"Para você, que entende o que é desejar o impossível..."

Helena releu aquela linha dezenas de vezes. Quem conhecia seus segredos mais íntimos? Quem sabia sobre os pensamentos que a assombravam nas noites solitárias?

A carta descrevia um sonho – ou seria uma memória? – de dois corpos entrelaçados sob a luz da lua. Palavras que pintavam cenas tão vívidas que Helena podia sentir o calor daquelas mãos imaginárias em sua pele.

Ela não deveria responder. Era uma mulher comprometida, respeitável, dona de uma vida perfeitamente organizada. Mas seus dedos já buscavam a caneta, como se tivessem vontade própria.

"Para você, que escreve como se me conhecesse... como descobriu o que minha alma não ousa confessar?"

E assim começou uma dança de palavras que incendiaria duas vidas, carta após carta, confissão após confissão, até que as páginas já não bastassem para conter o que crescia entre eles.`,
  },
  "a-danca-da-meia-noite": {
    excerpt: "No baile de máscaras, identidades se perdem e desejos se revelam. Uma noite para esquecer quem você é...",
    fullExcerpt: `O salão do Palácio Vermelho fervilhava de máscaras e segredos. Cristais pendiam do teto como estrelas capturadas, e a orquestra tocava uma valsa que parecia ter sido composta para amantes proibidos.

Isabella ajustou sua máscara de plumas negras, observando a multidão de rostos escondidos. Ali, naquela noite, ela não era a herdeira dos Monteiro. Era apenas uma mulher em busca de algo que não conseguia nomear.

Foi quando o viu. Alto, vestido de preto absoluto, com uma máscara de lobo prateado que deixava apenas seus lábios à mostra. Lábios que curvaram num sorriso quando seus olhares se encontraram através do salão lotado.

Ele estendeu a mão sem dizer palavra. Isabella a aceitou sem questionar.

Dançaram em silêncio, corpos cada vez mais próximos, respirações cada vez mais curtas. A mão dele desceu de suas costas para sua cintura, depois mais abaixo, num movimento que arrancou um suspiro de seus lábios.

"Quem é você?", ela perguntou quando a música parou.

Ele se inclinou até que seus lábios roçassem sua orelha.

"Sou o homem que vai fazer você esquecer todos os outros. Mas só até a meia-noite. Depois, seremos estranhos novamente."

O relógio marcava onze horas. Isabella tinha sessenta minutos para viver tudo que havia negado a si mesma.`,
  },
  "confissoes-ao-luar": {
    excerpt: "À beira do mar, sob as estrelas, dois corações finalmente revelam o que sempre esconderam...",
    fullExcerpt: `A praia estava deserta quando Juliana tirou os sapatos e deixou a areia fria acariciar seus pés. A lua cheia pintava o mar de prata, e o silêncio era quebrado apenas pelo sussurro das ondas.

"Eu sabia que te encontraria aqui."

A voz de Pedro a fez fechar os olhos. Depois de todos esses anos, ele ainda tinha o poder de fazer seu coração parar.

"Como você sabia?", ela perguntou sem se virar.

"Porque esse sempre foi o nosso lugar." Ele se aproximou até que ela pudesse sentir o calor de seu corpo. "Quinze anos, Juliana. Quinze anos fingindo que aquela noite não existiu."

Ela finalmente o encarou. Os cabelos grisalhos nas têmporas, as linhas ao redor dos olhos – ele estava mais bonito do que nunca.

"Não existiu", ela mentiu. "Éramos apenas adolescentes."

Pedro segurou seu rosto com as duas mãos, exatamente como tinha feito naquela noite de formatura.

"Então por que você veio aqui? Por que voltou à cidade justamente hoje, no aniversário daquela noite?"

As lágrimas que Juliana havia guardado por quinze anos finalmente encontraram caminho até seus olhos.

"Porque eu nunca consegui te esquecer", ela confessou. "E estou cansada de fingir que sim."

Quando ele a beijou, o mar aplaudiu em ondas, e a lua foi a única testemunha de uma história de amor que finalmente encontrava seu segundo capítulo.`,
  },
};

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

export default null;
