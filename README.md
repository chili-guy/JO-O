# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Painel Admin

1. **Subir a API:** em outro terminal, `npm run server`.
2. **Login admin padrão** (criado automaticamente na primeira subida):
   - **Email:** `admin@admin.com`
   - **Senha:** `admin123`
3. **Acessar o painel:** abra `/admin/login` e entre com o usuário acima.
4. No painel você pode criar, editar e excluir contos (título, texto, vídeo, imagem, categoria, preço, tags, etc.). O site público usa esses contos automaticamente.

Para transformar outro usuário em admin: `node server/scripts/set-admin.js email@exemplo.com`

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Deploy integrado (backend + frontend em um servidor)

O app roda em **um único processo Node**: a API Express e o frontend (build do Vite) são servidos na mesma porta. Banco: **SQLite** em `server/data/` (sem serviços externos).

### Rodar local

- **Só frontend (dev):** `npm run dev` — Vite na porta 8080 com proxy para a API em 3001.
- **Só API:** `npm run server` — Express na 3001 (sem servir o frontend se não existir `dist/`).
- **Tudo integrado (produção local):** `npm run build && npm run start` — gera `dist/` e sobe o servidor na 3001; acesse `http://localhost:3001` para site e API.

### Deploy em produção (Railway, Render, Fly.io, etc.)

1. Conecte o repositório ao serviço.
2. **Build:** `npm run build`
3. **Start:** `npm run start` (ou `node server/index.js`)
4. Variáveis de ambiente: `JWT_SECRET`, `STRIPE_*`, `VITE_APP_URL` / `PUBLIC_APP_URL` (URL pública do app).
5. O banco SQLite fica em disco no servidor; em plataformas efêmeras use volume persistente se quiser manter dados.

**Nota:** Na Vercel a API não sobe com SQLite (módulo nativo). Para “tudo em um” com SQLite, use Railway, Render ou similar.

---

**Deploy na Vercel (sem configurar banco):** Faça o deploy normalmente. A API usa SQLite em `/tmp` — **sem persistência** (dados efêmeros). O admin (`admin@admin.com` / `admin123`) e os contos iniciais são recriados a cada cold start. Nada externo; só configurar `JWT_SECRET` nas variáveis de ambiente. Se o build falhar por causa do módulo nativo do SQLite, adicione **Turso** pelo Marketplace da Vercel para usar banco na nuvem.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
