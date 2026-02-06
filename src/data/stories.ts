import story1 from "@/assets/story-1.jpg";
import story2 from "@/assets/story-2.jpg";
import story3 from "@/assets/story-3.jpg";
import story4 from "@/assets/story-4.jpg";
import story5 from "@/assets/story-5.jpg";
import story6 from "@/assets/story-6.jpg";

export interface Story {
  id: string;
  title: string;
  excerpt: string;
  fullExcerpt: string;
  category: string;
  readTime: string;
  price?: number;
  isPremium: boolean;
  imageUrl: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  tags: string[];
  publishedAt: string;
  views: number;
}

/** Preço padrão por aventura avulsa (galeria e seção de preços) */
export const AVULSO_PRICE = 8.9;

export const stories: Story[] = [
  {
    id: "o-encontro-as-escuras",
    title: "O Encontro às Escuras",
    excerpt: "Uma noite de mistério em um hotel de luxo. Ela não sabia quem a esperava, mas o desejo era irresistível...",
    fullExcerpt: `A chuva batia suavemente contra as janelas do Grand Hotel Riviera, criando uma melodia hipnótica que ecoava pelo corredor vazio do décimo andar. Marina ajustou o vestido de seda preta, sentindo o tecido deslizar sobre sua pele como uma carícia antecipada.

O bilhete dizia apenas: "Suíte 1012. Meia-noite. Não pergunte. Apenas venha."

Ela não deveria estar ali. Mulheres sensatas não seguem bilhetes anônimos deixados em sua mesa de trabalho. Mas havia algo naquela caligrafia elegante, naquele convite sussurrado no papel cor de champagne, que despertou uma curiosidade que há muito tempo jazia adormecida.

A porta da suíte estava entreaberta, revelando apenas uma fenda de luz dourada. O coração de Marina acelerou quando seus dedos tocaram a madeira fria. Do outro lado, velas tremulavam, lançando sombras dançantes pelas paredes revestidas de veludo bordô.

"Entre", disse uma voz masculina, grave e sedutora como o próprio pecado. "Eu estava esperando por você..."

E quando ela cruzou aquele limiar, Marina soube que nada em sua vida seria como antes.`,
    category: "Romance",
    readTime: "12 min",
    isPremium: false,
    imageUrl: story1,
    tags: ["romance", "mistério", "hotel", "encontro"],
    publishedAt: "2024-01-15",
    views: 2847,
  },
  {
    id: "segredos-do-escritorio",
    title: "Segredos do Escritório",
    excerpt: "O que acontece entre reuniões e corredores vazios. Uma tensão que não pode mais ser ignorada...",
    fullExcerpt: `Era sempre depois das sete da noite que o escritório se transformava. As luzes fluorescentes davam lugar à penumbra suave, os teclados silenciavam, e apenas dois corações continuavam batendo naquele andar deserto.

Camila fingia revisar relatórios enquanto observava Ricardo pela divisória de vidro. Ele afrouxava a gravata, passava a mão pelos cabelos escuros, e ela se perguntava como seria sentir aqueles dedos percorrendo...

"Trabalhando até tarde de novo, Camila?"

A voz dele, tão perto, fez seu coração saltar. Quando ela se virou, Ricardo estava apoiado na entrada de sua sala, os olhos escuros fixos nos dela com uma intensidade que não deixava dúvidas sobre seus pensamentos.

"Alguém precisa terminar o relatório do Hoffman", ela respondeu, a voz mais rouca do que pretendia.

Ele fechou a porta atrás de si. O clique da fechadura ecoou como uma promessa.

"O Hoffman pode esperar", disse ele, aproximando-se. "Mas eu... eu já esperei tempo demais."

E quando os lábios dele finalmente encontraram os dela, Camila entendeu por que todas aquelas noites extras valeram a pena.`,
    category: "Suspense",
    readTime: "18 min",
    price: AVULSO_PRICE,
    isPremium: true,
    imageUrl: story2,
    tags: ["suspense", "escritório", "tensão", "proibido"],
    publishedAt: "2024-01-20",
    views: 4521,
  },
  {
    id: "a-viagem-de-verao",
    title: "A Viagem de Verão",
    excerpt: "Uma cabana isolada, dois desconhecidos, e uma tempestade que mudaria tudo. O calor do verão não era nada...",
    fullExcerpt: `A cabana surgiu como um miragem entre as árvores, pequena e acolhedora, com fumaça saindo da chaminé. Ana não esperava encontrar alguém ali – muito menos alguém como ele.

Lucas estava cortando lenha quando ela chegou, encharcada pela tempestade que desabara sem aviso. Os músculos de seus braços se contraíam a cada golpe do machado, e gotas de suor – ou seria chuva? – escorriam pelo peito descoberto.

"Você está completamente molhada", ele disse, os olhos percorrendo seu corpo de uma forma que a fez esquecer do frio.

"Meu carro quebrou na estrada. Não consegui sinal..."

Ele abriu a porta da cabana com um sorriso que prometia problemas.

"Entre. Precisa tirar essas roupas antes que pegue um resfriado."

Dentro, a lareira crepitava, lançando sombras alaranjadas pelas paredes de madeira. Lucas entregou uma toalha a ela, os dedos roçando os seus por um momento a mais do que o necessário.

"O tempo diz que a tempestade vai durar a noite toda", ele murmurou. "Parece que você está presa aqui... comigo."

E Ana descobriu que existem tempestades muito mais intensas do que aquela que rugia lá fora.`,
    category: "Aventura",
    readTime: "25 min",
    price: AVULSO_PRICE,
    isPremium: true,
    imageUrl: story3,
    tags: ["aventura", "cabana", "tempestade", "verão"],
    publishedAt: "2024-02-01",
    views: 3892,
  },
  {
    id: "cartas-de-amor-proibido",
    title: "Cartas de Amor Proibido",
    excerpt: "Palavras que não poderiam ser ditas em voz alta. Um romance epistolar que atravessa limites...",
    fullExcerpt: `A primeira carta chegou numa terça-feira comum, escondida entre contas e propagandas. O envelope era de papel italiano, o endereço escrito à mão com tinta sépia.

"Para você, que entende o que é desejar o impossível..."

Helena releu aquela linha dezenas de vezes. Quem conhecia seus segredos mais íntimos? Quem sabia sobre os pensamentos que a assombravam nas noites solitárias?

A carta descrevia um sonho – ou seria uma memória? – de dois corpos entrelaçados sob a luz da lua. Palavras que pintavam cenas tão vívidas que Helena podia sentir o calor daquelas mãos imaginárias em sua pele.

Ela não deveria responder. Era uma mulher comprometida, respeitável, dona de uma vida perfeitamente organizada. Mas seus dedos já buscavam a caneta, como se tivessem vontade própria.

"Para você, que escreve como se me conhecesse... como descobriu o que minha alma não ousa confessar?"

E assim começou uma dança de palavras que incendiaria duas vidas, carta após carta, confissão após confissão, até que as páginas já não bastassem para conter o que crescia entre eles.`,
    category: "Drama",
    readTime: "15 min",
    isPremium: false,
    imageUrl: story4,
    tags: ["drama", "cartas", "proibido", "paixão"],
    publishedAt: "2024-02-10",
    views: 2156,
  },
  {
    id: "a-danca-da-meia-noite",
    title: "A Dança da Meia-Noite",
    excerpt: "No baile de máscaras, identidades se perdem e desejos se revelam. Uma noite para esquecer quem você é...",
    fullExcerpt: `O salão do Palácio Vermelho fervilhava de máscaras e segredos. Cristais pendiam do teto como estrelas capturadas, e a orquestra tocava uma valsa que parecia ter sido composta para amantes proibidos.

Isabella ajustou sua máscara de plumas negras, observando a multidão de rostos escondidos. Ali, naquela noite, ela não era a herdeira dos Monteiro. Era apenas uma mulher em busca de algo que não conseguia nomear.

Foi quando o viu.

Alto, vestido de preto absoluto, com uma máscara de lobo prateado que deixava apenas seus lábios à mostra. Lábios que curvaram num sorriso quando seus olhares se encontraram através do salão lotado.

Ele estendeu a mão sem dizer palavra. Isabella a aceitou sem questionar.

Dançaram em silêncio, corpos cada vez mais próximos, respirações cada vez mais curtas. A mão dele desceu de suas costas para sua cintura, depois mais abaixo, num movimento que arrancou um suspiro de seus lábios.

"Quem é você?", ela perguntou quando a música parou.

Ele se inclinou até que seus lábios roçassem sua orelha.

"Sou o homem que vai fazer você esquecer todos os outros. Mas só até a meia-noite. Depois, seremos estranhos novamente."

O relógio marcava onze horas. Isabella tinha sessenta minutos para viver tudo que havia negado a si mesma.`,
    category: "Fantasia",
    readTime: "20 min",
    price: AVULSO_PRICE,
    isPremium: true,
    imageUrl: story5,
    tags: ["fantasia", "baile", "máscaras", "mistério"],
    publishedAt: "2024-02-20",
    views: 5234,
  },
  {
    id: "confissoes-ao-luar",
    title: "Confissões ao Luar",
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
    category: "Romance",
    readTime: "10 min",
    isPremium: false,
    imageUrl: story6,
    tags: ["romance", "praia", "reencontro", "confissão"],
    publishedAt: "2024-03-01",
    views: 1987,
  },
];

export const getStoryById = (id: string): Story | undefined => {
  return stories.find(story => story.id === id);
};

export const getRelatedStories = (currentId: string, limit: number = 3): Story[] => {
  return stories.filter(story => story.id !== currentId).slice(0, limit);
};
