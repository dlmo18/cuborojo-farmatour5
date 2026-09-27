'use client';

import { 
  MdVisibility, 
  MdEdit, 
  MdDelete,
  MdLayers,
  MdAssignment,
  MdAccountTree,
  MdFolderOpen,
  MdQuiz,
  MdExtension,
  MdFileDownload,
} from 'react-icons/md';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface AdditionalOption<T> {
  label: string;
  callback: (item: T) => void;
  condition?: (item: T) => boolean;
  class: string;
  title?: string;
  icon?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  additionalOptions?: AdditionalOption<T>[];
  emptyMessage?: string;
  idKey?: keyof T;
}

// Mapeo de nombres de iconos Material Design a componentes React Icons
const iconMap: Record<string, React.ComponentType<{ size: number }>> = {
  'layers': MdLayers,
  'assignment': MdAssignment,
  'account_tree': MdAccountTree,
  'folder_open': MdFolderOpen,
  'quiz': MdQuiz,
  'automation': MdExtension,
  'file_download': MdFileDownload,
};

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  onEdit,
  onDelete,
  onView,
  additionalOptions,
  emptyMessage = 'No hay registros disponibles',
  idKey = 'id' as keyof T,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-surface-500">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  const hasActions = onEdit || onDelete || onView || (additionalOptions && additionalOptions.length > 0);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-surface-200">
        <thead className="bg-surface-50">
          <tr>
            {hasActions && (
              <th className="col-actions px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase tracking-wider" style={{ width: 'auto' }}>
                Acciones
              </th>
            )}
            {columns.map((column, idx) => (
              <th
                key={idx}
                className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider"
                style={{ width: column.width }} 
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-surface-200">
          {data.map((item, rowIdx) => (
            <tr key={item[idKey] || rowIdx} className="hover:bg-surface-50">

              {hasActions && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2" style={{ width: 'auto' }}>
                  {onView && (
                    <button
                      onClick={() => onView(item)}
                      className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                      title="Ver"
                    >
                      <MdVisibility size={20} />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(item)}
                      className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                      title="Editar"
                    >
                      <MdEdit size={20} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item)}
                      className="text-accent-600 hover:text-accent-900 inline-flex items-center"
                      title="Eliminar"
                    >
                      <MdDelete size={20} />
                    </button>
                  )}
                  {additionalOptions && additionalOptions.map((option, optIdx) => {
                    // Si hay condición, verificarla; si no hay, mostrar siempre
                    const shouldShow = option.condition ? option.condition(item) : true;
                    
                    if (!shouldShow) return null;

                    // Obtener el icono de React Icons desde el mapeo
                    const iconName = option.icon || 'automation';
                    const IconComponent = iconMap[iconName];
                    
                    return (
                      <button
                        key={optIdx}
                        onClick={() => option.callback(item)}
                        className={`${option.class} px-2 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 hover:shadow-sm`}
                        title={option.title || option.label}
                      >
                        {IconComponent ? (
                          <IconComponent size={18} />
                        ) : (
                          <MdExtension size={18} />
                        )}
                      </button>
                    );
                  })}
                </td>
              )}
              {columns.map((column, colIdx) => {
                const value = typeof column.key === 'string' && column.key.includes('.')
                  ? column.key.split('.').reduce((obj, key) => obj?.[key], item)
                  : item[column.key as keyof T];

                return (
                  <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900" style={{ width: column.width }}>
                    {column.render ? column.render(value, item) : value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
