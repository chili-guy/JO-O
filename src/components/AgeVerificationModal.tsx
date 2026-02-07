import { useState, useEffect } from "react";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AgeVerificationModalProps {
  onVerified: () => void;
}

const AgeVerificationModal = ({ onVerified }: AgeVerificationModalProps) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const verified = localStorage.getItem("age-verified");
    if (verified === "true") {
      setOpen(false);
      onVerified();
    }
  }, [onVerified]);

  const handleVerify = () => {
    localStorage.setItem("age-verified", "true");
    setOpen(false);
    onVerified();
  };

  const handleDeny = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <Dialog open={open} modal={true}>
      <DialogPortal>
        <DialogOverlay className="bg-black/50" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-gradient-card border-wine/30 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg text-center"
          )}
        >
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-wine/20 flex items-center justify-center">
              <span className="text-3xl font-serif text-gold">+18</span>
            </div>
            <DialogTitle className="text-2xl font-serif text-cream">
              Verificação de Idade
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-base">
              Este site contém conteúdo adulto destinado exclusivamente para maiores de 18 anos.
              Ao continuar, você confirma que tem idade legal para acessar este conteúdo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 mt-6">
            <Button 
              onClick={handleVerify}
              className="w-full bg-wine hover:bg-wine-light text-cream font-semibold py-6 text-lg transition-all duration-300 glow-wine"
            >
              Tenho 18 anos ou mais
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDeny}
              className="w-full border-muted-foreground/30 text-muted-foreground hover:bg-muted py-6"
            >
              Sou menor de idade
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Ao entrar, você concorda com nossos termos de uso e política de privacidade.
          </p>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

export default AgeVerificationModal;
