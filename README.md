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

## Deploy na Vercel + GitHub

### 1. Subir o código para o GitHub

```bash
cd story-sanctuary-main

# Se ainda não inicializou o repositório
git init

# Adicionar tudo e fazer o primeiro commit
git add .
git commit -m "Configuração para Vercel e GitHub"

# Criar um repositório novo no GitHub (github.com → New repository).
# Depois vincule e envie (troque SEU_USUARIO e NOME_DO_REPO):
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
git branch -M main
git push -u origin main
```

### 2. Conectar e publicar na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login (pode usar conta GitHub).
2. **Add New** → **Project** → importe o repositório do GitHub.
3. Confirme: **Build Command:** `npm run build`, **Output Directory:** `dist`.
4. Em **Environment Variables** adicione:
   - `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VITE_APP_URL` e `PUBLIC_APP_URL` (URL do site, ex.: `https://seu-projeto.vercel.app`).
   - **Banco na Vercel (obrigatório para a API):** `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN`. Crie um banco em [turso.tech](https://turso.tech), pegue a URL (libsql://…) e um token de acesso e configure nas variáveis. Sem isso a API retorna "temporariamente indisponível".
5. Clique em **Deploy**.

### 3. Depois do deploy

- No Stripe, configure o webhook: `https://seu-projeto.vercel.app/api/webhooks/stripe` (evento **checkout.session.completed**).
- A API usa **Turso (libsql)** na Vercel; localmente usa SQLite em `server/data`.

---

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
