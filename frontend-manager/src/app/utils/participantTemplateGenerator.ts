/**
 * Utilidad para generar templates de importación de participantes
 */

export interface ParticipantTemplate {
  dni: string;
  fullName: string;
  email: string;
  groupId?: string;
}

/**
 * Genera un CSV de ejemplo para importación de participantes
 */
export const generateParticipantTemplate = (): string => {
  const headers = ['dni', 'fullName', 'email', 'groupId'];
  
  const exampleData: ParticipantTemplate[] = [
    {
      dni: '12345678',
      fullName: 'Juan Pérez García',
      email: 'juan.perez@example.com',
      groupId: '',
    },
    {
      dni: '87654321',
      fullName: 'María González López',
      email: 'maria.gonzalez@example.com',
      groupId: '',
    },
    {
      dni: '11223344',
      fullName: 'Carlos Rodríguez Martínez',
      email: 'carlos.rodriguez@example.com',
      groupId: '',
    },
  ];

  // Crear el contenido CSV
  const csvContent = [
    // Headers
    headers.join(','),
    // Instrucciones como comentario
    '# Las columnas requeridas son: dni, fullName, email',
    '# El groupId es opcional (dejar vacío si no se asigna a ningún grupo)',
    '# Ejemplo de datos:',
    // Datos de ejemplo
    ...exampleData.map(row => 
      [
        row.dni,
        `"${row.fullName}"`, // Encerrar en comillas por si contiene comas
        row.email,
        row.groupId || '',
      ].join(',')
    ),
  ].join('\n');

  return csvContent;
};

/**
 * Descarga un archivo CSV con el template de participantes
 */
export const downloadParticipantTemplate = (): void => {
  const csvContent = generateParticipantTemplate();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'plantilla_participantes.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Genera un template en formato Excel (XLSX)
 * Nota: Para Excel, necesitarías una librería como xlsx o exceljs
 * Por ahora, el CSV es suficiente y Excel puede abrirlo sin problemas
 */
export const getTemplateDescription = (): {
  title: string;
  description: string;
  columns: Array<{ name: string; required: boolean; description: string }>;
} => {
  return {
    title: 'Plantilla de Importación de Participantes',
    description: 'Descarga esta plantilla y complétala con los datos de los participantes que deseas importar.',
    columns: [
      {
        name: 'dni',
        required: true,
        description: 'Documento de identidad del participante (requerido y único)',
      },
      {
        name: 'fullName',
        required: true,
        description: 'Nombre completo del participante (requerido)',
      },
      {
        name: 'email',
        required: false,
        description: 'Correo electrónico del participante (opcional)',
      },
      {
        name: 'groupId',
        required: false,
        description: 'ID del grupo al que pertenece el participante (opcional)',
      },
    ],
  };
};
