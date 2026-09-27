# Guía Rápida: Importador de Niveles

## ⚡ Inicio Rápido

### 1. Preparar el Archivo Excel

Crea un archivo XLSX con una hoja llamada **"Niveles Normales - Contenidos"**

### 2. Agregar Columnas Requeridas

| # | Columna | Ejemplo |
|---|---------|---------|
| 1 | Mundo | Mundo 1 |
| 2 | Nivel | Nivel 1: Protección solar |
| 3 | Misión | Misión 1: Protección Solar Diaria |
| 4 | Familia de producto | Protección |
| 5 | ¿Producto agrupado? | Sí/No |
| 6 | Variantes / presentaciones | SPF 30\|SPF 50\|SPF 70 |
| 7 | Titular | Bloqueador Solar Premium |
| 8 | Imagen del item (URL) | https://example.com/image.jpg |
| 9 | Beneficios | Protege de rayos UV |
| 10 | Contenido (separador por ;) | Natural;Dermatológico;Resistente agua |
| 11 | Detalle | Bloqueador solar de amplio espectro... |

### 3. Reglas Importantes

✅ **HACER:**
- Usar URLs válidas de imágenes
- Separar variantes con `|` (pipe)
- Separar contenido con `;` (punto y coma)
- Ordenar niveles y misiones como quieras (se auto-ordena)
- Reutilizar niveles/misiones existentes automáticamente

❌ **NO HACER:**
- No dejar celdas críticas vacías (Nivel, Misión, Titular)
- No cambiar el nombre de la hoja
- No agregar espacios extras en los separadores

### 4. Abrir el Importador

1. Ve a **Mundos → Selecciona un Mundo → Niveles**
2. Haz clic en botón **"Importador"** (junto a "Nuevo Nivel")
3. Arrastra el archivo XLSX o selecciona manualmente

### 5. Esperar Importación

- Se mostrará un modal con barra de progreso
- **No cierres** la página durante la importación
- Espera a que se complete

### 6. Revisar Resultados

El modal mostrará:
- ✅ Cantidad de elementos creados/actualizados
- ⚠️ Errores (si los hay)
- 📊 Imágenes subidas

---

## 📋 Formato de Datos Especiales

### Variantes / Presentaciones (Separador: |)
```
SPF 30|SPF 50|SPF 70
100ml|250ml|500ml
Crema|Loción|Spray
```

### Contenido (Separador: ;)
```
Natural;Dermatológico;Resistente agua
Ligero;Nutritivo;Anti-envejecimiento
Orgánico;Vegano;Libre de parabenos
```

### Números de Orden (Automático)
El importador ordena alfabéticamente:
```
Entrada en Excel:
Nivel 2: Cuidado facial
Nivel 1: Protección solar

Resultado en BD:
Nivel 1: Protección solar    → order_num = 1
Nivel 2: Cuidado facial      → order_num = 2
```

---

## 🖼️ Gestión de Imágenes

- La URL debe ser **válida y accesible**
- Se descarga automáticamente
- Se sube a la librería de medios
- Se asocia al item

Ejemplo válido:
```
https://example.com/products/bloqueador-solar.jpg
https://s3.amazonaws.com/images/producto.png
https://cdn.company.com/products/item-123.webp
```

---

## 🔄 Actualización vs. Creación

### Niveles
- Si existe con el mismo nombre → **Se reutiliza**
- Si no existe → **Se crea nuevo**

### Misiones
- Si existe con el mismo nombre **en ese nivel** → **Se reutiliza**
- Si no existe → **Se crea nueva**

### Items
- Si existe con el mismo **título** **en esa misión** → **Se actualiza**
- Si no existe → **Se crea nuevo**

---

## ⚠️ Errores Comunes

### "No se encontró la hoja 'Niveles Normales - Contenidos'"
**Solución**: Verifica que la hoja tenga exactamente ese nombre

### "El archivo Excel está vacío"
**Solución**: Agrega datos a la hoja o verifica que tenga registros

### Imágenes no se suben
**Solución**: Verifica que las URLs sean válidas y accesibles desde la red

### Items duplicados
**Solución**: Verifica que no haya dos items con el mismo título en la misma misión

---

## 📊 Ejemplo Completo

**Archivo: Productos_Farmacéuticos.xlsx**

```
Mundo          │ Nivel                    │ Misión                  │ Familia  │ ¿Agrup? │ Variantes      │ Titular            │ Imagen URL                    │ Beneficios      │ Contenido              │ Detalle
───────────────┼──────────────────────────┼─────────────────────────┼──────────┼─────────┼────────────────┼────────────────────┼───────────────────────────────┼─────────────────┼────────────────────────┼─────
Farmatour      │ Nivel 1: Protección     │ Misión 1: UV Daily      │ Skincare │ No      │ SPF 30|50|70   │ Bloqueador Premium │ https://cdn.com/bloqueador.jpg │ Protege del sol │ Natural;Dermatoló      │ Protección...
Farmatour      │ Nivel 1: Protección     │ Misión 1: UV Daily      │ Skincare │ Sí      │ 50ml|100ml     │ Protector Facial   │ https://cdn.com/protector.jpg  │ Hidrata         │ Orgánico;Vegano        │ Ligero y...
Farmatour      │ Nivel 2: Cuidado facial │ Misión 1: Limpieza      │ Skincare │ No      │ Normal|Grasa   │ Limpiador Facial   │ https://cdn.com/limpiador.jpg  │ Limpia          │ Suave;Sin químicos     │ No invasivo...
```

**Resultado tras importación:**
- ✅ 2 niveles creados
- ✅ 2 misiones creadas
- ✅ 3 items creados
- ✅ 3 imágenes subidas
- ✅ 0 errores

---

## 🚀 Comandos Útiles

### Convertir CSV a XLSX (Linux/Mac)
```bash
# Instalar librería si es necesario
pip install openpyxl

# Convertir
python3 -c "
import csv
from openpyxl import Workbook
wb = Workbook()
ws = wb.active
ws.title = 'Niveles Normales - Contenidos'
with open('data.csv') as f:
    for row in csv.reader(f):
        ws.append(row)
wb.save('data.xlsx')
"
```

---

## 📞 Soporte

Para más detalles técnicos, ver: `DOCUMENTACION_IMPORTADOR_NIVELES.md`

**Versión**: 1.0  
**Fecha**: 2025-09-24  
**Estado**: ✅ Listo para producción
