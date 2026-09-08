# Guía de Configuración - Funcionalidades de Worlds

## 1. Menú de Opciones (Esquina Superior Derecha)

El menú de opciones está implementado y accesible mediante el botón ⚙️ en la esquina superior derecha de la pantalla.

### Funcionalidades del Menú:
- **Sonido de Fondo**: Toggle para habilitar/deshabilitar sonido de fondo (por defecto: prendido)
- **Sonido de Efecto**: Toggle para habilitar/deshabilitar sonido de efecto (por defecto: prendido)
- **Cerrar Sesión**: Cierra la sesión y redirige al login

### Almacenamiento:
Los flags de sonido se guardan en el localStorage del navegador:
- `soundBg`: True/False para sonido de fondo
- `soundEffect`: True/False para sonido de efecto

## 2. Barra Inferior - Estadísticas

La barra inferior (BottomStats) muestra tres secciones:

### Sección Izquierda - Contador Regresivo
- Muestra un contador en formato HH:MM:SS
- El ícono 🎁 está deshabilitado hasta que el contador llegue a cero
- Cuando llega a cero, se habilita el ícono y muestra un modal especial

### Sección Centro - Estrellas
- Muestra el número de estrellas totales del usuario
- Ícono: ⭐

### Sección Derecha - Ranking
- Muestra la posición del usuario en el ranking de su grupo
- Formato: #N (ej: #3 para tercero lugar)
- Se carga dinámicamente desde el backend

## 3. Configurar el Contador Regresivo

El contador regresivo se configura a través del panel de administrador en `http://localhost:3002/configuracion`.

### Pasos:
1. Ve a http://localhost:3002/configuracion (acceso con credenciales de administrador)
2. Busca o crea una configuración con la clave: `countdown_datetime`
3. Ingresa el valor en formato ISO 8601: `YYYY-MM-DDTHH:MM:SSZ`

### Ejemplos:
- `2024-12-25T18:00:00Z` - 25 de Diciembre de 2024 a las 6:00 PM (UTC)
- `2024-12-31T23:59:59Z` - 31 de Diciembre de 2024 a las 11:59:59 PM (UTC)

### Nota sobre Zonas Horarias:
- El formato debe estar en UTC (Z significa UTC)
- El navegador convertirá automáticamente a la zona horaria local del usuario

## 4. Endpoints de API

### Nuevos Endpoints:

**GET /api/config** (Público - sin autenticación)
- Obtiene todas las configuraciones del sistema
- Respuesta: Array de configuraciones con keys y values

**GET /api/groups/:id/ranking** (Autenticado - Participante)
- Obtiene el ranking del grupo
- Parámetros: 
  - `id`: ID del grupo
- Headers requeridos: 
  - `Authorization: Bearer <token>`
- Respuesta:
```json
{
  "data": [
    {
      "id": "user-id",
      "fullName": "Nombre",
      "totalStars": 150,
      "ranking": 1
    },
    ...
  ]
}
```

## 5. Flujo de Funcionamiento

1. Usuario ingresa a `/game/worlds`
2. Si no está autenticado, se redirige a `/login`
3. Se muestran los mundos disponibles
4. Se carga la barra inferior con:
   - Contador regresivo desde la configuración del admin
   - Total de estrellas del usuario
   - Ranking del usuario en su grupo
5. Usuario puede:
   - Abrir menú de opciones con ⚙️
   - Controlar sonido de fondo y efecto
   - Ver su posición en el ranking
   - Ver el contador regresivo
   - Cuando el contador llegue a cero, ver un modal especial

## 6. Estructura de Almacenamiento

### localStorage (Frontend)
```javascript
localStorage.getItem('soundBg') // "true" o "false"
localStorage.getItem('soundEffect') // "true" o "false"
```

### Database (Backend)
- Tabla: `system_config`
- Campo `key`: `countdown_datetime`
- Campo `value`: ISO 8601 datetime string
