import { Navigate, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BookOpen, PlusCircle, LogOut, LayoutDashboard } from "lucide-react";

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/entrar?redirect=${encodeURIComponent("/admin")}`} replace />;
  }

  const isAdmin = user.isAdmin === true || user.email?.toLowerCase() === "admin@admin.com";
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="font-serif text-2xl text-cream mb-2">Acesso negado</h1>
          <p className="text-muted-foreground mb-4">Apenas administradores podem acessar o painel.</p>
          <Button onClick={() => navigate("/")}>Voltar ao site</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-56 border-r border-border/50 bg-card/30 flex flex-col">
        <div className="p-4 border-b border-border/50">
          <Link to="/admin" className="font-serif text-lg text-cream hover:text-gold flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            Painel Admin
          </Link>
        </div>
        <nav className="p-2 flex-1">
          <Link
            to="/admin/contos"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:text-cream hover:bg-wine/10 mb-1"
          >
            <BookOpen className="w-4 h-4" />
            Contos
          </Link>
          <Link
            to="/admin/contos/novo"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:text-cream hover:bg-wine/10"
          >
            <PlusCircle className="w-4 h-4" />
            Novo conto
          </Link>
        </nav>
        <div className="p-2 border-t border-border/50">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-cream"
            onClick={() => { logout(); navigate("/"); }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
