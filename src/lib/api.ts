const API_BASE = "/api";

export type User = {
  id: string;
  email: string;
  accessType: "lifetime" | "per_story";
  isAdmin?: boolean;
  createdAt?: string;
};

export type Story = {
  id: string;
  title: string;
  excerpt: string;
  fullExcerpt: string;
  category: string;
  readTime: string;
  price?: number;
  isPremium: boolean;
  imageUrl: string;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "audio";
  tags: string[];
  publishedAt: string;
  views: number;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

function getToken(): string | null {
  return localStorage.getItem("token");
}

function getHeaders(includeAuth = true): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const token = getToken();
  if (includeAuth && token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function parseJson(res: Response, hint = ""): Promise<unknown> {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    const status = res.status;
    const isVercel = typeof window !== "undefined" && /vercel\.app|\.vercel\.app/i.test(window.location?.hostname ?? "");
    let msg =
      res.status === 0 || res.type === "error"
        ? "Não foi possível conectar à API. Inicie-a em outro terminal: npm run server"
        : hint || "Resposta inválida da API. Verifique se o servidor está rodando: npm run server";
    if (status >= 500 && isVercel) {
      msg = `Erro na API (${status}). Na Vercel: confira Deployments → Logs e variáveis de ambiente.`;
    } else if (status >= 500) {
      msg = `Erro no servidor (${status}). ${msg}`;
    }
    throw new Error(msg);
  }
}

export const api = {
  async register(email: string, password: string, accessType: "lifetime" | "per_story" = "per_story") {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ email, password, accessType }),
    });
    const data = (await parseJson(res)) as { error?: string } & AuthResponse;
    if (!res.ok) throw new Error(data.error || "Erro ao cadastrar");
    return data as AuthResponse;
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    const data = (await parseJson(res)) as { error?: string } & AuthResponse;
    if (!res.ok) throw new Error(data.error || "Erro ao fazer login");
    return data as AuthResponse;
  },

  async me() {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    const data = (await parseJson(res)) as { error?: string } & User;
    if (!res.ok) throw new Error(data.error || "Não autorizado");
    return data as User;
  },

  async checkStoryAccess(storyId: string): Promise<{ hasAccess: boolean }> {
    const res = await fetch(`${API_BASE}/access/check/${encodeURIComponent(storyId)}`, {
      headers: getHeaders(),
    });
    const data = (await parseJson(res)) as { error?: string } & { hasAccess: boolean };
    if (!res.ok) throw new Error(data.error || "Erro ao verificar acesso");
    return data;
  },

  async getMyStoryIds(): Promise<{ storyIds: string[] }> {
    const res = await fetch(`${API_BASE}/access/me`, { headers: getHeaders() });
    const data = (await parseJson(res)) as { error?: string } & { storyIds: string[] };
    if (!res.ok) throw new Error(data.error || "Erro ao listar acessos");
    return data;
  },

  // Público: contos
  stories: {
    async list(): Promise<Story[]> {
      const res = await fetch(`${API_BASE}/stories`);
      const data = await parseJson(res);
      if (!res.ok) throw new Error((data as { error?: string }).error || "Erro ao listar contos");
      return data as Story[];
    },
    async get(id: string): Promise<Story> {
      const res = await fetch(`${API_BASE}/stories/${encodeURIComponent(id)}`);
      const data = await parseJson(res);
      if (!res.ok) throw new Error((data as { error?: string }).error || "Conto não encontrado");
      return data as Story;
    },
  },

  // Admin: CRUD contos (requer token + isAdmin)
  admin: {
    async listStories(): Promise<Story[]> {
      const res = await fetch(`${API_BASE}/admin/stories`, { headers: getHeaders() });
      const data = await parseJson(res);
      if (!res.ok) throw new Error((data as { error?: string }).error || "Erro ao listar contos");
      return data as Story[];
    },
    async getStory(id: string): Promise<Story> {
      const res = await fetch(`${API_BASE}/admin/stories/${encodeURIComponent(id)}`, { headers: getHeaders() });
      const data = await parseJson(res);
      if (!res.ok) throw new Error((data as { error?: string }).error || "Conto não encontrado");
      return data as Story;
    },
    async createStory(body: Partial<Story>): Promise<Story> {
      const res = await fetch(`${API_BASE}/admin/stories`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      const data = await parseJson(res);
      if (!res.ok) throw new Error((data as { error?: string }).error || "Erro ao criar conto");
      return data as Story;
    },
    async updateStory(id: string, body: Partial<Story>): Promise<Story> {
      const res = await fetch(`${API_BASE}/admin/stories/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      const data = await parseJson(res);
      if (!res.ok) throw new Error((data as { error?: string }).error || "Erro ao atualizar conto");
      return data as Story;
    },
    async deleteStory(id: string): Promise<void> {
      const res = await fetch(`${API_BASE}/admin/stories/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!res.ok) {
        const data = (await parseJson(res)) as { error?: string };
        throw new Error(data.error || "Erro ao excluir conto");
      }
    },
    async uploadFile(file: File): Promise<{ url: string }> {
      const formData = new FormData();
      formData.append("file", file);
      const token = getToken();
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      let res: Response;
      try {
        res = await fetch(`${API_BASE}/admin/upload`, {
          method: "POST",
          headers,
          body: formData,
        });
      } catch (err) {
        throw new Error(
          "Não foi possível conectar à API. Inicie o servidor em outro terminal: npm run server"
        );
      }
      const data = await parseJson(
        res,
        "Upload falhou: a API não respondeu corretamente. Certifique-se de que o servidor está rodando (npm run server)."
      );
      if (!res.ok) throw new Error((data as { error?: string }).error || "Erro ao enviar arquivo");
      return data as { url: string };
    },
  },

  // Stripe: compra avulsa (checkout session)
  stripe: {
    async createCheckoutSession(storyId: string): Promise<{ url: string }> {
      const res = await fetch(`${API_BASE}/stripe/create-checkout-session`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ storyId }),
      });
      const data = await parseJson(res);
      if (!res.ok) throw new Error((data as { error?: string }).error || "Erro ao iniciar pagamento");
      return data as { url: string };
    },
  },
};

export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}
