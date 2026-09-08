# GitHub Repository Setup Guide
# Guía para configurar el repositorio en GitHub con CI/CD

## 📋 Pasos Iniciales

### 1. Crear el Repositorio

```bash
# En GitHub UI o via CLI
gh repo create farmatour5-repo --public --source=. --description "Farmatour5 - Sistema de Gamificación"

# O si ya existe
git remote add origin https://github.com/TU_USUARIO/farmatour5-repo.git
git branch -M main
git push -u origin main
```

### 2. Proteger la Rama Main

**GitHub UI → Settings → Branches:**
- Activar "Require a pull request before merging"
- Activar "Require status checks to pass before merging"
- Activar "Require branches to be up to date before merging"

```bash
# O via gh CLI
gh repo edit --enable-auto-merge --enable-discussions
```

### 3. Configurar Secrets

**Opción A: Automático (recomendado)**

```bash
# Ejecutar script de configuración
bash scripts/setup-github-secrets.sh TU_USUARIO/farmatour5-repo

# Ejemplo:
bash scripts/setup-github-secrets.sh davidmolina/farmatour5-repo
```

**Opción B: Manual**

```bash
# Ir a Settings → Secrets and variables → Actions → New repository secret

# Crear cada secret:
gh secret set DEPLOY_HOST -b "35.192.45.123"
gh secret set DEPLOY_USER -b "farmatour5"
gh secret set DEPLOY_KEY -b "$(cat ~/.ssh/farmatour5_deploy)"
gh secret set DEPLOY_BASE_PATH -b "/var/www/farmatour5"
gh secret set BACKEND_ENV -b "$(cat backend/.env.production)"
gh secret set FRONTEND_PARTICIPANTS_ENV -b "NEXT_PUBLIC_API_URL=https://farmatour5.com/api"
gh secret set FRONTEND_MANAGER_ENV -b "NEXT_PUBLIC_API_URL=https://farmatour5.com/api"
```

### 4. Estructura del Repositorio

```
farmatour5-repo/
├── .github/
│   └── workflows/
│       └── deploy.yml                   # ← CI/CD workflow
├── backend/
│   ├── src/
│   ├── dist/
│   ├── package.json
│   ├── tsconfig.json
│   ├── ecosystem.config.js              # PM2 config
│   ├── .env.example
│   └── .env.gitignore                   # ⚠️ Nunca comitear .env
├── frontend-participants/
│   ├── src/
│   ├── .next/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── .env.gitignore
├── frontend-manager/
│   ├── src/
│   ├── .next/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── .env.gitignore
├── database/
│   ├── schema.sql
│   └── migrations/
├── nginx/
│   ├── farmatour5.conf
│   └── proxy_headers.conf
├── scripts/
│   ├── setup-github-secrets.sh
│   ├── backup.sh
│   ├── health-check.sh
│   └── restore.sh
├── docs/
│   ├── ARQUITECTURA.md
│   ├── MANUAL_INSTALACION.md
│   ├── MANUAL_CI_CD.md
│   └── API_SWAGGER.md
├── .gitignore                           # ← Importante!
├── README.md
└── deploy.sh
```

### 5. Crear .gitignore

```bash
# Crear .gitignore si no existe
cat > .gitignore << 'EOF'
# Environment variables (NUNCA comitear .env)
.env
.env.local
.env.*.local
.env.production.local

# SSH Keys
*.key
*.pem
ssh_key
id_rsa
id_rsa.pub

# Node
node_modules/
npm-debug.log*
.npm
package-lock.json
dist/
.next/
out/

# IDE
.vscode/
.idea/
*.swp
*.swo
*.sublime-*

# OS
.DS_Store
Thumbs.db
.env.*.swp

# Build artifacts
build/
coverage/

# Logs
logs/
*.log

# Backups
backups/
*.tar.gz
*.bak
EOF
```

### 6. First Commit & Push

```bash
git add .
git commit -m "chore: Initial commit - Farmatour5 system"
git push -u origin main

# El workflow se ejecutará automáticamente
```

## 🔄 Workflow de Desarrollo

### Para Desarrolladores

```bash
# 1. Crear rama de feature
git checkout -b feature/nueva-mision
git pull origin main

# 2. Hacer cambios
nano backend/src/services/missions.service.ts
npm run build  # Compilar
npm run test   # Tests

# 3. Commit
git add .
git commit -m "feat: Agregar nueva mision"

# 4. Push
git push origin feature/nueva-mision

# 5. Crear Pull Request
# En GitHub UI: Create Pull Request → Describir cambios

# 6. Esperar reviews y merge
# Una vez approved, hacer Merge
# ✅ GitHub Actions se dispara automáticamente
```

### Timeline de CI/CD

```
[1] PR creada → Tests ejecutan
[2] Cambios aprovados → Merge a main
[3] Workflow inicia:
    - Build backend (2-3 min)
    - Build frontends (3-4 min)
    - Tests (1 min)
    - Deploy (2-3 min)
[4] ✅ Sistemas en vivo después de 8-10 minutos
```

## 🔍 Monitoreo del Deployment

### Ver Workflow en Ejecución

```bash
# En GitHub UI
Settings → Actions → Últimos workflows

# Ver logs en tiempo real
gh run view LATEST --log --tail=20

# Ver status de todos los jobs
gh run view LATEST
```

### Logs del Servidor

```bash
# SSH al servidor
ssh farmatour5@SERVIDOR_IP

# Ver status de PM2
pm2 status

# Ver logs en vivo
pm2 logs

# Ver logs de deployment
tail -f /var/www/farmatour5/logs/deployments.log
```

## 🆘 Troubleshooting

### Workflow falla en Build

**Error típico:**
```
npm ERR! npm ERR! code E401
npm ERR! npm ERR! 401 Unauthorized
```

**Solución:**
```bash
# Verificar que package-lock.json no esté corrupto
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "fix: Update dependencies"
git push
```

### Workflow falla en Deploy

**Error típico:**
```
scp: connection refused
```

**Solución:**
```bash
# Verificar SSH key en GitHub Secrets
gh secret view DEPLOY_KEY

# Verificar conectividad
ssh -i ~/.ssh/farmatour5_deploy farmatour5@SERVIDOR_IP

# Verificar que directorio existe
ssh farmatour5@SERVIDOR_IP ls -la /var/www/farmatour5/

# Re-generar SSH key si es necesario
ssh-keygen -t rsa -b 4096 -f ~/.ssh/farmatour5_deploy -N ""
# Actualizar DEPLOY_KEY en GitHub
```

### Revertir un Deployment

```bash
# Si el deployment anterior funcionaba:

# Opción 1: Revertir commit
git revert COMMIT_HASH -m 1
git push origin main
# El nuevo workflow desplegará la versión anterior

# Opción 2: Restaurar desde backup
ssh farmatour5@SERVIDOR_IP
cd /var/www/farmatour5
tar -xzf backups/backend_20260822_143000.tar.gz
pm2 restart farmatour5-backend
sudo systemctl reload nginx
```

## 📊 Buenas Prácticas

### Commits

```bash
# Usar conventional commits
git commit -m "feat: Nueva sección de reportería"
git commit -m "fix: Corregir error en autenticación"
git commit -m "chore: Actualizar dependencias"
git commit -m "docs: Agregar manual de CI/CD"
git commit -m "test: Agregar tests para Progress Module"
```

### Pull Requests

- [ ] Descripción clara del cambio
- [ ] Referencia a issue (si existe)
- [ ] Tests pasando
- [ ] No hay conflictos
- [ ] Code review aprobado

### Branches

```
main                        # Production ready
├── feature/xxx             # Nuevas características
├── fix/xxx                 # Bug fixes
├── docs/xxx                # Documentación
└── refactor/xxx            # Refactoring
```

## 🔐 Seguridad

### Nunca comitear:
```bash
✗ .env
✗ .env.local
✗ *.key
✗ *.pem
✗ secrets/*
✗ credentials.json
```

### Si accidentalmente committeas un secret:

```bash
# Option 1: Revertir el commit
git revert HEAD
git push

# Option 2: Hacer fuerza (más agresivo)
git reset --soft HEAD~1
rm backend/.env
git add .
git commit -m "chore: Remove .env file"
git push --force-with-lease origin branch-name

# ⚠️ IMPORTANTE: Cambiar secrets en el servidor y GitHub
```

---

## 📞 Support

Para problemas o preguntas:
1. Ver [MANUAL_CI_CD.md](../docs/MANUAL_CI_CD.md)
2. Crear un issue en GitHub
3. Revisar logs: `gh run view LATEST --log`

---

**Última actualización:** Agosto 2026
