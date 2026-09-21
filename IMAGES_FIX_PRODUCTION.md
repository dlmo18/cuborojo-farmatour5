# Solución: Imágenes no se muestran en Producción

## 🔍 Diagnóstico del Problema

**Error reportado:**
```
URL: https://farmatour5.cuborojo.pe/_next/image?url=%2Fimages%2Flogo.png&w=1080&q=75
Respuesta: "The requested resource isn't a valid image"
```

**Funciona en:** localhost:3000  
**Falla en:** Producción (farmatour5.cuborojo.pe)

## 🎯 Causa Raíz

El optimizador de imágenes de Next.js (`_next/image`) en producción no puede acceder a:
1. Los archivos en `/public/images/`
2. La configuración de nginx estaba pasando TODO por proxy sin servir los assets estáticos directamente

## ✅ Cambios Implementados

### 1. **next.config.js** - Desactivar optimización de imágenes
```javascript
images: {
  // Desactivar optimización en producción
  unoptimized: process.env.NODE_ENV === 'production',
  // ...resto de config
}
```

**Razón:** En producción, es más eficiente servir las imágenes directamente sin el optimizador de Next.js.

### 2. **nginx/farmatour5.conf** - Servir assets estáticos directamente
Agregadas nuevas rutas de nginx para servir:
- `/_next/static/` → `/var/www/farmatour5/frontend-participants/.next/static/`
- `/images/` → `/var/www/farmatour5/frontend-participants/public/images/`
- `/fonts/` → `/var/www/farmatour5/frontend-participants/public/fonts/`

**Beneficios:**
- ✅ Nginx sirve archivos estáticos directamente (más rápido)
- ✅ No pasa por el proxy de Node.js
- ✅ Mejor caché y performance
- ✅ Evita problemas de permisos con Next.js

## 🚀 Pasos a Seguir en Producción

### Opción A: Despliegue Manual (recomendado para debugging)

1. **Conectarse al servidor:**
```bash
ssh user@farmatour5.cuborojo.pe
cd /var/www/farmatour5/frontend-participants
```

2. **Verificar que el directorio public existe:**
```bash
ls -la public/images/
# Debe mostrar: logo.png, logo-header.png, etc.
```

3. **Verificar permisos:**
```bash
# El usuario de nginx debe poder leer estos archivos
ls -l public/
# Debe tener permisos al menos 755
```

4. **Hacer rebuild de Next.js:**
```bash
npm install
npm run build

# Verificar que se generó correctamente:
ls -la .next/
# Debe tener: .next/static/, .next/server/, etc.
```

5. **Detener el servidor actual:**
```bash
pm2 stop farmatour5-participants
```

6. **Iniciar el servidor (con las nuevas variables de entorno):**
```bash
NODE_ENV=production pm2 start ecosystem.config.js --only farmatour5-participants
```

7. **Verificar logs:**
```bash
pm2 logs farmatour5-participants
# No debe haber errores de archivos no encontrados
```

8. **Recargar nginx:**
```bash
sudo nginx -t  # Verificar sintaxis
sudo systemctl reload nginx
```

9. **Prueba de imágenes - Verificar acceso directo:**
```bash
curl -I https://farmatour5.cuborojo.pe/images/logo.png
# Debe responder: HTTP/2 200 OK

curl -I https://farmatour5.cuborojo.pe/_next/static/chunks/main-XXXX.js
# Debe responder: HTTP/2 200 OK
```

### Opción B: Despliegue Automático (si usas CI/CD)

En tu workflow de GitHub Actions o despliegue automático, asegúrate de:

1. **Que el directorio public se copia al servidor:**
```yaml
- name: Deploy frontend-participants
  run: |
    rsync -avz frontend-participants/ user@server:/var/www/farmatour5/frontend-participants/
    # Asegurar que public/ se copia completamente
```

2. **Que se ejecuta el build después de copiar:**
```yaml
- name: Build and restart
  run: |
    ssh user@server << 'EOF'
    cd /var/www/farmatour5/frontend-participants
    npm install
    npm run build
    pm2 restart farmatour5-participants
    sudo systemctl reload nginx
    EOF
```

## 🧪 Testing Post-Despliegue

### Test 1: Acceso directo a imágenes
```bash
# Debe devolver 200 OK
curl -I https://farmatour5.cuborojo.pe/images/logo.png
curl -I https://farmatour5.cuborojo.pe/images/logo-header.png
curl -I https://farmatour5.cuborojo.pe/images/world-default.jpg
```

### Test 2: Assets de Next.js
```bash
# Debe devolver 200 OK (sin pasar por proxy)
curl -I https://farmatour5.cuborojo.pe/_next/static/chunks/main.js
```

### Test 3: En el navegador
```
1. Abre: https://farmatour5.cuborojo.pe/
2. En DevTools → Network
3. Busca requests a:
   - /images/logo.png (debe ser 200)
   - /_next/image?url=... (puede ser 200 o ser redirigida)
4. Las imágenes deben verse correctamente
```

### Test 4: Login con imagen
```
1. Navega a: https://farmatour5.cuborojo.pe/
2. Verifica que se muestra el logo correctamente
3. Sin errores en la consola
```

## ⚠️ Troubleshooting

### Si aún da error "The requested resource isn't a valid image"

1. **Verificar que el archivo existe:**
```bash
file /var/www/farmatour5/frontend-participants/public/images/logo.png
# Debe mostrar: PNG image data
```

2. **Verificar permisos de nginx:**
```bash
# Nginx debe estar corriendo como user 'www-data' o similar
ps aux | grep nginx

# Verificar que puede leer los archivos:
sudo -u www-data test -r /var/www/farmatour5/frontend-participants/public/images/logo.png && echo "OK" || echo "PERMISOS INSUFICIENTES"
```

3. **Ver logs de nginx:**
```bash
tail -f /var/www/farmatour5/logs/nginx-error.log
# Buscar líneas como "open() "/var/www/..." failed (13: Permission denied)"
```

4. **Reconstruir assets de Next.js:**
```bash
cd /var/www/farmatour5/frontend-participants
rm -rf .next node_modules
npm install
npm run build
```

### Si nginx devuelve 404 en /images/

1. **Verificar que la ruta existe en nginx.conf:**
```bash
grep -n "location /images/" /etc/nginx/sites-available/farmatour5.conf
# Debe aparecer en la línea correcta
```

2. **Recargar nginx after changes:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 Verificación Rápida

```bash
#!/bin/bash
# Script para verificar todos los puntos

echo "=== Verificación de Imágenes en Producción ==="

SERVER="user@farmatour5.cuborojo.pe"
BASE_PATH="/var/www/farmatour5/frontend-participants"

echo "1. Verificar directorio public..."
ssh $SERVER "ls -la $BASE_PATH/public/images/ | head -5"

echo -e "\n2. Verificar permisos..."
ssh $SERVER "ls -l $BASE_PATH/public/ | grep images"

echo -e "\n3. Verificar .next/static..."
ssh $SERVER "ls -la $BASE_PATH/.next/static/ | head -5"

echo -e "\n4. Verificar nginx.conf..."
ssh $SERVER "grep -c 'location /images/' /etc/nginx/sites-available/farmatour5.conf"

echo -e "\n5. Test HTTP..."
echo "- Logo: $(curl -s -o /dev/null -w '%{http_code}' https://farmatour5.cuborojo.pe/images/logo.png)"
echo "- Header: $(curl -s -o /dev/null -w '%{http_code}' https://farmatour5.cuborojo.pe/images/logo-header.png)"
```

## 📝 Checklist Final

- [ ] `next.config.js` actualizado con `unoptimized: true` en producción
- [ ] `nginx/farmatour5.conf` actualizado con rutas de `/images/`, `/_next/static/`
- [ ] Build de frontend-participants ejecutado en servidor
- [ ] Nginx recargado
- [ ] Pruebas de HTTP 200 en `/images/*` y `/_next/static/*`
- [ ] Verificar en navegador que las imágenes se muestran
- [ ] Logs sin errores de "Permission denied" o "not found"

## 🔗 Referencias

- [Next.js Image Optimization](https://nextjs.org/docs/app/api-reference/components/image#unoptimized)
- [Nginx Alias vs Root](https://docs.nginx.com/nginx/admin-guide/web-server/serving-static-content/)
- [Next.js Static Files](https://nextjs.org/docs/app/building-your-application/optimizing/static-assets)

