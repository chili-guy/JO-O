import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StoryCard from "./StoryCard";
import { api, type Story } from "@/lib/api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const StoriesSection = () => {
  const navigate = useNavigate();
  const [aventuras, setAventuras] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.stories.list().then((list) => {
      setAventuras(list.filter((s) => s.isPremium));
    }).catch(() => setAventuras([])).finally(() => setLoading(false));
  }, []);

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

        {/* Carrossel: vários cards visíveis, setas para ver mais */}
        <div className="relative px-8 md:px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              dragFree: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 md:-ml-6">
              {aventuras.length === 0 ? (
                <CarouselItem className="pl-4 md:pl-6 basis-full">
                  <div className="flex flex-col items-center justify-center min-h-[280px] rounded-lg border border-dashed border-border/50 bg-card/50 text-muted-foreground">
                    <span className="font-serif text-lg">Nenhuma aventura em destaque</span>
                  </div>
                </CarouselItem>
              ) : (
                aventuras.map((story) => (
                  <CarouselItem
                    key={story.id}
                    className={cn(
                      "pl-4 md:pl-6",
                      "basis-full sm:basis-[85%] md:basis-1/2 lg:basis-1/3",
                    )}
                  >
                    <div
                      className="cursor-pointer h-full"
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
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
            {aventuras.length > 1 && (
              <>
                <CarouselPrevious className="-left-2 md:-left-4 border-wine/30 text-cream hover:bg-wine/20 hover:text-cream bg-background/80" />
                <CarouselNext className="-right-2 md:-right-4 border-wine/30 text-cream hover:bg-wine/20 hover:text-cream bg-background/80" />
              </>
            )}
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default StoriesSection;
