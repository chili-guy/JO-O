import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: `url(${heroBg})` }} 
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-wine/10 rounded-full blur-3xl animate-float" />
        <div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold/5 rounded-full blur-3xl animate-float" 
          style={{ animationDelay: '3s' }} 
        />
      </div>

      <div className="container mx-auto px-4 pt-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-wine/20 border border-wine/30 rounded-full px-4 py-2 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-sm text-gold">Conteúdo Exclusivo +18</span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-cream mb-6 animate-slide-up leading-tight">
            Se aventure nas confissões
            <span className="block text-gradient-gold">mais explícitas da internet.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Histórias reais que elas ainda não te contaram e vão fazer você delirar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Button 
              size="lg" 
              className="bg-wine hover:bg-wine-light text-cream px-8 py-6 text-lg font-semibold glow-wine transition-all duration-300 group"
              onClick={() => scrollToSection("contos")}
            >
              Comece a ver
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gold/50 text-gold hover:bg-gold/10 px-8 py-6 text-lg"
              onClick={() => scrollToSection("precos")}
            >
              Ver assinatura
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 mt-12 text-muted-foreground animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <p className="text-3xl font-serif text-cream">50+</p>
              <p className="text-sm">Contos</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-3xl font-serif text-cream">5K+</p>
              <p className="text-sm flex items-center gap-1 justify-center">
                <Users className="w-3 h-3" />
                Leitores fiéis
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;