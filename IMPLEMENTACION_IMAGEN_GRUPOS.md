# Implementación: Imagen en Formulario de Grupos

## 📋 Resumen
Se ha agregado la funcionalidad de asociar imágenes desde la Biblioteca de Medios al formulario de grupos, siguiendo el mismo patrón implementado en mundos.

## 🔧 Cambios Realizados

### 1. Backend - Entidad Group
**Archivo:** `/backend/src/modules/groups/group.entity.ts`
- Agregada columna `imageId` (tipo uuid, opcional)
- Mapped a la columna `image_id` en la base de datos

```typescript
@Column({ name: 'image_id', nullable: true })
imageId?: string;
```

### 2. Backend - DTO
**Archivo:** `/backend/src/modules/groups/groups.service.ts`
- Agregado campo `imageId` al `CreateGroupDto`
- Campo es opcional, sin validación requerida

```typescript
export class CreateGroupDto {
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty({ required: false }) @IsOptional() description?: string;
  @ApiProperty({ required: false }) @IsOptional() imageId?: string;
}
```

### 3. Frontend - Interfaces API
**Archivo:** `/frontend-manager/src/app/services/api.ts`
- Actualizado `CreateGroupDto` con campo `imageId`
- Actualizado `UpdateGroupDto` con campo `imageId`

```typescript
export interface CreateGroupDto {
  name: string;
  description?: string;
  imageId?: string;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
  imageId?: string;
}
```

### 4. Frontend - Componente Grupos
**Archivo:** `/frontend-manager/src/app/(dashboard)/grupos/page.tsx`

#### Importaciones Agregadas:
- `ImageSelector` - Selector de imágenes de la biblioteca
- `MediaPreviewModal` - Modal para visualizar imágenes
- `mediaApi, MediaFile` - Tipos y servicios de medios

#### Cambios en Estado:
```typescript
const [previewImage, setPreviewImage] = useState<MediaFile | null>(null);
const [showPreview, setShowPreview] = useState(false);
```

#### Nuevas Funciones:
- `handleOpenImagePreview(imageId)` - Abre el modal de preview de la imagen

#### Actualizaciones en Datos:
- `handleEdit()` - Ahora incluye el `imageId` en los datos del formulario
- Tabla de datos muestra thumbnail de imagen (6x6px) si existe

#### Formulario Modal:
- Agregado componente `ImageSelector` después del campo descripción
- Muestra selector de imágenes con label "Imagen del Grupo"

#### Vista Previa:
- Agregado componente `MediaPreviewModal` al final del componente
- Permite visualizar la imagen completa al hacer clic en el thumbnail

## 🗄️ Base de Datos - SQL

**Archivo:** `/database/migrations/add_image_id_to_groups.sql`

```sql
-- Agregar columna image_id a groups
ALTER TABLE "public"."groups" 
ADD COLUMN "image_id" uuid;

-- Agregar restricción de llave foránea
ALTER TABLE ONLY "public"."groups" 
ADD CONSTRAINT "groups_image_id_fkey" 
FOREIGN KEY (image_id) REFERENCES "public"."media_library"(id) ON DELETE SET NULL;

-- Crear índice para performance
CREATE INDEX idx_groups_image_id ON public.groups USING btree (image_id);
```

## 📝 Características

✅ Selector de imágenes integrado en el formulario
✅ Visualización de thumbnail en la tabla
✅ Preview modal al hacer clic en la imagen
✅ Sincronización automática con base de datos
✅ Eliminación segura de referencias (ON DELETE SET NULL)
✅ Índice para optimización de consultas
✅ Sigue el patrón existente de mundos

## 🚀 Próximos Pasos

1. Ejecutar la migración SQL en la base de datos:
   ```bash
   psql -U [usuario] -d [database] -f database/migrations/add_image_id_to_groups.sql
   ```

2. Reiniciar el backend para que TypeORM sincronice los cambios

3. Probar el formulario de grupos:
   - Crear grupo con imagen
   - Editar grupo agregando/cambiando imagen
   - Ver preview de imagen
   - Eliminar grupo (verificar que la referencia a media se elimine correctamente)

## 📎 Archivos Modificados

1. `backend/src/modules/groups/group.entity.ts`
2. `backend/src/modules/groups/groups.service.ts`
3. `frontend-manager/src/app/services/api.ts`
4. `frontend-manager/src/app/(dashboard)/grupos/page.tsx`
5. `database/migrations/add_image_id_to_groups.sql` (nuevo)
