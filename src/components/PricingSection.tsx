import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap } from "lucide-react";

const PricingSection = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goToStoriesGallery = () => {
    if (location.pathname === "/") {
      document.getElementById("contos")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/#contos");
    }
  };

  return (
    <section id="precos" className="py-24 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-cream mb-4">
            Escolha seu <span className="text-gradient-gold">Acesso</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Compre avulso ou assine para ter acesso a todas as aventuras reais com vídeos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Avulso */}
          <div className="bg-gradient-card border border-border/50 rounded-xl p-8 hover:border-wine/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-wine/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-wine-light" />
              </div>
              <div>
                <h3 className="font-serif text-2xl text-cream">Avulso</h3>
                <p className="text-muted-foreground text-sm">Compre o que quiser</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-serif text-cream">R$ 8,90</span>
              <span className="text-muted-foreground"> / aventura</span>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Acesso vitalício a aventura",
                "Visualização online",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-muted-foreground">
                  <Check className="w-5 h-5 text-wine-light flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button 
              className="w-full bg-secondary hover:bg-muted text-cream py-6"
              onClick={goToStoriesGallery}
            >
              Explorar
            </Button>
          </div>

          {/* Assinatura */}
          <div className="relative bg-gradient-card border-2 border-gold/50 rounded-xl p-8 glow-gold">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-gold text-background text-sm font-semibold px-4 py-1 rounded-full">
                Mais Popular
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h3 className="font-serif text-2xl text-cream">Assinatura</h3>
                <p className="text-muted-foreground text-sm">Acesso ilimitado</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-serif text-gold">R$ 24,80</span>
              <span className="text-muted-foreground"> / mês</span>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Acesso ilimitado a todo conteúdo",
                "Acesso exclusivo a vídeos e imagens reais",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-muted-foreground">
                  <Check className="w-5 h-5 text-gold flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button 
              className="w-full bg-gold hover:bg-gold-light text-background py-6 font-semibold"
            >
              Assinar Agora
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
