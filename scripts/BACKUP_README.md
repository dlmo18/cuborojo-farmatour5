# Scripts de Backup - PostgreSQL

Scripts para realizar backups de la base de datos PostgreSQL con diferentes opciones.

## Requisitos

- PostgreSQL client tools (`pg_dump`) instalados
- Archivo `.env` configurado con las variables de conexión a la BD

## Uso

### Desde el directorio `backend/`

```bash
# Backup completo (schema + datos)
npm run backup:complete

# Backup solo de datos
npm run backup:data

# Backup solo del schema
npm run backup:schema
```

### Ejecución directa de scripts

```bash
# Desde la raíz del proyecto
./scripts/backup-complete.sh   # Backup completo
./scripts/backup-data.sh       # Solo datos
./scripts/backup-schema.sh     # Solo schema
```

## Descripción de cada script

### `backup-complete.sh`
- **Tipo**: Backup completo
- **Contenido**: Schema + Datos
- **Uso**: Restauración completa de la base de datos
- **Archivo**: `backup_complete_YYYYMMDD_HHMMSS.sql`

### `backup-data.sh`
- **Tipo**: Backup de datos
- **Contenido**: Solo los datos (sin estructura de tablas)
- **Uso**: Restaurar datos a una base de datos existente
- **Archivo**: `backup_data_YYYYMMDD_HHMMSS.sql`

### `backup-schema.sh`
- **Tipo**: Backup de schema
- **Contenido**: Solo la estructura (sin datos)
- **Uso**: Crear nuevas instancias vacías de la base de datos
- **Archivo**: `backup_schema_YYYYMMDD_HHMMSS.sql`

## Variables de .env utilizadas

Los scripts leen automáticamente las siguientes variables de `.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=usuario
DB_PASSWORD=contraseña
DB_NAME=nombre_base_datos
```

## Ubicación de backups

Los archivos de backup se guardan en:
```
/database/backups/backup_[tipo]_YYYYMMDD_HHMMSS.sql
```

## Restauración

### Restaurar backup completo
```bash
PGPASSWORD="contraseña" psql -h localhost -U usuario -d nombre_bd < backup_complete_*.sql
```

### Restaurar solo datos (en BD existente)
```bash
PGPASSWORD="contraseña" psql -h localhost -U usuario -d nombre_bd < backup_data_*.sql
```

### Restaurar solo schema
```bash
PGPASSWORD="contraseña" psql -h localhost -U usuario -d nombre_bd < backup_schema_*.sql
```

## Ejemplos

```bash
# Backup completo del proyecto actual
cd backend
npm run backup:complete

# Verificar que el archivo se creó
ls -lh ../database/backups/

# Restaurar el backup (si es necesario)
PGPASSWORD="1yojocctvnzs" psql -h localhost -U cuborojo_user -d cuborojo_farmatour5 < ../database/backups/backup_complete_20260904_193400.sql
```

## Notas

- Los scripts leen automáticamente las credenciales del `.env`
- Se crean automaticamente con timestamp para evitar sobrescrituras
- Los backups son archivos SQL texto, pueden editarse si es necesario
- La carpeta `/database/backups` se crea automáticamente si no existe
- Se muestran los tamaños de los archivos generados
