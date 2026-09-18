# Guía de Despliegue - Frontend Participants Login Mejorado

**Versión:** 1.0  
**Fecha:** 2026-09-18

---

## 📋 Tabla de Contenidos

1. [Despliegue Local](#despliegue-local)
2. [Despliegue en Desarrollo](#despliegue-en-desarrollo)
3. [Despliegue en Producción](#despliegue-en-producción)
4. [Despliegue con Docker](#despliegue-con-docker)
5. [Despliegue con Nginx](#despliegue-con-nginx)
6. [Verificación Post-Despliegue](#verificación-post-despliegue)
7. [Troubleshooting](#troubleshooting)

---

## 🏠 Despliegue Local

### **Requisitos Previos**
- Node.js 18+ instalado
- npm o yarn disponible
- Puerto 3000 disponible

### **Pasos**

```bash
# 1. Navegar al directorio
cd /home/david/Escritorio/server/cuborojo-farmatour5/frontend-participants

# 2. Instalar dependencias (primera vez)
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Acceder a la aplicación
# Abrir: http://localhost:3000/login
```

### **Salida Esperada**
```
> farmatour5-participants@1.0.0 dev
> next dev

▲ Next.js 14.0.0
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.3s
```

### **Detener el Servidor**
```bash
# Presionar Ctrl+C en la terminal
```

---

## 🔧 Despliegue en Desarrollo

### **Configuración de Variables de Entorno**

Crear archivo `.env.local`:

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ASSET_PREFIX=
NEXT_PUBLIC_BASE_PATH=

# Opcional: para debugging
DEBUG=true
```

### **Ejecutar en Modo Desarrollo**

```bash
# Terminal 1: Iniciar frontend
cd frontend-participants
npm run dev

# Terminal 2: Iniciar backend (si es necesario)
cd ../backend
npm run start:dev

# Terminal 3: Servidor de base de datos (si es necesario)
# Verificar que base de datos está ejecutándose
```

### **Acceder a la Aplicación**
- URL: `http://localhost:3000/login`
- DevTools activas para debugging
- Hot reload automático en cambios

---

## 🚀 Despliegue en Producción

### **Fase 1: Preparación**

```bash
cd /home/david/Escritorio/server/cuborojo-farmatour5/frontend-participants

# Limpiar build anterior
rm -rf .next
rm -rf out

# Instalar dependencias (asegurar versiones correctas)
npm ci  # Usar package-lock.json exacto

# Ejecutar linting (opcional pero recomendado)
npm run lint 2>&1 | tee lint-report.log
```

### **Fase 2: Build**

```bash
# Crear build de producción
npm run build

# Esperado:
# ✓ Compiled successfully
# ✓ Linting and checking validity of types
# ✓ Collecting page data
# ✓ Generating static pages
```

### **Fase 3: Optimización**

```bash
# Verificar tamaño del build
du -sh .next

# Esperado: ~200-300MB (.next es bastante grande)

# Listar imágenes y fuentes generadas
ls -lh public/images/
ls -lh public/fonts/

# Verificar que todas las imágenes están presentes
file public/images/*
```

### **Fase 4: Iniciar en Producción**

```bash
# Opción A: Usar next start
npm start

# Opción B: Usar PM2 (recomendado)
pm2 start "npm start" --name "farmatour5-participants" --log-date-format="YYYY-MM-DD HH:mm:ss"
pm2 startup
pm2 save
```

### **Verificación de Producción**

```bash
# Verificar que el servidor está respondiendo
curl http://localhost:3000/login

# Verificar que assets se sirven
curl -I http://localhost:3000/images/logo.png
curl -I http://localhost:3000/fonts/Blinker-Regular.woff2
```

---

## 🐳 Despliegue con Docker

### **Dockerfile Existente (si aplica)**

Si ya existe un Dockerfile, debe incluir:

```dockerfile
# Etapa de build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build
RUN npm run build

# Etapa de producción
FROM node:18-alpine

WORKDIR /app

# Copiar solo lo necesario del build anterior
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Exponer puerto
EXPOSE 3000

# Iniciar aplicación
CMD ["npm", "start"]
```

### **Crear Dockerfile (si no existe)**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código y archivos públicos
COPY src/ ./src/
COPY public/ ./public/
COPY next.config.js .
COPY tsconfig.json .
COPY postcss.config.js .
COPY tailwind.config.ts .

# Build
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/login || exit 1

# Iniciar
CMD ["npm", "start"]
```

### **Construir Imagen Docker**

```bash
# Desde el directorio root del proyecto
docker build -t farmatour5-participants:latest .

# Verificar que se construyó
docker images | grep farmatour5-participants

# Esperado: farmatour5-participants | latest | ... | ~1.5GB
```

### **Ejecutar Contenedor**

```bash
# Opción A: Ejecución básica
docker run -p 3000:3000 farmatour5-participants:latest

# Opción B: Con volúmenes y logs
docker run -d \
  --name farmatour5-participants \
  -p 3000:3000 \
  -v /var/log/farmatour5:/app/logs \
  -e NEXT_PUBLIC_API_URL=http://backend:8000 \
  farmatour5-participants:latest

# Opción C: Con Docker Compose (recomendado)
# Ver sección Docker Compose más abajo
```

### **Docker Compose**

Crear `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend-participants:
    build:
      context: ./frontend-participants
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
      - NODE_ENV=production
    volumes:
      - /var/log/farmatour5:/app/logs
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/login"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://...
    restart: unless-stopped
    # ... más configuración
```

**Ejecutar:**

```bash
# Construir e iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f frontend-participants

# Detener
docker-compose down
```

---

## 🌐 Despliegue con Nginx

### **Configuración Nginx Básica**

Crear archivo `/etc/nginx/sites-available/farmatour5-participants.conf`:

```nginx
upstream frontend_participants {
    server localhost:3000;
}

server {
    listen 80;
    server_name participants.farmatour5.local;

    # Redirects HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name participants.farmatour5.local;

    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/farmatour5.local/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/farmatour5.local/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Logging
    access_log /var/log/nginx/farmatour5-participants-access.log combined;
    error_log /var/log/nginx/farmatour5-participants-error.log;

    # Tamaño máximo de cliente
    client_max_body_size 100M;

    # Root path (si necesario)
    root /var/www/farmatour5-participants/public;

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
    }

    # Fonts specific
    location /fonts/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }

    # Images specific
    location /images/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Next.js pages
    location / {
        proxy_pass http://frontend_participants;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
        proxy_connect_timeout 5s;
    }

    # Health check (para balanceadores de carga)
    location /health {
        proxy_pass http://frontend_participants/login;
        access_log off;
    }

    # Denegar acceso a archivos sensibles
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ /\~$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### **Activar Configuración Nginx**

```bash
# Copiar archivo de configuración
sudo cp farmatour5-participants.conf /etc/nginx/sites-available/

# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/farmatour5-participants.conf \
           /etc/nginx/sites-enabled/farmatour5-participants.conf

# Validar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx

# Verificar estado
sudo systemctl status nginx
```

### **Verificar Acceso**

```bash
# Si tiene DNS configurado
curl -k https://participants.farmatour5.local/login

# Si no
curl -k https://localhost/login \
  -H "Host: participants.farmatour5.local"

# Verificar que archivos estáticos se sirven
curl -k https://participants.farmatour5.local/fonts/Blinker-Regular.woff2 -v
```

---

## ✅ Verificación Post-Despliegue

### **Checklist Automático**

```bash
#!/bin/bash
# Script de verificación: verify-deployment.sh

echo "=== Verificación de Despliegue ==="

# 1. Verificar que servidor responde
echo -n "✓ Servidor respondiendo: "
if curl -s http://localhost:3000/login | grep -q "login"; then
    echo "OK"
else
    echo "FALLO"
fi

# 2. Verificar imágenes
echo -n "✓ Imagen de fondo: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/images/login-bg.jpeg | grep -q "200" && echo "OK" || echo "FALLO"

# 3. Verificar logo
echo -n "✓ Logo: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/images/logo.png | grep -q "200" && echo "OK" || echo "FALLO"

# 4. Verificar fuentes
echo -n "✓ Fuentes WOFF2: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/fonts/Blinker-Regular.woff2 | grep -q "200" && echo "OK" || echo "FALLO"

# 5. Verificar que no hay errores 5xx
echo -n "✓ Sin errores 5xx: "
curl -s http://localhost:3000/login | grep -q "500" && echo "FALLO" || echo "OK"

echo "=== Verificación Completada ==="
```

**Ejecutar:**
```bash
chmod +x verify-deployment.sh
./verify-deployment.sh
```

### **Verificación Manual en Navegador**

1. Abrir DevTools (F12)
2. Ir a pestaña Network
3. Recargar página (Ctrl+R o Cmd+R)
4. Filtrar por "img" y "font"
5. Verificar que todos los recursos tienen status 200
6. Verificar que no hay errores en Console

---

## 🔧 Troubleshooting

### **Problema: Imágenes devuelven 404**

**Síntomas:**
- Fondo no se muestra
- Logo no se muestra
- DevTools muestra 404 para /images/*

**Soluciones:**
```bash
# 1. Verificar que archivos existen
ls -la /home/david/Escritorio/server/cuborojo-farmatour5/frontend-participants/public/images/

# 2. Si usa Docker, verificar que se copió public/
docker exec farmatour5-participants ls -la /app/public/images/

# 3. Si usa Nginx, verificar ruta raíz
sudo nginx -T | grep root

# 4. Recrear .next
cd frontend-participants
rm -rf .next
npm run build
npm start
```

### **Problema: Fuentes no cargan**

**Síntomas:**
- Texto usa sans-serif genérica
- DevTools Network muestra 404 para /fonts/*
- Console muestra warnings de CORS

**Soluciones:**
```bash
# 1. Verificar @font-face en CSS
grep -A 5 "@font-face" src/app/globals.css

# 2. Verificar ruta en CSS (debe ser /fonts/ no /public/fonts/)
grep "url('/fonts/" src/app/globals.css

# 3. Limpiar cache del navegador
# DevTools → Settings → Network → Disable cache
# O usar Ctrl+Shift+R para hard refresh

# 4. Verificar archivos existen
file public/fonts/Blinker-Regular.woff2
```

### **Problema: Puerto 3000 ocupado**

**Síntomas:**
- Error: "Port 3000 already in use"

**Soluciones:**
```bash
# 1. Ver qué proceso usa puerto 3000
lsof -i :3000

# 2. Matar el proceso
kill -9 <PID>

# 3. O usar puerto diferente
npm run dev -- -p 3001

# 4. Con Docker
docker ps | grep 3000
docker stop <container_id>
```

### **Problema: CORS en fuentes**

**Síntomas:**
- Warning: "Cross-Origin Request Blocked"
- Fuentes no cargan

**Soluciones Nginx:**
```nginx
location /fonts/ {
    add_header Access-Control-Allow-Origin "*";
    add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS";
}
```

### **Problema: Build muy lento**

**Síntomas:**
- `npm run build` tarda >10 minutos

**Soluciones:**
```bash
# 1. Aumentar memoria de Node
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# 2. Limpiar caché
npm cache clean --force
rm -rf node_modules
npm ci

# 3. Usar SWC en lugar de Babel
# Ya está configurado en next.config.js (swcMinify: true)

# 4. Parallelizar build
npm run build -- --experimental-parallel-workers
```

---

## 📊 Monitoreo Post-Despliegue

### **Logs Importantes**

```bash
# Logs de Next.js
pm2 logs farmatour5-participants

# Logs de Nginx
sudo tail -f /var/log/nginx/farmatour5-participants-error.log

# Logs del sistema
sudo journalctl -u nginx -f

# Logs de Docker
docker logs -f farmatour5-participants
```

### **Métricas a Monitorear**

1. **Tiempo de respuesta:** <500ms
2. **Tiempo TTFB (Time To First Byte):** <200ms
3. **Tamaño de página:** <5MB
4. **Requests fallidos:** 0%
5. **Errores en consola:** 0%

### **Alertas Recomendadas**

- CPU > 80%
- Memory > 80%
- Response Time > 1s
- Error Rate > 1%
- Disk Space < 10GB

---

## 🎯 Conclusión

Después de completar el despliegue:

✅ Verificar que el login es accesible  
✅ Verificar que imágenes se cargan  
✅ Verificar que fuentes se muestran  
✅ Verificar funcionalidad de login  
✅ Revisar logs sin errores  
✅ Monitorear performance  

**¡Sistema listo para producción!**
