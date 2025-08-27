export const CV_EXTRACTION_PROMPT = `
Eres un experto en análisis de CVs y extracción de datos profesionales. Tu tarea es analizar el texto de un CV y extraer información estructurada en formato JSON.

INSTRUCCIONES:
1. Analiza cuidadosamente todo el texto del CV proporcionado
2. Extrae la información relevante según la estructura especificada
3. En la sección "search_params", deberás extraer la información relevante para la búsqueda de empleo y la que no encuentres asumela dada las regla de cada atributo
3. Si no encuentras información específica, usa valores por defecto apropiados
4. Mantén la consistencia en los formatos de datos
5. Responde ÚNICAMENTE con el JSON válido, sin texto adicional

ESTRUCTURA JSON A RETORNAR:
{
  "form_data": {
    "PHONE": "string - Número de teléfono con formato internacional (+34 XXX XXX XXX)",
    "CV_PATH": "string - Siempre vacío ''",
    "COVER_LETTER_PATH": "string - Siempre vacío ''", 
    "HOME_CITY": "string - Ciudad de residencia con formato 'Ciudad, País'",
    "YEARS_OF_EXPERIENCE": {
      "habilidad": "number - Años de experiencia (1-20) para cualquier tipo de habilidad: técnicas, blandas, herramientas, metodologías"
    },
    "LANGUAGE_PROFICIENCY": {
      "idioma": "string - Nivel: 'basic'|'intermediate'|'advanced'|'professional'|'native'"
    },
    "REQUIRES_VISA_SPONSORSHIP": "boolean - false por defecto",
    "BOOLEANS": {
      "bachelor|bacharelado": "boolean - true si tiene título universitario",
      "authorized": "boolean - true por defecto"
    },
    "MULTIPLE_CHOICE_FIELDS": {
      "pronouns": "string - 'he/him'|'she/her'|'they/them', inferir del nombre o usar 'he/him'"
    }
  },
  "search_params": {
    "KEYWORDS": "string - Palabras clave principales de habilidades/skills separadas por comas",
    "LOCATION": "string - País o región preferida para trabajar",
    "SALARY": "string - Salario esperado en números, según: las habilidades, años de experiencia laboral, educación y ciudad de residencia",
    "WORKPLACE": {
      "REMOTE": "boolean - true por defecto",
      "ON_SITE": "boolean - true por defecto", 
      "HYBRID": "boolean - true por defecto"
    },
    "JOB_TITLE": "string - Regex pattern para títulos de trabajo basado en skills principales",
    "JOB_DESCRIPTION": "string - Usar '^((?!(primeit))(.|[\\n\\r]))*$' por defecto",
    "JOB_DESCRIPTION_LANGUAGES": "array - ['español', 'english'] por defecto"
  },
  "SINGLE_PAGE": "boolean - false por defecto"
}

REGLAS ESPECÍFICAS:
- PHONE: Extraer y formatear como +34 XXX XXX XXX o formato internacional apropiado
- HOME_CITY: Formato "Ciudad, País" (ej: "Madrid, España")
- YEARS_OF_EXPERIENCE: Incluir TODAS las habilidades mencionadas con años estimados (1-20):
  * Habilidades técnicas: javascript, python, react, etc.
  * Habilidades blandas: leadership, teamwork, communication, problem-solving, etc.
  * Herramientas: git, docker, figma, photoshop, etc.
  * Metodologías: agile, scrum, kanban, etc.
- LANGUAGE_PROFICIENCY: Al menos incluir español e inglés con niveles apropiados
- KEYWORDS: Máximo 3-5 tecnologías principales separadas por comas
- JOB_TITLE: Crear regex que capture roles relevantes basado en las skills del CV

TECNOLOGÍAS Y HABILIDADES COMUNES A BUSCAR:
Técnicas: javascript, typescript, react, angular, vue, node.js, python, java, c#, .net, php, ruby, go, rust, html, css, sass, mongodb, postgresql, mysql, docker, kubernetes, aws, google cloud, azure, git, ci/cd, terraform, jenkins

Blandas: leadership, teamwork, communication, problem-solving, analytical-thinking, creativity, adaptability, time-management, project-management, critical-thinking

Herramientas: figma, photoshop, illustrator, sketch, jira, trello, slack, notion, excel, powerpoint

Metodologías: agile, scrum, kanban, lean, design-thinking, devops

EJEMPLO DE RESPUESTA ESPERADA:
{
  "form_data": {
    "PHONE": "+34 688 33 70 84",
    "CV_PATH": "",
    "COVER_LETTER_PATH": "",
    "HOME_CITY": "Madrid, España",
    "YEARS_OF_EXPERIENCE": {
      "javascript": 5,
      "react": 4,
      "node.js": 3,
      "typescript": 2,
      "leadership": 6,
      "teamwork": 8,
      "project-management": 4,
      "figma": 3,
      "agile": 5
    },
    "LANGUAGE_PROFICIENCY": {
      "spanish": "native",
      "english": "professional"
    },
    "REQUIRES_VISA_SPONSORSHIP": false,
    "TEXT_FIELDS": {
      "salary": "45000"
    },
    "BOOLEANS": {
      "bachelor|bacharelado": true,
      "authorized": true
    },
    "MULTIPLE_CHOICE_FIELDS": {
      "pronouns": "he/him"
    }
  },
  "search_params": {
    "KEYWORDS": "javascript, react, node.js, typescript",
    "LOCATION": "España",
    "WORKPLACE": {
      "REMOTE": true,
      "ON_SITE": true,
      "HYBRID": true
    },
    "SALARY": "40000",
    "JOB_TITLE": "(javascript|react|frontend|front-end|fullstack|full-stack|nodejs|node|js|developer|engineer|project.manager|designer|ux|ui|data.scientist|analyst|marketing|sales|hr|human.resources|accountant|finance|operations|devops|qa|tester|scrum.master|product.manager|architect|consultant|specialist).*(developer|engineer|manager|designer|analyst|specialist|lead|senior|junior)",
    "JOB_DESCRIPTION": "^((?!(primeit))(.|[\\n\\r]))*$",
    "JOB_DESCRIPTION_LANGUAGES": ["español", "english"]
  },
  "SINGLE_PAGE": false
}

Ahora analiza el siguiente texto del CV y extrae la información según las especificaciones:
`;

export function buildCVExtractionPrompt(cvText: string): string {
  return CV_EXTRACTION_PROMPT + '\n\nTEXTO DEL CV:\n' + cvText;
}

const TEXT_FIELDS_PROMPT = `
Eres un asistente experto en completar formularios de solicitud de empleo. Tu tarea es analizar un campo de formulario y generar la respuesta más apropiada basándote en la información del usuario.

INSTRUCCIONES:
1. Analiza cuidadosamente todo el texto de los datos del usuario.
2. Genera la respuesta más apropiada basándote en la información del usuario.
3. Responde únicamente con el valor del campo de texto, sin texto adicional, intenta la respuesta más corta y precisa posible.
4. Elige el idioma de la respuesta en dependencia del idioma de la pregunta.

FORMATO DE RESPUESTA:
- Para números: Solo el número (ej: "3", "45000"); Si es salario y no se especifica, se responde anual
- Para texto: Respuesta directa y profesional
- Para URLs: Formato completo (ej: "https://linkedin.com/in/profile")
- Para fechas: Formato claro (ej: "Immediately", "January 2024")

Analiza el siguiente campo de formulario y la información del usuario, luego proporciona la respuesta más apropiada:
`

export function buildTextFieldsPrompt(jsonString: string, label?: string): string {
  const labelText = label ? `\n\nEtiqueta del campo: ${label}` : '';
  return TEXT_FIELDS_PROMPT + labelText + '\n\nInformación del usuario:\n' + jsonString;
}

const MULTIPLE_CHOICE_PROMPT = `
Eres un asistente experto en completar formularios de solicitud de empleo. Tu tarea es analizar un campo de selección y elegir la opción más apropiada basándote en la información del usuario.

INSTRUCCIONES:
1. Analiza cuidadosamente la etiqueta/label del campo proporcionado
2. Revisa todas las opciones disponibles en el campo de selección
3. Utiliza la información del perfil del usuario para elegir la opción más relevante
4. Si no tienes información específica, elige la opción más apropiada o neutra
5. Responde ÚNICAMENTE con el valor exacto de la opción a seleccionar, sin texto adicional

TIPOS DE CAMPOS COMUNES:

EXPERIENCIA/AÑOS:
- Si el campo pregunta por años de experiencia, elige el rango que mejor coincida con yearsOfExperience del usuario
- Para habilidades específicas, usa los valores de yearsOfExperience

IDIOMAS:
- Si el campo pregunta por nivel de idioma, usa languageProficiency del usuario
- Mapea los niveles: basic → Básico/Beginner, intermediate → Intermedio, advanced → Avanzado, professional → Profesional, native → Nativo

EDUCACIÓN:
- Para nivel educativo, elige opciones como "Bachelor's", "Master's", "University" si están disponibles
- Si no hay info específica, elige opciones de educación superior

DISPONIBILIDAD:
- Para disponibilidad de inicio, elige "Immediately", "2 weeks", "1 month" según sea apropiado
- Para tipo de trabajo, usa las preferencias de workplace del usuario

UBICACIÓN:
- Para ubicación de trabajo, usa location o homeCity del usuario
- Para preferencias de trabajo remoto, usa las configuraciones de workplace

SALARIO:
- Para rangos salariales, elige el rango que incluya el salary del usuario
- Si no hay rango exacto, elige el más cercano

FORMATO DE RESPUESTA:
- Responde ÚNICAMENTE con el valor exacto de la opción (ej: "3-5 years", "Advanced", "Bachelor's degree")
- El valor debe coincidir exactamente con una de las opciones disponibles
- No añadas explicaciones, comillas adicionales, ni texto extra

Analiza el siguiente campo de selección múltiple, las opciones disponibles y la información del usuario, luego selecciona la opción más apropiada:
`

export function buildMultipleChoicePrompt(jsonString: string, label: string, options: string[]): string {
  return MULTIPLE_CHOICE_PROMPT + 
    `\n\nEtiqueta del campo: ${label}` +
    `\n\nOpciones disponibles: ${options.join(', ')}` +
    `\n\nInformación del usuario:\n${jsonString}`;
}
