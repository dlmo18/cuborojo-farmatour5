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
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  const hasActions = onEdit || onDelete || onView || (additionalOptions && additionalOptions.length > 0);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {hasActions && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            )}
            {columns.map((column, idx) => (
              <th
                key={idx}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                style={{ width: column.width }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, rowIdx) => (
            <tr key={item[idKey] || rowIdx} className="hover:bg-gray-50">

              {hasActions && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {onView && (
                    <button
                      onClick={() => onView(item)}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      title="Ver"
                    >
                      <span className="material-icons text-lg" style={{ fontSize: '20px' }}>visibility</span>
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(item)}
                      className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                      title="Editar"
                    >
                      <span className="material-icons text-lg" style={{ fontSize: '20px' }}>edit</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item)}
                      className="text-red-600 hover:text-red-900 inline-flex items-center"
                      title="Eliminar"
                    >
                      <span className="material-icons text-lg" style={{ fontSize: '20px' }}>delete</span>
                    </button>
                  )}
                  {additionalOptions && additionalOptions.map((option, optIdx) => {
                    // Si hay condición, verificarla; si no hay, mostrar siempre
                    const shouldShow = option.condition ? option.condition(item) : true;
                    
                    if (!shouldShow) return null;
                    
                    return (
                      <button
                        key={optIdx}
                        onClick={() => option.callback(item)}
                        className={`${option.class} px-2 py-1 rounded text-xs font-semibold inline-flex items-center hover:shadow-sm`}
                        title={option.title || option.label}
                      >
                        {option.icon ? (
                          <span className="material-icons" style={{ fontSize: '18px' }}>
                            {option.icon}
                          </span>
                        ) : (
                          <span className="material-icons" style={{ fontSize: '18px' }}>
                            automation
                          </span>
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
                  <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
