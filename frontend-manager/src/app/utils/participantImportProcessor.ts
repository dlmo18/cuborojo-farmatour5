/**
 * Utilidad para procesar importación de participantes con validaciones
 */

import { Participant, CreateParticipantDto, UpdateParticipantDto, Group } from './api';

export interface ImportRow {
  dni: string;
  fullName: string;
  email?: string;
  groupId?: string;
}

export interface ImportResult {
  successful: number;
  updated: number;
  errors: Array<{
    row: number;
    dni: string;
    fullName: string;
    error: string;
  }>;
  groupsCreated: number;
  groupsAssociated: number;
}

/**
 * Parsea un archivo CSV/Excel y extrae las filas
 */
export const parseCSVFile = async (file: File): Promise<ImportRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('El archivo está vacío o no tiene datos');
        }

        // Parsear headers
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const dniIndex = headers.indexOf('dni');
        const fullNameIndex = headers.indexOf('fullname');
        const emailIndex = headers.indexOf('email');
        const groupIdIndex = headers.indexOf('groupid');

        if (dniIndex === -1 || fullNameIndex === -1) {
          throw new Error('El archivo debe tener las columnas "dni" y "fullName"');
        }

        // Parsear datos
        const rows: ImportRow[] = [];
        for (let i = 1; i < lines.length; i++) {
          const parts = parseCSVLine(lines[i]);
          if (parts.length > 0 && parts[dniIndex]?.trim()) {
            rows.push({
              dni: parts[dniIndex]?.trim() || '',
              fullName: parts[fullNameIndex]?.trim() || '',
              email: emailIndex !== -1 ? parts[emailIndex]?.trim() || undefined : undefined,
              groupId: groupIdIndex !== -1 ? parts[groupIdIndex]?.trim() || undefined : undefined,
            });
          }
        }

        resolve(rows);
      } catch (error: any) {
        reject(new Error(`Error al procesar el archivo: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsText(file);
  });
};

/**
 * Parsea una línea de CSV considerando comillas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * Valida y procesa un registro de importación
 */
export const validateImportRow = (row: ImportRow, rowNumber: number): { valid: boolean; error?: string } => {
  // Validar DNI
  if (!row.dni || row.dni.trim().length === 0) {
    return { valid: false, error: 'DNI es requerido' };
  }

  // Validar nombre
  if (!row.fullName || row.fullName.trim().length === 0) {
    return { valid: false, error: 'Nombre completo es requerido' };
  }

  // Validar email si está presente
  if (row.email && row.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row.email)) {
      return { valid: false, error: 'Email inválido' };
    }
  }

  return { valid: true };
};

/**
 * Convierte UUID v4 a validación
 */
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Busca un grupo por ID o nombre
 */
export const findOrCreateGroup = async (
  groupIdentifier: string | undefined,
  groups: Group[],
  createGroupFn: (name: string) => Promise<Group>
): Promise<{ groupId?: string; created: boolean; error?: string }> => {
  if (!groupIdentifier || groupIdentifier.trim().length === 0) {
    return { groupId: undefined, created: false };
  }

  const trimmed = groupIdentifier.trim();

  // Si es UUID válido, usarlo directamente
  if (isValidUUID(trimmed)) {
    const group = groups.find(g => g.id === trimmed);
    if (group) {
      return { groupId: trimmed, created: false };
    } else {
      return { groupId: undefined, created: false, error: `Grupo con ID ${trimmed} no existe` };
    }
  }

  // Buscar por nombre
  const existingGroup = groups.find(g => g.name.toLowerCase() === trimmed.toLowerCase());
  if (existingGroup) {
    return { groupId: existingGroup.id, created: false };
  }

  // Intentar crear el grupo
  try {
    const newGroup = await createGroupFn(trimmed);
    return { groupId: newGroup.id, created: true };
  } catch (error: any) {
    return { 
      groupId: undefined, 
      created: false, 
      error: `No se pudo crear grupo "${trimmed}": ${error.message}` 
    };
  }
};

/**
 * Busca un participante por DNI
 */
export const findParticipantByDNI = async (
  dni: string,
  getParticipantsFn: (params: any) => Promise<any>
): Promise<Participant | undefined> => {
  try {
    const response = await getParticipantsFn({ search: dni, limit: 100 });
    const participants = response.data?.data || [];
    return participants.find((p: Participant) => p.dni === dni);
  } catch (error) {
    return undefined;
  }
};
