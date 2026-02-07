import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Clock, 
  Eye, 
  Heart, 
  Share2, 
  BookOpen,
  Calendar,
  Tag,
  Play
} from "lucide-react";
import { api, type Story } from "@/lib/api";
import StoryCard from "@/components/StoryCard";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";

const StoryPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [story, setStory] = useState<Story | null>(null);
  const [relatedStories, setRelatedStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);

  useEffect(() => {
    const storyId = id || "";
    if (!storyId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    Promise.all([
      api.stories.get(storyId).catch(() => null),
      api.stories.list(),
    ]).then(([s, list]) => {
      setStory(s || null);
      setNotFound(!s);
      setRelatedStories(list.filter((x) => x.id !== storyId).slice(0, 3));
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (notFound || !story) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-cream mb-4">Conto não encontrado</h1>
          <Button onClick={() => navigate("/")} className="bg-wine hover:bg-wine-light">
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(story.publishedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const scrollToCompraAvulsa = () => {
    document.getElementById("comprar-conto")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleComprar = async () => {
    if (!story) return;
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(`/conto/${story.id}`)}`);
      return;
    }
    setBuyError(null);
    setBuyLoading(true);
    try {
      const { url } = await api.stripe.createCheckoutSession(story.id);
      if (url) window.location.href = url;
    } catch (err) {
      setBuyError((err as Error).message);
    } finally {
      setBuyLoading(false);
    }
  };

  const precoAvulso = story.price ?? 8.9;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Hero Section - Compacto (imagem no fundo com transparência, estilo página inicial) */}
      <section className="relative pt-24 pb-12 overflow-hidden min-h-[50vh] flex flex-col">
        {/* Imagem de fundo */}
        {story.imageUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url(${story.imageUrl})` }} 
          />
        )}
        {/* Overlay em gradiente para transparência e legibilidade (como HeroSection) */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        
        {/* Navigation */}
        <div className="relative z-20 container mx-auto px-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="text-cream hover:text-gold hover:bg-transparent gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            {/* Category Badge */}
            <Badge className="bg-wine/90 text-cream mb-4 text-sm">
              {story.category}
            </Badge>
            
            {/* Title */}
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-cream mb-4 leading-tight">
              {story.title}
            </h1>
            
            {/* Subtitle / resumo curto */}
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed max-w-2xl mx-auto">
              {story.excerpt || story.fullExcerpt || "Uma aventura exclusiva esperando por você."}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gold" />
                {story.readTime} de leitura
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-gold" />
                {story.views.toLocaleString('pt-BR')} visualizações
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gold" />
                {formattedDate}
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button size="lg" className="bg-wine hover:bg-wine-light text-cream gap-2 glow-wine" onClick={scrollToCompraAvulsa}>
                <BookOpen className="w-4 h-4" />
                Ler relato completo
              </Button>
              <Button size="lg" variant="outline" className="border-gold/50 text-gold hover:bg-gold/10 gap-2">
                <Heart className="w-4 h-4" />
                Favoritar
              </Button>
              <Button size="lg" variant="ghost" className="text-cream hover:text-gold gap-2">
                <Share2 className="w-4 h-4" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section - Blurred Preview */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl md:text-3xl text-cream mb-2">
                Veja como tudo <span className="text-gradient-gold">aconteceu</span>
              </h2>
              <p className="text-muted-foreground text-sm">
                Acesse o conteúdo completo
              </p>
            </div>

            {/* Video Container with Blur */}
            <div className="aspect-video bg-gradient-card border border-border/50 rounded-lg overflow-hidden relative group">
              {/* Blurred Video/Image Placeholder */}
              <div className="absolute inset-0">
                <img 
                  src={story.imageUrl} 
                  alt={story.title}
                  className="w-full h-full object-cover blur-xl scale-110"
                />
              </div>
              
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-background/60" />
              
              {/* Play Button and Lock Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <button
                  type="button"
                  onClick={scrollToCompraAvulsa}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-wine/80 flex items-center justify-center mb-4 group-hover:bg-wine transition-colors cursor-pointer"
                >
                  <Play className="w-6 h-6 md:w-8 md:h-8 text-cream ml-1" fill="currentColor" />
                </button>
                <div className="text-center px-4">
                  <p className="text-cream font-serif text-lg md:text-xl mb-2">Veja como tudo aconteceu</p>
                  <p className="text-muted-foreground text-sm mb-4">
                    Acesse o conteúdo completo
                  </p>
                  <Button className="bg-wine hover:bg-wine-light text-cream gap-2" onClick={scrollToCompraAvulsa}>
                    <Play className="w-4 h-4" />
                    Acesse o conteúdo completo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trecho da aventura (prévia do texto) */}
      <section className="py-12 md:py-16" aria-label="Trecho da aventura">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-wine/50 to-transparent" />
              <span className="text-gold font-serif text-lg">Trecho da aventura</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-wine/50 to-transparent" />
            </div>

            {/* Texto do trecho: fullExcerpt (parágrafos) ou excerpt como fallback */}
            <div className="bg-gradient-card border border-border/50 rounded-lg p-6 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-wine/10 blur-3xl rounded-full" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gold/5 blur-3xl rounded-full" />
              
              <div className="relative">
                <div className="text-6xl md:text-8xl text-wine/20 font-serif absolute -top-2 -left-2">"</div>
                
                <div className="font-serif text-base md:text-lg leading-relaxed text-cream/90 whitespace-pre-line pl-6 md:pl-8">
                  {story.fullExcerpt?.trim() || story.excerpt || "Leia o relato completo após desbloquear esta aventura."}
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card to-transparent pointer-events-none" />
              </div>

              <div className="relative mt-8 pt-6 border-t border-border/30 text-center">
                <p className="text-muted-foreground mb-4 text-sm">
                  Acesse o conteúdo completo
                </p>
                <Button size="lg" className="bg-wine hover:bg-wine-light text-cream gap-2" onClick={scrollToCompraAvulsa}>
                  <BookOpen className="w-4 h-4" />
                  Ler relato completo
                </Button>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {(story.tags ?? []).map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="border-border/50 text-muted-foreground hover:border-wine/50 hover:text-cream transition-colors cursor-pointer"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Compra avulsa deste conto (mesma página) */}
      <section id="comprar-conto" className="py-12 md:py-16 scroll-mt-24">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <div className="bg-gradient-card border-2 border-wine/40 rounded-2xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-wine/10 blur-3xl rounded-full" />
              <div className="relative text-center">
                <h2 className="font-serif text-2xl md:text-3xl text-cream mb-2">
                  Comprar <span className="text-gradient-gold">este conto</span>
                </h2>
                <p className="text-muted-foreground mb-1">{story.title}</p>
                <p className="text-3xl font-serif text-cream mb-6">
                  R$ {precoAvulso.toFixed(2).replace(".", ",")}
                  <span className="text-muted-foreground text-base font-sans font-normal"> (avulso)</span>
                </p>
                <ul className="text-center text-muted-foreground text-sm space-y-2 mb-6 max-w-sm mx-auto">
                  <li className="flex items-center justify-center gap-2">
                    <span className="text-wine-light">✓</span> Acesso vitalício a este relato
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <span className="text-wine-light">✓</span> Conteúdo completo com mídia
                  </li>
                </ul>
                {buyError && (
                  <p className="text-destructive text-sm mb-3">{buyError}</p>
                )}
                <Button
                  size="lg"
                  className="w-full bg-wine hover:bg-wine-light text-cream gap-2 glow-wine py-6"
                  onClick={handleComprar}
                  disabled={buyLoading}
                >
                  <BookOpen className="w-5 h-5" />
                  {buyLoading ? "Redirecionando..." : `Comprar por R$ ${precoAvulso.toFixed(2).replace(".", ",")}`}
                </Button>
                <p className="text-muted-foreground text-xs mt-4">
                  {user ? "Você será redirecionado ao Stripe para pagamento seguro." : "Entre ou crie uma conta para concluir a compra."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription CTA */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-gradient-to-br from-wine/20 via-card to-card border border-wine/30 rounded-2xl p-6 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-wine/10 blur-3xl rounded-full" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/5 blur-3xl rounded-full" />
              
              <div className="relative">
                <h2 className="font-serif text-2xl md:text-3xl text-cream mb-3">
                  Quer acesso a todas as <span className="text-gradient-gold">aventuras</span>?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  Assine e tenha acesso ilimitado aos relatos reais mais explícitos da internet.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    size="lg" 
                    className="bg-gold hover:bg-gold-light text-background font-semibold glow-gold"
                    onClick={() => navigate("/#precos")}
                  >
                    Ver Planos de Assinatura
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-cream/30 text-cream hover:bg-cream/10"
                    onClick={() => navigate("/#contos")}
                  >
                    Explorar mais
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Stories */}
      <section className="py-12 md:py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl md:text-3xl text-cream mb-2">
              Outras aventuras <span className="text-gradient-gold">selecionadas para você</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {relatedStories.map((relatedStory) => (
              <div 
                key={relatedStory.id} 
                onClick={() => navigate(`/conto/${relatedStory.id}`)}
                className="cursor-pointer"
              >
                <StoryCard 
                  title={relatedStory.title}
                  excerpt={relatedStory.excerpt}
                  category={relatedStory.category}
                  readTime={relatedStory.readTime}
                  price={relatedStory.price}
                  isPremium={relatedStory.isPremium}
                  imageUrl={relatedStory.imageUrl}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <a 
            href="/" 
            onClick={(e) => { e.preventDefault(); navigate("/"); }}
            className="font-serif text-xl text-cream hover:text-gold transition-colors cursor-pointer"
          >
            <span className="text-gold">My</span> Confessions
          </a>
          <p className="text-muted-foreground text-sm mt-2">
            © 2024 My Confessions. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default StoryPreview;
