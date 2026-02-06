import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, type Story } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, BookOpen } from "lucide-react";

export default function AdminContos() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.admin.listStories();
      setStories(list);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Excluir o conto "${title}"?`)) return;
    try {
      await api.admin.deleteStory(id);
      setStories((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (loading) return <p className="text-muted-foreground">Carregando contos...</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-cream">Contos</h1>
        <Button asChild className="bg-wine hover:bg-wine-light text-cream">
          <Link to="/admin/contos/novo">
            <BookOpen className="w-4 h-4 mr-2" />
            Novo conto
          </Link>
        </Button>
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-card">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-cream">Título</th>
              <th className="px-4 py-3 text-sm font-medium text-cream">Categoria</th>
              <th className="px-4 py-3 text-sm font-medium text-cream">Premium</th>
              <th className="px-4 py-3 text-sm font-medium text-cream">Visualizações</th>
              <th className="px-4 py-3 text-sm font-medium text-cream w-28">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum conto. <Link to="/admin/contos/novo" className="text-gold hover:underline">Criar o primeiro</Link>.
                </td>
              </tr>
            ) : (
              stories.map((s) => (
                <tr key={s.id} className="hover:bg-card/50">
                  <td className="px-4 py-3 text-cream">{s.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.isPremium ? "Sim" : "Não"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.views}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-cream hover:text-gold"
                        onClick={() => navigate(`/admin/contos/${s.id}/editar`)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(s.id, s.title)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
