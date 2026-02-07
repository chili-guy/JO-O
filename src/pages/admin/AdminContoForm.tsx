import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, type Story } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, Film } from "lucide-react";

const emptyStory: Partial<Story> = {
  title: "",
  excerpt: "",
  fullExcerpt: "",
  category: "",
  readTime: "10 min",
  price: 8.9,
  isPremium: true,
  imageUrl: "",
  mediaUrl: "",
  mediaType: "video",
  tags: [],
  publishedAt: new Date().toISOString().slice(0, 10),
  views: 0,
};

export default function AdminContoForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id && id !== "novo");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Story>>(emptyStory);
  const [tagsStr, setTagsStr] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      setForm({ ...emptyStory, publishedAt: new Date().toISOString().slice(0, 10) });
      setTagsStr("");
      return;
    }
    let cancelled = false;
    api.admin.getStory(id!).then((s) => {
      if (!cancelled) {
        setForm(s);
        setTagsStr(Array.isArray(s.tags) ? s.tags.join(", ") : "");
      }
    }).catch((err) => {
      if (!cancelled) setError((err as Error).message);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [id, isEdit]);

  const update = (field: keyof Story, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const { url } = await api.admin.uploadFile(file);
      update("imageUrl", url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleUploadMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    try {
      const { url } = await api.admin.uploadFile(file);
      update("mediaUrl", url);
      const type = file.type.startsWith("video/") ? "video" : file.type.startsWith("audio/") ? "audio" : "image";
      update("mediaType", type);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploadingMedia(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
    const payload = { ...form, tags };
    try {
      if (isEdit) {
        await api.admin.updateStory(id!, payload);
        navigate("/admin/contos");
      } else {
        await api.admin.createStory(payload);
        navigate("/admin/contos");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div>
      <Button variant="ghost" className="mb-4 text-cream hover:text-gold" onClick={() => navigate("/admin/contos")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-serif text-cream">
            {isEdit ? "Editar aventura" : "Nova aventura"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={form.title ?? ""}
                  onChange={(e) => update("title", e.target.value)}
                  required
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input
                  value={form.category ?? ""}
                  onChange={(e) => update("category", e.target.value)}
                  placeholder="Ex: Romance, Suspense"
                  className="bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Resumo / chamada (excerpt)</Label>
              <Textarea
                value={form.excerpt ?? ""}
                onChange={(e) => update("excerpt", e.target.value)}
                rows={2}
                className="bg-background resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Texto completo (full excerpt)</Label>
              <Textarea
                value={form.fullExcerpt ?? ""}
                onChange={(e) => update("fullExcerpt", e.target.value)}
                rows={12}
                className="bg-background resize-y font-mono text-sm"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Tempo de leitura</Label>
                <Input
                  value={form.readTime ?? ""}
                  onChange={(e) => update("readTime", e.target.value)}
                  placeholder="Ex: 12 min"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Preço (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price ?? ""}
                  onChange={(e) => update("price", e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Data publicação</Label>
                <Input
                  type="date"
                  value={form.publishedAt ?? ""}
                  onChange={(e) => update("publishedAt", e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPremium"
                checked={form.isPremium ?? true}
                onChange={(e) => update("isPremium", e.target.checked)}
                className="rounded accent-wine"
              />
              <Label htmlFor="isPremium" className="cursor-pointer">Aventura premium (avulsa)</Label>
            </div>

            <div className="space-y-2">
              <Label>Imagem de capa</Label>
              <div className="flex flex-wrap gap-2 items-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingImage}
                    onChange={handleUploadImage}
                  />
                  <Button type="button" variant="outline" size="sm" className="gap-2 border-border text-cream" asChild>
                    <span>
                      <Upload className="w-4 h-4" />
                      {uploadingImage ? "Enviando..." : "Enviar imagem"}
                    </span>
                  </Button>
                </label>
                <span className="text-sm text-muted-foreground">ou cole a URL:</span>
                <Input
                  value={form.imageUrl ?? ""}
                  onChange={(e) => update("imageUrl", e.target.value)}
                  placeholder="https://... ou use o upload acima"
                  className="bg-background flex-1 min-w-[200px]"
                />
              </div>
              {form.imageUrl && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Prévia:</p>
                  <img
                    src={form.imageUrl}
                    alt="Capa"
                    className="h-24 w-auto rounded border border-border object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Vídeo / mídia (áudio, imagem ou vídeo)</Label>
                <div className="flex flex-wrap gap-2 items-center">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,video/*,audio/*"
                      className="hidden"
                      disabled={uploadingMedia}
                      onChange={handleUploadMedia}
                    />
                    <Button type="button" variant="outline" size="sm" className="gap-2 border-border text-cream" asChild>
                      <span>
                        <Film className="w-4 h-4" />
                        {uploadingMedia ? "Enviando..." : "Enviar mídia"}
                      </span>
                    </Button>
                  </label>
                  <Input
                    value={form.mediaUrl ?? ""}
                    onChange={(e) => update("mediaUrl", e.target.value)}
                    placeholder="URL ou use o upload"
                    className="bg-background flex-1 min-w-[160px]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tipo de mídia</Label>
                <select
                  value={form.mediaType ?? "video"}
                  onChange={(e) => update("mediaType", e.target.value as Story["mediaType"])}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="video">Vídeo</option>
                  <option value="image">Imagem</option>
                  <option value="audio">Áudio</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags (separadas por vírgula)</Label>
              <Input
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                placeholder="romance, suspense, hotel"
                className="bg-background"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="bg-wine hover:bg-wine-light text-cream" disabled={saving}>
                {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar aventura"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/admin/contos")}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
