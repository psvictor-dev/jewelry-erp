# 📌 Retomar Amanhã

## Onde parei (22/04/2026)

**Servidor Ubuntu (notebook CCE) — estado atual:**
- Hostname: `eternity-server`
- Usuário: `victor`
- IP estático: `10.0.0.50/24` · Gateway: `10.0.0.1`
- SSH funcionando do Mac (`ssh victor@10.0.0.50`)
- Fase 1 e 2 do `ROADMAP_SERVIDOR.md` concluídas:
  - Ubuntu 24.04.3 LTS instalado
  - Updates aplicados (0 pendentes)
  - Tampa não suspende ao fechar
  - Node 20, Yarn, PM2, Git, Nginx, Docker 29.4.1 + Compose v5.1.3 instalados
  - `docker ps` roda sem `sudo` (grupo aplicado)

**Falta trocar a senha forte** (hoje está `eternity2026`): rodar `passwd` no servidor via SSH.

---

## Fase 3 — Deploy do projeto (continuar daqui)

O código ainda está só local no Mac, sem remote. Roteiro:

### 1. No Mac — inicializar git (se ainda não estiver) e checar SSH do GitHub

```bash
cd ~/Dev/ti_eternity
git status
```

**Se retornar `fatal: not a git repository`:**
```bash
git init
git branch -M main
git add .
git status    # conferir que .env e node_modules NÃO aparecem
git commit -m "chore: initial commit"
```

**Checar SSH do GitHub:**
```bash
ls -la ~/.ssh/id_*.pub 2>/dev/null
ssh -T git@github.com
```

- `Hi <usuario>! You've successfully authenticated...` → pronto.
- `Permission denied (publickey)` → chave existe mas não registrada. Adicionar `~/.ssh/id_ed25519.pub` em github.com/settings/keys.
- `No such file or directory` → gerar nova: `ssh-keygen -t ed25519 -C "mac-victor"` e adicionar a pública no GitHub.

### 2. Criar repositório privado no GitHub

Acessar [github.com/new](https://github.com/new):
- Nome: `ti_eternity`
- Visibilidade: **Private**
- **NÃO** marcar "Add a README", "Add .gitignore" nem "Choose a license" (já temos código)

Anotar a URL SSH: `git@github.com:SEU_USUARIO/ti_eternity.git`

### 3. No Mac — push inicial

```bash
cd ~/Dev/ti_eternity
git remote add origin git@github.com:SEU_USUARIO/ti_eternity.git
git push -u origin main
```

### 4. No servidor — gerar SSH key e adicionar como Deploy Key

```bash
# Conectar via SSH do Mac
ssh victor@10.0.0.50

# Gerar chave
ssh-keygen -t ed25519 -C "eternity-server" -f ~/.ssh/id_ed25519 -N ""

# Mostrar a chave pública (copiar o output)
cat ~/.ssh/id_ed25519.pub
```

No GitHub, no repositório `ti_eternity`:
- Settings → Deploy keys → Add deploy key
- Title: `eternity-server`
- Key: colar o conteúdo do `id_ed25519.pub`
- **NÃO** marcar "Allow write access" (read-only é suficiente pra pull)

Testar no servidor:
```bash
ssh -T git@github.com
# Esperado: "Hi SEU_USUARIO/ti_eternity! You've successfully authenticated..."
```

### 5. No servidor — clonar e configurar

```bash
git clone git@github.com:SEU_USUARIO/ti_eternity.git ~/erp
cd ~/erp

# Criar .env
cp .env.example apps/erp-api/.env
# Editar e trocar JWT_SECRET por chave forte (ex: openssl rand -hex 32)
nano apps/erp-api/.env
```

### 6. Instalar dependências, subir banco, build

```bash
# Em ~/erp
yarn install

# Subir Postgres + Redis
yarn db:up

# Aguardar Postgres ficar saudável (5s costuma bastar)
sleep 5

# Migrations + seed
yarn db:migrate
yarn db:seed

# Build dos 3 apps
yarn build
```

Ao final, os 3 apps devem estar prontos pra rodar (Fase 4 — PM2 — vem em seguida).

---

## Pendente depois da Fase 3

- Fase 4: PM2 (ecosystem.config.js + autostart)
- Fase 5: Nginx reverse proxy
- Fase 6: Domínio + Cloudflare Tunnel (HTTPS)
- Fase 7: Backup automático do banco
- Integração WhatsApp (Evolution API) — aguardando exemplos dos 3 tipos de mensagem (VENDA, COMPRA, ACERTO) + whitelist de números + definir se há resposta automática
- Operacional: cadastrar produtos do estoque, clientes, fornecedores
