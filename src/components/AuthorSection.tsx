import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import authorImg from "@/assets/author.jpg";

const AuthorSection = () => {
  return (
    <section id="autor" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Author Image */}
            <div className="relative">
              <div className="aspect-[3/4] rounded-xl overflow-hidden border border-border/50">
                <img 
                  src={authorImg} 
                  alt="O Autor" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-card border border-gold/30 rounded-lg p-4 glow-gold">
                <p className="font-serif text-2xl text-gold">50+</p>
                <p className="text-sm text-muted-foreground">Aventuras publicadas</p>
              </div>
            </div>

            {/* Author Info */}
            <div>
              <h2 className="font-serif text-4xl text-cream mb-4">
                Sobre o <span className="text-gradient-gold">Autor</span>
              </h2>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Há mais de uma década, dedico-me à arte de contar histórias que 
                exploram os limites do desejo e da paixão. Cada aventura é cuidadosamente 
                escrito para envolver você em um universo de sensações.
              </p>

              <p className="text-muted-foreground mb-8 leading-relaxed">
                Minha missão é criar narrativas que não apenas excitem, mas que também 
                toquem a alma. Porque a verdadeira sensualidade está nos detalhes, 
                nas palavras certas, no ritmo perfeito de uma história bem contada.
              </p>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i}
                      className="w-10 h-10 rounded-full bg-wine/30 border-2 border-background"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-gold">
                    <Heart className="w-4 h-4 fill-current" />
                    <span className="font-semibold">5.234</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Leitores fiéis</p>
                </div>
              </div>

              <Button className="bg-wine hover:bg-wine-light text-cream">
                Conhecer mais aventuras
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthorSection;
