/**
 * Extrae el ID del trabajo de una URL de LinkedIn y construye una URL de búsqueda
 * @param jobUrl - URL completa del trabajo de LinkedIn
 * @param keywords - Palabras clave para la búsqueda (por defecto: "javascript")
 * @param location - Ubicación para la búsqueda (por defecto: "España")
 * @param geoId - ID geográfico (por defecto: "105646813" para España)
 * @returns URL de búsqueda de LinkedIn construida
 */
export function buildJobSearchUrl(
  jobUrl: string,
  keywords: string = "javascript",
  location: string = "España",
  geoId: string = "105646813"
): string {
  // Extraer el ID del trabajo usando regex
  const jobIdMatch = jobUrl.match(/\/view\/(\d+)\/\?/);
  
  if (!jobIdMatch || !jobIdMatch[1]) {
    throw new Error(`No se pudo extraer el ID del trabajo de la URL: ${jobUrl}`);
  }
  
  const jobId = jobIdMatch[1];
  
  // Construir la URL de búsqueda
  const searchParams = new URLSearchParams({
    currentJobId: jobId,
    f_AL: 'true',
    f_WT: '1,2,3',
    geoId: geoId,
    keywords: keywords,
    location: location
  });
  
  return `https://www.linkedin.com/jobs/search/?${searchParams.toString()}`;
}

/**
 * Solo extrae el ID del trabajo de una URL de LinkedIn
 * @param jobUrl - URL completa del trabajo de LinkedIn
 * @returns ID del trabajo como string
 */
export function extractJobId(jobUrl: string): string {
  const jobIdMatch = jobUrl.match(/\/view\/(\d+)\/\?/);
  
  if (!jobIdMatch || !jobIdMatch[1]) {
    throw new Error(`No se pudo extraer el ID del trabajo de la URL: ${jobUrl}`);
  }
  
  return jobIdMatch[1];
}

/**
 * Ejemplo de uso:
 * 
 * const jobUrl = "https://www.linkedin.com/jobs/view/4247979887/?eBP=CwEAAAGYaqGQ7s...";
 * const searchUrl = buildJobSearchUrl(jobUrl);
 * console.log(searchUrl);
 * // Output: https://www.linkedin.com/jobs/search/?currentJobId=4247979887&f_AL=true&f_WT=1%2C2%2C3&geoId=105646813&keywords=javascript&location=Espa%C3%B1a
 */
