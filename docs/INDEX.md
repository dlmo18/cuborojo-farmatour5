# 📖 ÍNDICE COMPLETO - Farmatour5

## 🎯 Comienza Aquí

1. **[DELIVERY.md](./DELIVERY.md)** - Resumen de todo lo entregado (5 min)
2. **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Estructura del proyecto (5 min)
3. **Elige tu camino** (ver abajo)

---

## 📚 Rutas de Aprendizaje

### 🚀 "Quiero Deployer Ahora" (30 minutos)
```
1. CI_CD_QUICKSTART.md          ← Lee esto (5 min)
2. scripts/setup-github-secrets.sh   ← Ejecuta esto
3. git push origin main          ← GitHub Actions despliega
4. ✅ Sistema en vivo!
```

### 🔧 "Quiero Instalar Manualmente" (1-2 horas)
```
1. docs/MANUAL_INSTALACION.md   ← Lee sección por sección
2. deploy.sh                    ← Ejecuta en servidor
3. Seguir pasos del manual      ← PostgreSQL, backend, frontends
4. ✅ Sistema en vivo!
```

### 📝 "Quiero Entender la Arquitectura" (30 min)
```
1. docs/ARQUITECTURA.md         ← Cómo funciona todo
2. docs/API_SWAGGER.md          ← Endpoints disponibles
3. PROJECT_STRUCTURE.md         ← Estructura de archivos
4. Backend: backend/src/        ← Leer código
5. Frontends: frontend-*/src/   ← Leer componentes
```

### 🔄 "Quiero Configurar CI/CD" (15 minutos)
```
1. GITHUB_SETUP.md              ← Leer completo
2. docs/MANUAL_CI_CD.md         ← Referencia detallada
3. scripts/setup-github-secrets.sh  ← Configurar
4. ✅ Listo!
```

### 🐛 "Algo Falló" (10-30 min)
```
1. Ver sección "Troubleshooting" en docs/MANUAL_CI_CD.md
2. Ver logs: pm2 logs
3. Revisar secrets: gh secret list
4. Revisar logs de GitHub Actions
5. Rollback: git revert + git push
```

---

## 📄 Lista de Documentos

### Guides Principales
| Documento | Duración | Para Quién |
|-----------|----------|-----------|
| [DELIVERY.md](./DELIVERY.md) | 5 min | Todos |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | 5 min | Todos |
| [CI_CD_QUICKSTART.md](./CI_CD_QUICKSTART.md) | 5 min | Dev con prisa |
| [GITHUB_SETUP.md](./GITHUB_SETUP.md) | 15 min | Dev |
| [docs/MANUAL_INSTALACION.md](./docs/MANUAL_INSTALACION.md) | 30 min | Ops/DevOps |
| [docs/MANUAL_CI_CD.md](./docs/MANUAL_CI_CD.md) | 20 min | DevOps |
| [docs/ARQUITECTURA.md](./docs/ARQUITECTURA.md) | 15 min | Arquitectos |
| [docs/API_SWAGGER.md](./docs/API_SWAGGER.md) | 10 min | Developers |

### Scripts Importantes
| Script | Función | Uso |
|--------|---------|-----|
| [deploy.sh](./deploy.sh) | Setup automático del servidor | `sudo bash deploy.sh` |
| [scripts/setup-github-secrets.sh](./scripts/setup-github-secrets.sh) | Configurar secrets | `bash script.sh owner/repo` |
| [scripts/backup.sh](./scripts/backup.sh) | Backup de BD | `bash scripts/backup.sh` |
| [scripts/health-check.sh](./scripts/health-check.sh) | Monitoreo | `bash scripts/health-check.sh` |

### Carpetas Principales
| Carpeta | Contenido | Para |
|---------|----------|------|
| [backend](./backend/) | NestJS API | Backend Developers |
| [frontend-participants](./frontend-participants/) | NextJS (participantes) | Frontend Developers |
| [frontend-manager](./frontend-manager/) | NextJS (admin) | Frontend Developers |
| [database](./database/) | PostgreSQL Schema | DBAs |
| [nginx](./nginx/) | Reverse Proxy Config | DevOps |
| [docs](./docs/) | Documentación | Todos |
| [scripts](./scripts/) | Utilitarios | DevOps/Ops |

---

## 🗺️ Mapa de Características

### Backend (NestJS - 12 módulos)
- ✅ Auth (JWT dual strategy)
- ✅ Users (Manager/Reporter)
- ✅ Participants (CRUD + Import)
- ✅ Groups (Agrupación)
- ✅ Worlds/Levels/Missions/Questions
- ✅ Progress (Seguimiento + Estrellas)
- ✅ Reports (KPIs)
- ✅ Media (Biblioteca)
- ✅ Config (Configuraciones)
- ✅ Activity (Logs)

### Frontend Participantes
- ✅ Login por DNI
- ✅ Selección de mundos
- ✅ Navegación de niveles/misiones
- ✅ Evaluaciones con preguntas
- ✅ Contador de estrellas
- ✅ Ranking de grupo
- ✅ Efectos de sonido
- ✅ Regalo con timer

### Frontend Manager
- ✅ Login usuario/contraseña
- ✅ Dashboard con KPIs
- ✅ Gestión de usuarios
- ✅ Gestión de participantes
- ✅ Gestión de contenido
- ✅ Biblioteca de medios
- ✅ Reportería
- ✅ Configuración

### DevOps
- ✅ Nginx con SSL
- ✅ GitHub Actions CI/CD
- ✅ PM2 clustering
- ✅ Backup automático
- ✅ Health monitoring
- ✅ Logging

---

## 🔐 Seguridad Checklist

**Antes de Producción:**
- [ ] Cambiar JWT_SECRET
- [ ] Cambiar JWT_PARTICIPANT_SECRET
- [ ] Cambiar DB_PASS
- [ ] Cambiar contraseña admin
- [ ] Regenerar SSH key
- [ ] Configurar GitHub Secrets
- [ ] Habilitar branch protection en main
- [ ] Revisar .gitignore

---

## ⚡ Comandos Rápidos

```bash
# Setup rápido en GitHub
bash scripts/setup-github-secrets.sh usuario/repo

# Ver workflow ejecutándose
gh run view LATEST --log

# SSH al servidor
ssh farmatour5@SERVER_IP

# Ver estado de servicios
pm2 status

# Ver logs en tiempo real
pm2 logs

# Health check
bash /var/www/farmatour5/scripts/health-check.sh

# Backup de BD
bash /var/www/farmatour5/scripts/backup.sh

# Revertir deployment
git revert COMMIT_HASH -m 1
git push origin main
```

---

## 📊 Estadísticas

| Métrica | Cantidad |
|---------|----------|
| Documentos | 8 |
| Guías técnicas | 4 |
| Scripts | 4 |
| Módulos backend | 12 |
| Endpoints API | 50+ |
| Tablas BD | 20+ |
| Líneas documentación | 2000+ |
| Líneas código | 1000s |

---

## 🎯 Objetivos Logrados

- ✅ Base de datos escalable
- ✅ API REST segura
- ✅ Frontend de participantes
- ✅ Frontend de administración
- ✅ CI/CD automático
- ✅ Documentación completa
- ✅ Scripts de utilidad
- ✅ Backup y monitoreo
- ✅ SSL/TLS
- ✅ Rate limiting
- ✅ Logging
- ✅ RBAC

---

## 🚀 Próximos Pasos

### Inmediato (Hoy)
1. Leer [DELIVERY.md](./DELIVERY.md)
2. Configurar GitHub Secrets
3. Hacer push a main
4. Ver GitHub Actions ejecutarse

### Corto Plazo (Esta Semana)
1. Crear usuarios admin
2. Importar participantes
3. Crear contenido (mundos, misiones)
4. Testing completo

### Mediano Plazo (Este Mes)
1. Monitoreo en producción
2. Optimizar performance
3. Entrenar a managers
4. Lanzar al público

### Largo Plazo (Futuro)
1. WebSocket para updates
2. Redis caché
3. Email notifications
4. App móvil
5. Multi-idioma

---

## 📞 Ayuda Rápida

| Problema | Solución |
|----------|----------|
| ¿Cómo inicio? | Lee [DELIVERY.md](./DELIVERY.md) |
| ¿Cómo depliego? | Ve a [CI_CD_QUICKSTART.md](./CI_CD_QUICKSTART.md) |
| ¿Workflow falla? | Ver [docs/MANUAL_CI_CD.md](./docs/MANUAL_CI_CD.md#-troubleshooting) |
| ¿Error en BD? | Ver [docs/MANUAL_INSTALACION.md](./docs/MANUAL_INSTALACION.md#-troubleshooting) |
| ¿Configurar GitHub? | Lee [GITHUB_SETUP.md](./GITHUB_SETUP.md) |
| ¿API docs? | Ver [docs/API_SWAGGER.md](./docs/API_SWAGGER.md) |
| ¿Estructura proyecto? | Lee [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) |
| ¿Arquitectura? | Lee [docs/ARQUITECTURA.md](./docs/ARQUITECTURA.md) |

---

## 🎓 Recomendaciones de Lectura

**Para Devops/Ops:**
1. [DELIVERY.md](./DELIVERY.md)
2. [docs/MANUAL_INSTALACION.md](./docs/MANUAL_INSTALACION.md)
3. [docs/MANUAL_CI_CD.md](./docs/MANUAL_CI_CD.md)
4. [deploy.sh](./deploy.sh)

**Para Developers:**
1. [DELIVERY.md](./DELIVERY.md)
2. [docs/ARQUITECTURA.md](./docs/ARQUITECTURA.md)
3. [docs/API_SWAGGER.md](./docs/API_SWAGGER.md)
4. [backend/src/](./backend/src/)

**Para Project Managers:**
1. [DELIVERY.md](./DELIVERY.md)
2. [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

**Para Arquitectos:**
1. [docs/ARQUITECTURA.md](./docs/ARQUITECTURA.md)
2. [docs/MANUAL_INSTALACION.md](./docs/MANUAL_INSTALACION.md) - Infrastructure section
3. [database/schema.sql](./database/schema.sql) - ER diagram mentalmente

---

## ✅ Checklist Inicial

- [ ] Clonar repositorio
- [ ] Leer [DELIVERY.md](./DELIVERY.md)
- [ ] Revisar [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
- [ ] Elegir ruta de aprendizaje
- [ ] Seguir los pasos
- [ ] ✅ Sistema funcionando

---

**Sistema Listo para Producción** ✅  
**Documentación Completa** ✅  
**¡Bienvenido a Farmatour5!** 🎉

---

Última actualización: Agosto 2026  
Versión: 1.0
