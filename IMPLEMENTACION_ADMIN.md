# Implementación de Módulos Administrativos - Farmatour5

## ✅ Módulos Implementados

### 1. **Componentes Reutilizables** ✅
- **DataTable**: Tabla genérica con ordenamiento y acciones (editar, eliminar, ver)
- **Pagination**: Paginación completa con selector de registros por página
- **SearchBar**: Barra de búsqueda con icono

### 2. **Servicio API** ✅
- Archivo: `frontend-manager/src/app/services/api.ts`
- Configuración completa de endpoints para todos los módulos
- Interceptores de autenticación
- Tipos TypeScript completos
- Manejo de errores 401 (redirección a login)

### 3. **Usuarios del Sistema** ✅
- CRUD completo (Create, Read, Update, Delete)
- Roles: 'manager' y 'reporter'
- Paginación + búsqueda
- Validación de formularios
- Estado activo/inactivo

### 4. **Grupos** ✅
- CRUD completo
- Descripción opcional
- Estado activo/inactivo
- Paginación + búsqueda

### 5. **Participantes** ✅
- CRUD completo
- Importación de CSV/Excel
- Asignación a grupos
- Total de estrellas
- DNI, nombre, correo
- Paginación + búsqueda

### 6. **Mundos** ✅
- CRUD completo
- Orden numérico
- Descripción
- Referencia a imagen (desde biblioteca)
- Estado activo/inactivo

### 7. **Configuración** ✅
- Edición de valores del sistema
- Timer de regalo
- Agrupación por categorías
- Guardado individual de cada configuración

### 8. **Reportería** ✅
- Top 10 Participantes
- Top 10 Grupos
- Completación de Mundos (con barras de progreso)
- Actividad reciente (selector de días)
- Botón de actualización

---

## 📋 Módulos Pendientes de Implementación

### 9. **Misiones** (Requiere implementación)

El módulo de misiones es complejo porque incluye:
- Gestión de misiones por nivel
- Gestión de items de información por misión (4+ items con título, imagen, beneficios, badges, detalle)
- Editor de texto enriquecido para beneficios y detalles
- Orden de items

**Patrón sugerido:**
```tsx
// Estructura similar a Participantes
// Al editar una misión, mostrar un botón "Gestionar Items"
// Abrir modal con lista de items y CRUD de items
// Usar react-quill o similar para texto enriquecido
```

**Endpoints disponibles:**
- `GET /missions?levelId=...` - Listar misiones de un nivel
- `POST /missions` - Crear misión
- `PUT /missions/:id` - Actualizar misión
- `DELETE /missions/:id` - Eliminar misión
- `POST /missions/:id/items` - Crear item
- `PUT /missions/items/:itemId` - Actualizar item
- `DELETE /missions/items/:itemId` - Eliminar item

### 10. **Preguntas** (Requiere implementación)

Similar a misiones, incluye sub-gestión de opciones:
- Gestión de preguntas por misión
- 4 opciones por pregunta (texto + imagen opcional)
- 1 opción correcta
- Detalle de respuesta correcta
- Valor en estrellas

**Patrón sugerido:**
```tsx
// Al editar una pregunta, mostrar sección "Opciones"
// Permitir agregar/editar/eliminar opciones
// Validar que haya exactamente 1 correcta
```

**Endpoints disponibles:**
- `GET /questions/mission/:missionId/admin` - Listar preguntas de una misión
- `POST /questions` - Crear pregunta
- `PUT /questions/:id` - Actualizar pregunta
- `DELETE /questions/:id` - Eliminar pregunta
- `POST /questions/:id/options` - Crear opción
- `PUT /questions/options/:optionId` - Actualizar opción
- `DELETE /questions/options/:optionId` - Eliminar opción

### 11. **Biblioteca de Medios** (Requiere implementación)

Gestor centralizado de archivos multimedia:
- Subida de imágenes, videos, audios, documentos
- Filtro por tipo
- Tags para organización
- Vista previa de imágenes
- Selector modal para usar en otros formularios

**Patrón sugerido:**
```tsx
// Grid de tarjetas con preview
// Botón "Seleccionar" para usar en mundos, misiones, etc.
// Filtros por tipo y tags
// Subida drag-and-drop opcional
```

**Endpoints disponibles:**
- `GET /media` - Listar archivos (con paginación y filtros)
- `POST /media/upload` - Subir archivo (FormData)
- `DELETE /media/:id` - Eliminar archivo

---

## 🎨 Patrones de Diseño Utilizados

### Estructura de página típica:

```tsx
'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/app/components/DataTable';
import Pagination from '@/app/components/Pagination';
import SearchBar from '@/app/components/SearchBar';
import { api } from '@/app/services/api';

export default function ModulePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.getAll({ page, limit, search });
      setData(response.data.data);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.total);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => { /* ... */ };
  const handleEdit = (item) => { /* ... */ };
  const handleDelete = async (item) => { /* ... */ };
  const handleSubmit = async (e) => { /* ... */ };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1>Módulo</h1>
        <button onClick={handleCreate}>Nuevo</button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>

        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2>{editing ? 'Editar' : 'Crear'}</h2>
            <form onSubmit={handleSubmit}>
              {/* Campos del formulario */}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🔧 Próximos Pasos Recomendados

1. **Implementar Biblioteca de Medios** (crítico)
   - Todos los módulos dependen de las imágenes
   - Crear componente `MediaSelector` reutilizable

2. **Implementar Misiones**
   - Usar el patrón establecido
   - Agregar gestión de items como sub-modal o pestañas

3. **Implementar Preguntas**
   - Similar a Misiones
   - Validación de opciones (1 correcta obligatoria)

4. **Agregar Niveles**
   - Filtro por mundo
   - Indicador de nivel dorado
   - Max stars calculado automáticamente

---

## 📦 Dependencias Necesarias

Verifica que estén instaladas:
```bash
npm install axios
```

Para editores de texto enriquecido (opcional, para beneficios/detalles):
```bash
npm install react-quill
npm install @types/react-quill
```

---

## 🚀 Verificación de Funcionamiento

1. **Backend corriendo:** `http://localhost:3001/api`
2. **Frontend-manager corriendo:** `http://localhost:3002`
3. **CORS configurado** para aceptar `localhost:3002`
4. **Token JWT** guardado en `localStorage` como `manager_auth_token`

---

## ✅ Estado Actual

- **Completados:** Usuarios, Grupos, Participantes, Mundos, Configuración, Reportería
- **Pendientes:** Niveles, Misiones, Preguntas, Biblioteca

Todos los módulos implementados siguen el mismo patrón de diseño para mantener consistencia visual y de código.
