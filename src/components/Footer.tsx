import { Heart } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    
    if (location.pathname !== "/") {
      navigate(`/#${sectionId}`);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="bg-card border-t border-border/50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <a 
              href="/" 
              onClick={(e) => { e.preventDefault(); navigate("/"); }}
              className="font-serif text-2xl text-cream hover:text-gold transition-colors cursor-pointer"
            >
              <span className="text-gold">My</span> Confessions
            </a>
            <p className="text-muted-foreground mt-4 max-w-md">
              Histórias sensuais autorais para despertar sua imaginação. 
              Conteúdo exclusivo para maiores de 18 anos.
            </p>
            <Button 
              className="mt-4 bg-wine hover:bg-wine-light text-cream"
              onClick={() => {
                if (location.pathname !== "/") {
                  navigate("/#contos");
                } else {
                  document.getElementById("contos")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Conhecer mais aventuras
            </Button>
          </div>

          <div>
            <h4 className="font-serif text-lg text-cream mb-4">Links</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#contos" 
                  onClick={(e) => handleNavClick(e, "contos")}
                  className="text-muted-foreground hover:text-cream transition-colors"
                >
                  Aventuras
                </a>
              </li>
              <li>
                <a 
                  href="#precos" 
                  onClick={(e) => handleNavClick(e, "precos")}
                  className="text-muted-foreground hover:text-cream transition-colors"
                >
                  Assinatura
                </a>
              </li>
              <li>
                <a 
                  href="#autor" 
                  onClick={(e) => handleNavClick(e, "autor")}
                  className="text-muted-foreground hover:text-cream transition-colors"
                >
                  Sobre
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-cream transition-colors"
                >
                  Contato
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg text-cream mb-4">Legal</h4>
            <ul className="space-y-2">
              {["Termos de Uso", "Privacidade", "Cookies", "+18 Apenas"].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-muted-foreground hover:text-cream transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 My Confessions. Todos os direitos reservados.
          </p>
          <p className="text-muted-foreground text-sm flex items-center gap-1">
            Feito com <Heart className="w-4 h-4 text-wine fill-current" /> para leitores apaixonados
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
