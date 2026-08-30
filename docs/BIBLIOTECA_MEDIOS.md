# 📚 Biblioteca de Medios - Guía de Uso

## Descripción General

La Biblioteca de Medios es un módulo completo para gestionar imágenes, videos, audio y documentos en tu plataforma Farmatour5. Permite:

- ✅ Subir archivos individuales o múltiples
- ✅ Drag & drop para carga fácil
- ✅ Vista previa de medios
- ✅ Búsqueda y filtrado por tipo
- ✅ Paginación
- ✅ Copiar enlaces directos
- ✅ Eliminar archivos
- ✅ Abrir archivos en ventana nueva

## Configuración Backend

### Variables de Entorno (`.env`)

```env
# Ruta donde se almacenan los archivos subidos
UPLOAD_DIR=/Users/davidmolina/Desktop/Proyectos/cuborojo-farmatour5/uploads

# Tamaño máximo de archivo en bytes (10 MB = 10485760)
MAX_FILE_SIZE=10485760
```

### Tipos de Archivo Soportados

**Imágenes:**
- JPEG, PNG, GIF, WebP, SVG

**Videos:**
- MP4, WebM, MOV

**Audio:**
- MP3, WAV, WebM, OGG

**Documentos:**
- PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP, RAR

## Instalación

### 1. Backend - Instalar Dependencias

```bash
cd backend
npm install
```

Las nuevas dependencias agregadas son:
- `@nestjs/serve-static`: Para servir archivos estáticos
- `uuid`: Para generar nombres únicos de archivos

### 2. Frontend Manager - Ya Configurado

El frontend-manager ya tiene los componentes necesarios. Solo asegúrate de que las variables de entorno estén configuradas:

```env
# .env.local o variables de entorno del proyecto
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Endpoints de API

### Obtener Lista de Medios

```bash
GET /api/media?page=1&limit=20&type=image&search=nombre
```

**Parámetros:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 20)
- `type` (opcional): Filtrar por tipo (image|video|audio|document)
- `search` (opcional): Buscar por nombre

**Respuesta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "archivo.jpg",
      "type": "image",
      "url": "http://localhost:3001/api/media/file/filename.jpg",
      "fileSize": 1024000,
      "mimeType": "image/jpeg",
      "createdAt": "2026-08-30T10:00:00.000Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "pages": 3
}
```

### Descargar/Ver Archivo

```bash
GET /api/media/file/:filename
```

Sin autenticación requerida. Sirve el archivo directamente.

### Subir Archivo

```bash
POST /api/media/upload
Content-Type: multipart/form-data

file: <archivo>
```

### Subir Múltiples Archivos

```bash
POST /api/media/upload-multiple
Content-Type: multipart/form-data

files: <archivo1>
files: <archivo2>
files: <archivo3>
```

### Obtener Archivo por ID

```bash
GET /api/media/:id
```

### Eliminar Archivo

```bash
DELETE /api/media/:id
```

Requiere autenticación con rol `manager`.

## Estructura de Base de Datos

Tabla: `media_library`

```sql
CREATE TABLE media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type ENUM('image', 'video', 'audio', 'document') NOT NULL,
  url VARCHAR(500) NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  tags TEXT[] ARRAY,
  uploaded_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Flujo de Uso

### Para el Usuario (Manager)

1. **Ir a Biblioteca de Medios**
   - En el panel de administración, hacer clic en "📚 Biblioteca de Medios"

2. **Subir Archivos**
   - Opción A: Haz clic en el área de carga y selecciona archivos
   - Opción B: Arrastra y suelta archivos en el área designada
   - Puedes seleccionar múltiples archivos a la vez

3. **Buscar y Filtrar**
   - Usa el buscador para encontrar archivos por nombre
   - Usa el filtro de tipo para ver solo imágenes, videos, etc.

4. **Interactuar con Archivos**
   - Haz clic en las tres puntos (⋯) de cualquier archivo para ver acciones
   - **Previsualizar**: Ver el archivo completo en un modal
   - **Copiar enlace**: Copiar la URL del archivo al portapapeles
   - **Abrir en ventana nueva**: Abrir el archivo en una nueva pestaña
   - **Eliminar**: Eliminar el archivo de la biblioteca

5. **Navegar por Páginas**
   - Usa los botones de paginación para ver más archivos

## Consideraciones Importantes

### Seguridad

- ✅ Solo usuarios con rol `manager` pueden subir archivos
- ✅ Validación de tipos MIME en servidor
- ✅ Límite de tamaño de archivo (10 MB por defecto)
- ✅ Nombres de archivo se generan con UUID para evitar conflictos

### Rendimiento

- ✅ Paginación de 12-20 items por página
- ✅ Compresión automática de imágenes recomendada (considerar)
- ✅ CDN para producción recomendado para servir archivos estáticos

### Almacenamiento en Nube

Para migrar a almacenamiento en nube (AWS S3, Google Cloud Storage, etc.):

1. Cambiar el controlador de multer
2. Actualizar `UPLOAD_DIR` en .env a una URL de nube
3. Actualizar la lógica de eliminación en `media.service.ts`

Ejemplo para AWS S3:
```typescript
// Instalar: npm install aws-sdk
import { S3 } from 'aws-sdk';

// Configurar multer con S3
import multerS3 from 'multer-s3';

// En media.module.ts, usar multerS3 en lugar de diskStorage
```

## Troubleshooting

### Error: "UPLOAD_DIR no existe"
- Crear la carpeta: `mkdir -p uploads`
- Verificar permisos: `chmod 755 uploads`

### Error: "Archivo muy grande"
- Aumentar MAX_FILE_SIZE en .env
- O dividir archivos grandes en partes

### Error: "Tipo de archivo no permitido"
- Agregar el MIME type a la lista en `media.module.ts`
- Verificar que el archivo tenga extensión correcta

### Los archivos no se sirven
- Verificar que `@nestjs/serve-static` esté instalado
- Verificar que UPLOAD_DIR sea accesible
- Comprobar logs de NestJS para errores

## Próximas Mejoras

- [ ] Carga con progreso visual
- [ ] Compresión automática de imágenes
- [ ] Watermark en imágenes
- [ ] Galería con lightbox
- [ ] Etiquetado y categorización avanzada
- [ ] Compartir archivos con enlace temporal
- [ ] Estadísticas de uso (downloads, vistas)
- [ ] Integración con editor de contenido (para misiones)

## Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.
