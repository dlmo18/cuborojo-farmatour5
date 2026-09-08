# ⚡ Quick Start - Farmatour5 CI/CD Setup

Este documento es un **quick start** para configurar el CI/CD en GitHub. Para información completa, ver [GITHUB_SETUP.md](./GITHUB_SETUP.md) y [MANUAL_CI_CD.md](./docs/MANUAL_CI_CD.md).

## 🚀 Configuración Rápida (5 minutos)

### Prerequisitos

```bash
# 1. Tener GitHub CLI instalado
gh --version

# 2. Estar autenticado
gh auth status

# 3. Tener SSH key para el servidor
ls ~/.ssh/farmatour5_deploy
```

### Pasos

#### 1️⃣ Preparar Servidor (Si es primera vez)

```bash
# En servidor GCP
# Crear SSH key
ssh-keygen -t rsa -b 4096 -f ~/.ssh/farmatour5_deploy -N ""

# Agregar a authorized_keys
ssh-copy-id -i ~/.ssh/farmatour5_deploy.pub farmatour5@SERVIDOR_IP
```

#### 2️⃣ Configurar Secrets en GitHub

**Opción A: Automático (Recomendado)**
```bash
bash scripts/setup-github-secrets.sh TU_USUARIO/REPO_NAME

# Ejemplo:
bash scripts/setup-github-secrets.sh davidmolina/farmatour5-repo
```

**Opción B: Manual**
```bash
# Ir a: GitHub → Settings → Secrets and variables → Actions

# Agregar estos 7 secrets:
DEPLOY_HOST              # 35.192.45.123
DEPLOY_USER              # farmatour5
DEPLOY_KEY               # Contenido de ~/.ssh/farmatour5_deploy
DEPLOY_BASE_PATH         # /var/www/farmatour5
BACKEND_ENV              # (Ver ejemplo abajo)
FRONTEND_PARTICIPANTS_ENV # NEXT_PUBLIC_API_URL=...
FRONTEND_MANAGER_ENV     # NEXT_PUBLIC_API_URL=...
```

#### 3️⃣ Ejemplo de Environment Variables

**BACKEND_ENV Secret:**
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=farmatour5
DB_PASS=TU_PASSWORD
DB_NAME=farmatour5
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=8h
JWT_PARTICIPANT_SECRET=$(openssl rand -hex 32)
JWT_PARTICIPANT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://farmatour5.com
UPLOAD_DIR=/var/www/farmatour5/uploads
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
```

**FRONTEND_PARTICIPANTS_ENV:**
```
NEXT_PUBLIC_API_URL=http://farmatour5-api.cuborojo.pe/api
```

**FRONTEND_MANAGER_ENV:**
```
NEXT_PUBLIC_API_URL=http://farmatour5-api.cuborojo.pe/api
```

#### 4️⃣ Push a Main y Probar

```bash
git add .
git commit -m "chore: Configure CI/CD"
git push origin main

# Ver workflow
gh run list --workflow=deploy.yml
gh run view LATEST --log
```

## ✅ Verificar Setup

### En GitHub
1. Ir a **Settings → Secrets and variables → Actions**
2. Verificar que existan 7 secrets
3. Ir a **Actions** → Ver workflow en ejecución

### En Servidor
```bash
ssh farmatour5@SERVIDOR_IP
pm2 status  # Verificar que servicios estén corriendo
curl http://localhost:3001/health
curl http://localhost:3000/  # Frontend participantes
```

## 🔄 Workflow Típico

```bash
# 1. Crear rama
git checkout -b feature/nueva-funcion

# 2. Hacer cambios
nano backend/src/...
npm run build && npm run test

# 3. Commit & Push
git add .
git commit -m "feat: Nueva funcion"
git push origin feature/nueva-funcion

# 4. Crear PR en GitHub
# 5. Aprobar y Merge a main
# 6. ✅ Deployment automático!

# Ver progreso
gh run view LATEST --log
```

## 🆘 Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| `Permission denied (publickey)` | Revisar DEPLOY_KEY en Secrets |
| `npm install failed` | `rm package-lock.json && npm install` |
| `Build timeout` | Aumentar timeout en workflow |
| `Nginx reload failed` | `ssh ... sudo nginx -t` |

## 📚 Documentación Completa

- **Instalación manual**: [MANUAL_INSTALACION.md](./docs/MANUAL_INSTALACION.md)
- **CI/CD detallado**: [MANUAL_CI_CD.md](./docs/MANUAL_CI_CD.md)
- **Setup GitHub**: [GITHUB_SETUP.md](./GITHUB_SETUP.md)
- **Arquitectura**: [docs/ARQUITECTURA.md](./docs/ARQUITECTURA.md)

## ⚡ Comandos Útiles

```bash
# Ver último workflow
gh run view LATEST

# Ver logs completos
gh run view LATEST --log

# Listar últimos 10 deployments
gh run list --workflow=deploy.yml --limit 10

# Ver status de un deployment específico
gh run view RUN_ID

# Revertir un deployment
git revert COMMIT_HASH -m 1
git push origin main
```

## 🎯 Siguiente Paso

Una vez configurado, el workflow se ejecutará **automáticamente** cada vez que hagas merge a `main`.

**¡Listo! Ya tienes CI/CD funcionando.** 🚀

---

Para más detalles, ver [MANUAL_CI_CD.md](./docs/MANUAL_CI_CD.md)
