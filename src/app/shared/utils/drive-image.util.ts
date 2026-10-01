/**
 * Utilidad para convertir links de Google Drive al formato directo
 * que puede usar un <img src="...">.
 *
 * El usuario guarda el link tal como lo copia de Drive; esta función
 * se encarga de la conversión en el momento de mostrar.
 */

/** URL del placeholder cuando todas las candidatas fallan. Usa el logo existente del proyecto. */
export const DRIVE_IMAGE_PLACEHOLDER = 'logo.webp';

/**
 * Extrae el ID de archivo de Drive de un link en cualquier formato.
 * Devuelve null si no reconoce el link como de Drive.
 */
function extractDriveId(url: string): string | null {
  // Formato: /file/d/ID/...
  const fileMatch = url.match(/\/file\/d\/([^/?#&]+)/);
  if (fileMatch) return fileMatch[1];

  // Formato: /open?id=ID  o  /uc?id=ID
  const idParam = new URL(url).searchParams.get('id');
  if (idParam) return idParam;

  // Formato: lh3.googleusercontent.com/d/ID  (ya convertido)
  const lhMatch = url.match(/lh3\.googleusercontent\.com\/d\/([^/?#&]+)/);
  if (lhMatch) return lhMatch[1];

  return null;
}

/**
 * Genera una lista ordenada de URLs candidatas a probar para mostrar
 * la imagen. La directiva las prueba en orden hasta que una carga bien.
 *
 * @param rawUrl Link original que pegó el usuario (puede ser Drive o no).
 * @returns Lista de candidatas. Vacía si rawUrl es null/undefined/"".
 */
export function getDriveImageCandidates(rawUrl: string | null | undefined): string[] {
  if (!rawUrl?.trim()) return [];

  let id: string | null = null;

  // Intentar extraer ID solo si parece un link de Drive o de googleusercontent
  if (rawUrl.includes('drive.google.com') || rawUrl.includes('lh3.googleusercontent.com')) {
    try {
      id = extractDriveId(rawUrl);
    } catch {
      // new URL() falla si el string no es una URL válida; se ignora
      id = null;
    }
  }

  if (id) {
    // Link de Drive válido: devolver candidatas en orden de preferencia
    return [
      `https://lh3.googleusercontent.com/d/${id}`,
      `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
      `https://drive.google.com/uc?export=view&id=${id}`,
    ];
  }

  // No es de Drive: usar la URL tal cual
  return [rawUrl];
}
