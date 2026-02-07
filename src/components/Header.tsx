import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    
    // Se não estamos na home, navega para home primeiro
    if (location.pathname !== "/") {
      navigate(`/#${sectionId}`);
    } else {
      // Se já estamos na home, faz scroll suave
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setMobileMenuOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <a 
            href="/" 
            onClick={handleLogoClick}
            className="font-serif text-2xl text-cream hover:text-gold transition-colors"
          >
            <span className="text-gold">My</span> Confessions
          </a>

          <nav className="hidden md:flex items-center gap-8">
            <a 
              href="#contos" 
              onClick={(e) => handleNavClick(e, "contos")}
              className="text-muted-foreground hover:text-cream transition-colors"
            >
              Contos
            </a>
            <a 
              href="#precos" 
              onClick={(e) => handleNavClick(e, "precos")}
              className="text-muted-foreground hover:text-cream transition-colors"
            >
              Preços
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-cream hover:text-gold hover:bg-transparent gap-2">
                      <User className="w-4 h-4" />
                      {user.email}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border">
                    <DropdownMenuItem className="text-muted-foreground cursor-pointer" disabled>
                      {user.accessType === "lifetime" ? "Acesso vitalício" : "Acesso avulso"}
                    </DropdownMenuItem>
                    {(user.isAdmin || user.email?.toLowerCase() === "admin@admin.com") && (
                      <DropdownMenuItem
                        className="text-cream cursor-pointer"
                        onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }}
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Painel admin
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-cream cursor-pointer"
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button 
                  className="bg-wine hover:bg-wine-light text-cream"
                  onClick={() => {
                    if (location.pathname !== "/") {
                      navigate("/#precos");
                    } else {
                      document.getElementById("precos")?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  Assinar
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-cream hover:text-gold hover:bg-transparent"
                  onClick={() => navigate("/entrar")}
                >
                  Entrar
                </Button>
                <Button 
                  className="bg-wine hover:bg-wine-light text-cream"
                  onClick={() => {
                    if (location.pathname !== "/") {
                      navigate("/#precos");
                    } else {
                      document.getElementById("precos")?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  Assinar
                </Button>
              </>
            )}
          </div>

          <button 
            className="md:hidden text-cream"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <nav className="flex flex-col gap-4">
              <a 
                href="#contos" 
                onClick={(e) => handleNavClick(e, "contos")}
                className="text-muted-foreground hover:text-cream transition-colors py-2"
              >
                Contos
              </a>
              <a 
                href="#precos" 
                onClick={(e) => handleNavClick(e, "precos")}
                className="text-muted-foreground hover:text-cream transition-colors py-2"
              >
                Preços
              </a>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                {user ? (
                  <>
                    {(user.isAdmin || user.email?.toLowerCase() === "admin@admin.com") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gold/50 text-gold flex-1"
                        onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }}
                      >
                        Painel
                      </Button>
                    )}
                    <span className="text-sm text-muted-foreground py-2 flex-1 truncate w-full">
                      {user.email}
                    </span>
                    <Button
                      variant="outline"
                      className="flex-1 border-border text-cream"
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                    >
                      Sair
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    className="flex-1 text-cream hover:text-gold"
                    onClick={() => { navigate("/entrar"); setMobileMenuOpen(false); }}
                  >
                    Entrar
                  </Button>
                )}
                <Button 
                  className="flex-1 bg-wine hover:bg-wine-light text-cream"
                  onClick={() => {
                    if (location.pathname !== "/") {
                      navigate("/#precos");
                    } else {
                      document.getElementById("precos")?.scrollIntoView({ behavior: "smooth" });
                    }
                    setMobileMenuOpen(false);
                  }}
                >
                  Assinar
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
