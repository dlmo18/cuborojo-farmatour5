'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { MdClose, MdCheckCircle, MdErrorOutline, MdWarning } from 'react-icons/md';
import { 
  levelsApi, 
  missionsApi, 
  mediaApi,
  Level, 
  Mission, 
  MissionItem,
  CreateLevelDto,
  CreateMissionDto,
  CreateMissionItemDto 
} from '@/app/services/api';

interface ImportProgress {
  stage: string;
  current: number;
  total: number;
  percentage: number;
}

interface ImportResult {
  success: boolean;
  message: string;
  details?: {
    levelsCreated: number;
    levelsUpdated: number;
    missionsCreated: number;
    missionsUpdated: number;
    itemsCreated: number;
    itemsUpdated: number;
    imagesUploaded: number;
    errors: string[];
  };
}

interface LevelsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  worldId: string;
  onSuccess: () => void;
}

export default function LevelsImportModal({ isOpen, onClose, worldId, onSuccess }: LevelsImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [skipImages, setSkipImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.xlsx')) {
      setFile(selectedFile);
    } else {
      alert('Por favor selecciona un archivo .xlsx válido');
    }
  };

  const parseExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Buscar la hoja "Niveles Normales - Contenidos"
          const sheetName = 'Niveles Normales - Contenidos';
          if (!workbook.SheetNames.includes(sheetName)) {
            reject(new Error(`No se encontró la hoja "${sheetName}"`));
            return;
          }

          const worksheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet);
          resolve(rows);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const getMimeType = (filename: string): string => {
    const ext = filename.toLowerCase().split('.').pop() || '';
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
    };
    return mimeTypes[ext] || 'image/jpeg';
  };

  const isValidImageUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim().toLowerCase();
    
    // Rechazar casos comunes de URLs inválidas
    if (trimmed === 'sin imagen' || trimmed === 'no' || trimmed === 'n/a' || trimmed === 'na' || trimmed === '-') return false;
    if (trimmed.includes('sin imagen') || trimmed === '') return false;
    
    // Validar que sea una URL válida
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const downloadImageAndUpload = async (imageUrl: string): Promise<string | null> => {
    try {
      if (!imageUrl || !isValidImageUrl(imageUrl)) return null;

      // Descargar la imagen
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`No se pudo descargar la imagen: ${imageUrl}`);

      const blob = await response.blob();
      const filename = imageUrl.split('/').pop() || 'image.jpg';
      
      // Detectar MIME type por extensión si blob.type está vacío
      const mimeType = blob.type || getMimeType(filename);
      const file = new File([blob], filename, { type: mimeType });

      // Subir a la librería de medios
      const uploadRes = await mediaApi.upload(file);
      return uploadRes.data.id;
    } catch (error) {
      console.error('Error descargando/subiendo imagen:', error);
      return null;
    }
  };

  const calculateOrderNum = (items: string[]): number[] => {
    const uniqueItems = Array.from(new Set(items)).filter(item => item && item.trim() !== '');
    const sorted = uniqueItems.sort();
    return items.map(item => sorted.indexOf(item) + 1);
  };

  const handleImport = async () => {
    if (!file) {
      alert('Por favor selecciona un archivo');
      return;
    }

    setImporting(true);
    setResult(null);
    const errors: string[] = [];
    let levelsCreated = 0;
    let levelsUpdated = 0;
    let missionsCreated = 0;
    let missionsUpdated = 0;
    let itemsCreated = 0;
    let itemsUpdated = 0;
    let imagesUploaded = 0;

    try {
      // Paso 1: Parsear Excel
      setProgress({
        stage: 'Leyendo archivo Excel...',
        current: 0,
        total: 100,
        percentage: 10,
      });

      const rows = await parseExcel(file);
      if (rows.length === 0) {
        throw new Error('El archivo Excel está vacío');
      }

      // Paso 2: Procesar datos
      setProgress({
        stage: 'Procesando datos...',
        current: 1,
        total: rows.length,
        percentage: 20,
      });

      // Agrupar por nivel y misión
      const levelMap: Record<string, any> = {};
      const levelNames = rows.map((row: any) => row['Nivel'] || '');
      const levelOrderNums = calculateOrderNum(levelNames);

      rows.forEach((row: any, index: number) => {
        const levelName = row['Nivel'];
        const missionName = row['Misión'];
        const levelOrderNum = levelOrderNums[index];

        if (!levelName) return;

        if (!levelMap[levelName]) {
          levelMap[levelName] = {
            name: levelName,
            orderNum: levelOrderNum,
            missions: {},
          };
        }

        const level = levelMap[levelName];
        if (!level.missions[missionName]) {
          level.missions[missionName] = {
            name: missionName,
            orderNum: 0,
            items: [],
          };
        }

        level.missions[missionName].items.push(row);
      });

      // Paso 3: Crear/actualizar niveles y misiones
      let processedCount = 0;
      const levelEntries = Object.entries(levelMap);

      for (let i = 0; i < levelEntries.length; i++) {
        const [levelName, levelData] = levelEntries[i];
        try {
          const levelMapSize = Object.keys(levelMap).length;
          setProgress({
            stage: `Importando nivel: ${levelName}`,
            current: processedCount,
            total: levelMapSize,
            percentage: 30 + (processedCount / levelMapSize) * 50,
          });

          // Obtener o crear nivel
          let levelId: string;
          const existingLevels = await levelsApi.getByWorld(worldId);
          const existingLevel = existingLevels.data.find((l: Level) => l.name === levelName);

          if (existingLevel) {
            levelId = existingLevel.id;
            levelsUpdated++;
          } else {
            const createLevelDto: CreateLevelDto = {
              worldId,
              name: levelName,
              orderNum: levelData.orderNum,
              levelType: 'normal',
              description: '',
            };
            const newLevel = await levelsApi.create(createLevelDto);
            levelId = newLevel.data.id;
            levelsCreated++;
          }

          // Procesar misiones
          let missionOrderNum = 0;
          const missionEntries = Object.entries(levelData.missions);
          
          for (let j = 0; j < missionEntries.length; j++) {
            const [missionName, missionData] = missionEntries[j];
            missionOrderNum++;
            try {
              // Obtener o crear misión
              let missionId: string;
              const existingMissions = await missionsApi.getByLevel(levelId);
              const existingMission = existingMissions.data.find((m: Mission) => m.name === missionName);

              if (existingMission) {
                missionId = existingMission.id;
                missionsUpdated++;
              } else {
                const createMissionDto: CreateMissionDto = {
                  levelId,
                  name: missionName,
                  orderNum: missionOrderNum,
                };
                const newMission = await missionsApi.create(createMissionDto);
                missionId = newMission.data.id;
                missionsCreated++;
              }

              // Procesar items de misión
              const items = (missionData as any).items as any[];
              const itemTitles = items.map(item => item['Titular'] || '');
              const itemOrderNums = calculateOrderNum(itemTitles);

              for (let i = 0; i < items.length; i++) {
                const itemRow = items[i];
                try {
                  // Descargar e cargar imagen (solo si no se salta)
                  let imageId: string | undefined;
                  if (!skipImages) {
                    const imageUrl = itemRow['Imagen del item (URL)'];
                    if (imageUrl && imageUrl.trim() !== '') {
                      const uploadedImageId = await downloadImageAndUpload(imageUrl);
                      if (uploadedImageId) {
                        imageId = uploadedImageId;
                        imagesUploaded++;
                      }
                    }
                  }

                  // Parsear variant_badges (separadas por |)
                  const variantBadgesStr = itemRow['Variantes / presentaciones'] || '';
                  const variantBadges = variantBadgesStr
                    .split('|')
                    .map((v: string) => v.trim())
                    .filter((v: string) => v !== '');

                  // Parsear content_badges (separadas por ;)
                  const contentBadgesStr = itemRow['Contenido (separador por ;)'] || '';
                  const contentBadges = contentBadgesStr
                    .split(';')
                    .map((c: string) => c.trim())
                    .filter((c: string) => c !== '');

                  const createItemDto: CreateMissionItemDto = {
                    title: itemRow['Titular'] || '',
                    imageId,
                    benefits: itemRow['Beneficios'] || '',
                    contentBadges: contentBadges.length > 0 ? contentBadges : undefined,
                    detail: itemRow['Detalle'] || '',
                    orderNum: itemOrderNums[i],
                    family: itemRow['Familia de producto'] || '',
                    isGrouped: itemRow['¿Producto agrupado?'] === 'Sí' || itemRow['¿Producto agrupado?'] === true,
                    variantBadges: variantBadges.length > 0 ? variantBadges : undefined,
                  } as any;

                  // Obtener items existentes
                  const existingItems = await missionsApi.getItems(missionId);
                  const existingItem = existingItems.data.find((item: MissionItem) => item.title === createItemDto.title);

                  if (existingItem) {
                    await missionsApi.updateItem(existingItem.id, createItemDto);
                    itemsUpdated++;
                  } else {
                    await missionsApi.createItem(missionId, createItemDto);
                    itemsCreated++;
                  }
                } catch (error) {
                  errors.push(`Error procesando item "${itemRow['Titular']}" en misión "${missionName}": ${error}`);
                }
              }
            } catch (error) {
              errors.push(`Error procesando misión "${missionName}" en nivel "${levelName}": ${error}`);
            }
          }

          processedCount++;
        } catch (error) {
          errors.push(`Error procesando nivel "${levelName}": ${error}`);
        }
      }

      setProgress({
        stage: 'Importación completada',
        current: 100,
        total: 100,
        percentage: 100,
      });

      setResult({
        success: true,
        message: 'Importación completada exitosamente',
        details: {
          levelsCreated,
          levelsUpdated,
          missionsCreated,
          missionsUpdated,
          itemsCreated,
          itemsUpdated,
          imagesUploaded,
          errors,
        },
      });

      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Error durante la importación',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setProgress(null);
    setResult(null);
    setSkipImages(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!importing) {
      handleReset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl text-black font-bold">Importador de Niveles</h2>
          <button
            onClick={handleClose}
            disabled={importing}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <MdClose size={24} />
          </button>
        </div>

        {!progress && !result && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Instrucciones de importación</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>El archivo debe tener una hoja llamada "Niveles Normales - Contenidos"</li>
                <li>Las columnas esperadas son: Mundo, Nivel, Misión, Familia de producto, ¿Producto agrupado?, Variantes / presentaciones, Titular, Imagen del item (URL), Beneficios, Contenido (separador por ;), Detalle</li>
                <li>Las imágenes se descargarán y subirán automáticamente (puede saltarse)</li>
                <li>Si un nivel o misión ya existe, se usará el existente</li>
              </ul>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="text-gray-600">
                {file ? (
                  <div>
                    <p className="font-semibold text-green-600">✓ {file.name}</p>
                    <p className="text-sm mt-2">Clic para cambiar archivo</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold mb-2">Arrastra un archivo XLSX aquí</p>
                    <p className="text-sm">o haz clic para seleccionar</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipImages}
                  onChange={(e) => setSkipImages(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-yellow-900">
                  Saltar importación de imágenes
                  <span className="block text-xs text-yellow-800 font-normal mt-1">
                    Útil cuando solo hay cambios de información y las imágenes ya están cargadas
                  </span>
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={!file}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Importar
              </button>
            </div>
          </div>
        )}

        {progress && !result && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">{progress.stage}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {progress.current} / {progress.total} ({Math.round(progress.percentage)}%)
              </p>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className={`rounded-lg p-4 flex items-start gap-3 ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex-shrink-0 mt-0.5">
                {result.success ? (
                  <div className="text-green-600">
                    <MdCheckCircle size={24} />
                  </div>
                ) : (
                  <div className="text-red-600">
                    <MdErrorOutline size={24} />
                  </div>
                )}
              </div>
              <div>
                <p className={`font-semibold ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                  {result.message}
                </p>
                {result.details && (
                  <div className="mt-3 space-y-1 text-sm">
                    <p><span className="font-medium">Niveles creados:</span> {result.details.levelsCreated}</p>
                    <p><span className="font-medium">Niveles actualizados:</span> {result.details.levelsUpdated}</p>
                    <p><span className="font-medium">Misiones creadas:</span> {result.details.missionsCreated}</p>
                    <p><span className="font-medium">Misiones actualizadas:</span> {result.details.missionsUpdated}</p>
                    <p><span className="font-medium">Items creados:</span> {result.details.itemsCreated}</p>
                    <p><span className="font-medium">Items actualizados:</span> {result.details.itemsUpdated}</p>
                    <p><span className="font-medium">Imágenes subidas:</span> {result.details.imagesUploaded}</p>

                    {result.details.errors.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <p className="font-semibold flex items-center gap-2 text-yellow-700 mb-2">
                          <MdWarning size={18} />
                          Errores durante la importación:
                        </p>
                        <ul className="space-y-1 text-xs text-gray-600 list-disc list-inside">
                          {result.details.errors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Importar otro archivo
              </button>
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
