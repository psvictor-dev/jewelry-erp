# Roadmap — Servidor Local ERP Joalheria

**Objetivo:** Hospedar o ERP e o e-commerce em um notebook antigo com Ubuntu Server,
acessível online via Cloudflare Tunnel.

**Stack do servidor:** Ubuntu Server 24.04 LTS · Node.js 20 · PM2 · Nginx · Docker · Cloudflare Tunnel

---

## Fase 1 — Instalar Ubuntu Server

**Baixar a ISO:**
```
https://ubuntu.com/download/server
Ubuntu Server 24.04.2 LTS (~2.7 GB)
```

**Criar pendrive bootável:**
```
Windows → Rufus (rufus.ie)
Mac     → Balena Etcher (balena.io/etcher)
```

**Durante a instalação:**
- Idioma: English (evita bugs de encoding)
- Rede: interface cabeada (eth0 / enpXsX)
- IP estático:
  - IP: 192.168.1.100 (ajustar conforme range da rede)
  - Gateway: 192.168.1.1 (IP do roteador)
  - DNS: 1.1.1.1
- Habilitar OpenSSH durante a instalação
- Sem interface gráfica

**Impedir suspensão ao fechar a tampa:**
```bash
sudo sed -i 's/#HandleLidSwitch=suspend/HandleLidSwitch=ignore/' /etc/systemd/logind.conf
sudo systemctl restart systemd-logind
```

---

## Fase 2 — Instalar Dependências

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Yarn e PM2
npm install -g yarn pm2

# Git e Nginx
sudo apt install -y git nginx

# Docker + Docker Compose
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
```

---

## Fase 3 — Deploy do Projeto

```bash
# Clonar repositório
git clone <URL_DO_REPO> ~/erp
cd ~/erp

# Instalar dependências
yarn install

# Configurar variáveis de ambiente
cp apps/erp-api/.env.example apps/erp-api/.env
nano apps/erp-api/.env
# Alterar JWT_SECRET para uma chave forte
# DATABASE_URL e REDIS_URL já virão corretos para o Docker

# Subir banco de dados
yarn db:up

# Migrations e seed
sleep 5 && yarn db:migrate
yarn db:seed

# Build de todos os apps
yarn build
```

---

## Fase 4 — PM2 (Gerenciador de Processos)

Criar `ecosystem.config.js` na raiz do projeto:

```js
module.exports = {
  apps: [
    {
      name: 'erp-api',
      cwd: './apps/erp-api',
      script: 'node',
      args: 'dist/main.js',
      env: { NODE_ENV: 'production', PORT: 3000 },
      restart_delay: 3000,
    },
    {
      name: 'erp-web',
      cwd: './apps/erp-web',
      script: 'npx',
      args: 'serve dist -p 3001',
      restart_delay: 3000,
    },
    {
      name: 'ecommerce-web',
      cwd: './apps/ecommerce-web',
      script: 'node',
      args: '.next/standalone/server.js',
      env: { NODE_ENV: 'production', PORT: 3002 },
      restart_delay: 3000,
    },
  ],
};
```

```bash
# Iniciar todos os apps
pm2 start ecosystem.config.js

# Salvar e configurar para reiniciar após reboot
pm2 save
pm2 startup   # copiar e colar o comando que aparecer
```

---

## Fase 5 — Nginx (Reverse Proxy)

```bash
sudo nano /etc/nginx/sites-available/erp
```

```nginx
server {
    listen 80;
    server_name erp.seudominio.com.br;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name api.seudominio.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name loja.seudominio.com.br;

    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/erp /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## Fase 6 — Acesso Online via Cloudflare Tunnel

**Pré-requisito:** domínio apontado para o Cloudflare.
Domínios `.com.br` custam ~R$40/ano no Registro.br (registro.br).

```bash
# Instalar cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# Login (abre link no terminal — autenticar no browser)
cloudflared tunnel login

# Criar tunnel
cloudflared tunnel create erp-joalheria

# Criar config
nano ~/.cloudflared/config.yml
```

```yaml
tunnel: erp-joalheria
credentials-file: /home/SEU_USUARIO/.cloudflared/<ID>.json

ingress:
  - hostname: erp.seudominio.com.br
    service: http://localhost:3001
  - hostname: api.seudominio.com.br
    service: http://localhost:3000
  - hostname: loja.seudominio.com.br
    service: http://localhost:3002
  - service: http_status:404
```

```bash
# Adicionar DNS no Cloudflare
cloudflared tunnel route dns erp-joalheria erp.seudominio.com.br
cloudflared tunnel route dns erp-joalheria api.seudominio.com.br
cloudflared tunnel route dns erp-joalheria loja.seudominio.com.br

# Rodar como serviço (inicia com o sistema)
sudo cloudflared service install
sudo systemctl start cloudflared
```

HTTPS é gerenciado automaticamente pelo Cloudflare.

---

## Fase 7 — Backup Automático do Banco

```bash
mkdir ~/backups
nano ~/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M)
docker exec erp_joalheria_pg pg_dump -U erp_user erp_joalheria > ~/backups/erp_$DATE.sql
find ~/backups -name "*.sql" -mtime +30 -delete
```

```bash
chmod +x ~/backup-db.sh

# Agendar todo dia às 3h
crontab -e
# Adicionar a linha:
0 3 * * * /home/SEU_USUARIO/backup-db.sh
```

---

## Resumo de URLs

| URL | Serviço |
|-----|---------|
| `erp.seudominio.com.br` | ERP — gestão interna |
| `api.seudominio.com.br` | API REST |
| `loja.seudominio.com.br` | E-commerce público |

---

## Checklist de Execução

- [x] ISO do Ubuntu Server 24.04 baixada
- [x] Pendrive bootável criado
- [x] Ubuntu instalado com IP estático e SSH
- [x] Tampa configurada para não suspender
- [x] Node.js, Yarn, PM2, Nginx, Docker instalados
- [ ] Repositório clonado e dependências instaladas
- [ ] `.env` configurado com JWT_SECRET forte
- [ ] Banco subido, migrations e seed aplicados
- [ ] Build dos apps concluído
- [ ] PM2 iniciado e configurado para autostart
- [ ] Nginx configurado e ativo
- [ ] Domínio registrado e apontado para Cloudflare
- [ ] Cloudflare Tunnel criado e rodando como serviço
- [ ] Backup automático configurado no cron
