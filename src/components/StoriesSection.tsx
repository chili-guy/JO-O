import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StoryCard from "./StoryCard";
import { api, type Story } from "@/lib/api";

const MAX_CONTOS = 6;  // 3 colunas x 2 linhas

const StoriesSection = () => {
  const navigate = useNavigate();
  const [aventuras, setAventuras] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.stories.list().then((list) => {
      setAventuras(list.filter((s) => s.isPremium).slice(0, MAX_CONTOS));
    }).catch(() => setAventuras([])).finally(() => setLoading(false));
  }, []);

  const contosVisiveis = aventuras;

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

      </div>
    </section>
  );
};

export default StoriesSection;
