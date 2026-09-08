/**
 * Extrae solo el texto plano de HTML, removiendo todas las etiquetas
 * @param html Contenido HTML
 * @param maxLength Longitud máxima del texto (opcional)
 * @returns Texto plano
 */
export function stripHtmlTags(html?: string, maxLength?: number): string {
  if (!html) return '—';
  
  // Remover todas las etiquetas HTML
  let text = html.replace(/<[^>]*>/g, '');
  
  // Decodificar entidades HTML comunes
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
  
  // Remover espacios múltiples
  text = text.replace(/\s+/g, ' ');
  
  // Truncar si es necesario
  if (maxLength && text.length > maxLength) {
    text = text.substring(0, maxLength) + '...';
  }
  
  return text || '—';
}

/**
 * Renderiza contenido HTML de forma segura en un elemento React
 * NOTA: Usar solo con contenido de fuentes confiables
 * @param html Contenido HTML
 */
export function renderHtmlContent(html?: string) {
  if (!html) return '—';
  return { __html: html };
}
