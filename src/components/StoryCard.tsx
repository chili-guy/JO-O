import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Eye, Clock } from "lucide-react";

interface StoryCardProps {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  price?: number;
  isPremium?: boolean;
  imageUrl?: string;
}

const StoryCard = ({ 
  title, 
  excerpt, 
  category, 
  readTime, 
  price, 
  isPremium = false,
  imageUrl 
}: StoryCardProps) => {
  return (
    <article className="group relative bg-gradient-card border border-border/50 rounded-lg overflow-hidden transition-all duration-500 hover:border-wine/50 hover:shadow-[0_0_30px_hsl(345_60%_35%/0.2)]">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ 
            backgroundImage: imageUrl ? `url(${imageUrl})` : 'linear-gradient(135deg, hsl(345 70% 20%) 0%, hsl(0 0% 10%) 100%)' 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        
        {isPremium && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-gold/90 text-background font-semibold">
              <Lock className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </div>
        )}

        <Badge className="absolute top-3 left-3 bg-wine/80 text-cream">
          {category}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-serif text-xl text-cream mb-2 group-hover:text-gold transition-colors line-clamp-2">
          {title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {readTime}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              2.3K
            </span>
          </div>

          {price ? (
            <Button size="sm" className="bg-wine hover:bg-wine-light text-cream pointer-events-none">
              R$ {price.toFixed(2)}
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="border-gold/50 text-gold hover:bg-gold/10 pointer-events-none">
              Ler agora
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};

export default StoryCard;
