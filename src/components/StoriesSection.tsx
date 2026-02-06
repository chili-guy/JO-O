import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StoryCard from "./StoryCard";
import { Button } from "@/components/ui/button";
import { api, type Story } from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PRIMEIRA_LINHA = 3;  // 3 contos na vista inicial
const POR_PAGINA = 6;      // 3 colunas x 2 linhas quando expandido

const StoriesSection = () => {
  const navigate = useNavigate();
  const [expandido, setExpandido] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [aventuras, setAventuras] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.stories.list().then((list) => {
      setAventuras(list.filter((s) => s.isPremium));
    }).catch(() => setAventuras([])).finally(() => setLoading(false));
  }, []);
  const totalPaginas = Math.ceil(aventuras.length / POR_PAGINA) || 1;

  const indiceInicio = expandido
    ? (paginaAtual - 1) * POR_PAGINA
    : 0;
  const quantidade = expandido ? POR_PAGINA : PRIMEIRA_LINHA;
  const contosDestaPagina = aventuras.slice(indiceInicio, indiceInicio + quantidade);

  // Expandido: sempre 6 slots no grid (3x2). Preenche com contos reais + placeholders "Em breve"
  const contosVisiveis = expandido
    ? Array.from({ length: POR_PAGINA }, (_, i) => contosDestaPagina[i] ?? null)
    : contosDestaPagina;

  const irParaPagina = (p: number) => {
    const nova = Math.max(1, Math.min(p, totalPaginas));
    setPaginaAtual(nova);
  };

  const abrirVerTudo = () => {
    setPaginaAtual(1);
    setExpandido(true);
  };

  const fecharVerTudo = () => {
    setExpandido(false);
    setPaginaAtual(1);
  };

  if (loading) {
    return (
      <section id="contos" className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Carregando aventuras...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="contos" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-cream mb-4">
            Aventuras em <span className="text-gradient-gold">destaque</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore todos os segredos que elas guardam aqui. Veja os mais quentes.
          </p>
        </div>

        {/* Grid 3 colunas: 3 itens (1 linha) ou 6 itens (2 linhas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contosVisiveis.map((story, index) =>
            story ? (
              <div
                key={story.id}
                className="cursor-pointer"
                onClick={() => navigate(`/conto/${story.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/conto/${story.id}`);
                  }
                }}
              >
                <StoryCard
                  title={story.title}
                  excerpt={story.excerpt}
                  category={story.category}
                  readTime={story.readTime}
                  price={story.price}
                  isPremium={story.isPremium}
                  imageUrl={story.imageUrl}
                />
              </div>
            ) : (
              <div
                key={`placeholder-${index}`}
                className="flex flex-col items-center justify-center min-h-[280px] rounded-lg border border-dashed border-border/50 bg-card/50 text-muted-foreground"
              >
                <span className="font-serif text-lg">Em breve</span>
              </div>
            )
          )}
        </div>

        {/* Botão Ver tudo / Navbar de páginas + Ver menos */}
        <div className="mt-12 flex flex-col items-center gap-6">
          {!expandido ? (
            <Button
              size="lg"
              variant="outline"
              className="border-wine text-cream hover:bg-wine/10"
              onClick={abrirVerTudo}
              type="button"
            >
              Ver tudo
            </Button>
          ) : (
            <>
              {/* Barra de navegação entre páginas */}
              <nav
                className="flex items-center gap-2"
                aria-label="Navegação entre páginas de aventuras"
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="border-border text-cream hover:bg-wine/20 disabled:opacity-50"
                  onClick={() => irParaPagina(paginaAtual - 1)}
                  disabled={paginaAtual <= 1}
                  type="button"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                    (num) => (
                      <Button
                        key={num}
                        variant={paginaAtual === num ? "default" : "outline"}
                        size="icon"
                        className={
                          paginaAtual === num
                            ? "bg-wine hover:bg-wine-light text-cream"
                            : "border-border text-cream hover:bg-wine/20"
                        }
                        onClick={() => irParaPagina(num)}
                        type="button"
                        aria-label={`Página ${num}`}
                        aria-current={paginaAtual === num ? "page" : undefined}
                      >
                        {num}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="border-border text-cream hover:bg-wine/20 disabled:opacity-50"
                  onClick={() => irParaPagina(paginaAtual + 1)}
                  disabled={paginaAtual >= totalPaginas}
                  type="button"
                  aria-label="Próxima página"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>

              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-cream"
                onClick={fecharVerTudo}
                type="button"
              >
                Ver menos
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default StoriesSection;
