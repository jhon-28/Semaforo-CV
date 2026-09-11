import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import mammoth from 'mammoth';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for base64 PDFs and images
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Helper to get Gemini client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const CV_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    candidateName: { type: Type.STRING },
    targetRole: { type: Type.STRING },
    detectedFormat: {
      type: Type.STRING,
      description: 'PDF, Word, JPG, PNG o Texto',
    },
    documentQuality: {
      type: Type.OBJECT,
      properties: {
        status: { type: Type.STRING, description: 'OPTIMA, LEGIBLE_CON_RESERVAS o DEFICIENTE' },
        details: { type: Type.STRING },
      },
      required: ['status', 'details'],
    },
    overallStatus: {
      type: Type.STRING,
      description: 'VERDE, AZUL o ROJO',
    },
    overallScore: {
      type: Type.NUMBER,
      description: 'Puntuación de 0 a 100',
    },
    generalVerdict: { type: Type.STRING },
    jobPositioningSummary: { type: Type.STRING },
    keyPriorities: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Top 3 acciones prioritarias con mayor impacto',
    },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'contacto, resumen, experiencia, educacion, habilidades, formato_ats, ortografia' },
          title: { type: Type.STRING },
          status: { type: Type.STRING, description: 'VERDE, AZUL o ROJO' },
          score: { type: Type.NUMBER, description: '0 a 100' },
          summary: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          exampleRewrite: {
            type: Type.OBJECT,
            properties: {
              before: { type: Type.STRING },
              after: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ['before', 'after', 'explanation'],
          },
        },
        required: ['id', 'title', 'status', 'score', 'summary', 'strengths', 'weaknesses', 'recommendations'],
      },
    },
    atsCompatibility: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER },
        passedChecks: { type: Type.ARRAY, items: { type: Type.STRING } },
        riskPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['score', 'passedChecks', 'riskPoints'],
    },
    recruiterView: {
      type: Type.OBJECT,
      properties: {
        screeningVerdict: {
          type: Type.STRING,
          description: 'AVANZAR_A_ENTREVISTA, REQUIERE_REVISION_MANUAL o DESCALIFICACION_PROBABLE',
        },
        hiringRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
        candidateStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        estimatedExperienceYears: { type: Type.STRING },
      },
      required: ['screeningVerdict', 'hiringRisks', 'candidateStrengths'],
    },
  },
  required: [
    'detectedFormat',
    'documentQuality',
    'overallStatus',
    'overallScore',
    'generalVerdict',
    'jobPositioningSummary',
    'keyPriorities',
    'sections',
    'atsCompatibility',
    'recruiterView',
  ],
};

async function executeAnalysisWithFallback(ai: GoogleGenAI, contentsParts: any[]) {
  // Ordered models to try if high demand occurs on gemini-3.8-flash
  const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Semáforo CV] Solicitando análisis con modelo ${modelName} (intento ${attempt}/2)...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: { parts: contentsParts },
          config: {
            responseMimeType: 'application/json',
            responseSchema: CV_ANALYSIS_SCHEMA,
          },
        });

        const rawText = response.text?.trim() || '';
        if (rawText) {
          // Clean potential markdown code fences just in case
          let cleanJson = rawText;
          if (cleanJson.startsWith('```json')) {
            cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          const parsed = JSON.parse(cleanJson);
          console.log(`[Semáforo CV] Análisis exitoso con modelo ${modelName}`);
          return parsed;
        }
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        console.warn(`[Semáforo CV] Falla en ${modelName} (intento ${attempt}):`, msg);

        const isOverloaded =
          msg.includes('503') ||
          msg.includes('high demand') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('429') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('overloaded');

        if (isOverloaded && attempt < 2) {
          // Pause 1.2 seconds before retry on the same model
          await new Promise((res) => setTimeout(res, 1200));
        } else if (isOverloaded) {
          // Move to next fallback model immediately
          break;
        } else {
          // Non-overload error, continue to try next model or throw
          break;
        }
      }
    }
  }

  throw lastError;
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// CV Analysis endpoint
app.post('/api/analyze-cv', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileType, fileName, fileBase64, text, targetRole, audience } = req.body;

    if (!fileBase64 && !text) {
      res.status(400).json({
        error: 'Debes proporcionar un archivo (PDF, Word, JPG, PNG) o texto del currículum.',
      });
      return;
    }

    const ai = getGeminiClient();

    let extractedText = '';
    let contentsParts: any[] = [];

    const effectiveFileType = fileType || (fileName?.endsWith('.pdf') ? 'PDF' : fileName?.match(/\.(jpe?g|png)$/i) ? 'JPG' : 'Texto');

    // Handle Word documents via mammoth
    if ((effectiveFileType === 'Word' || fileName?.endsWith('.docx') || fileName?.endsWith('.doc')) && fileBase64) {
      try {
        const buffer = Buffer.from(fileBase64, 'base64');
        const mammothResult = await mammoth.extractRawText({ buffer });
        extractedText = mammothResult.value;
        contentsParts.push({
          text: `[DOCUMENTO CV EXTRAÍDO DE ARCHIVO WORD (${fileName || 'documento.docx'})]:\n\n${extractedText}`,
        });
      } catch (err: any) {
        console.warn('Error extrayendo texto con mammoth:', err);
        // Fallback to sending text if available
        if (text) {
          contentsParts.push({ text: `[CONTENIDO CV]:\n\n${text}` });
        } else {
          res.status(422).json({
            error: 'No se pudo leer el archivo Word. Asegúrate de que sea un archivo .docx válido o copia y pega el texto directamente.',
          });
          return;
        }
      }
    } else if (fileBase64 && (effectiveFileType === 'PDF' || fileName?.endsWith('.pdf'))) {
      // PDF native multimodal support in Gemini
      contentsParts.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: fileBase64,
        },
      });
      contentsParts.push({
        text: `[ARCHIVO PDF ADJUNTO: ${fileName || 'curriculum.pdf'}]`,
      });
    } else if (fileBase64 && (effectiveFileType === 'JPG' || effectiveFileType === 'PNG' || fileName?.match(/\.(jpe?g|png)$/i))) {
      // Image support
      const mime = fileName?.endsWith('.png') ? 'image/png' : 'image/jpeg';
      contentsParts.push({
        inlineData: {
          mimeType: mime,
          data: fileBase64,
        },
      });
      contentsParts.push({
        text: `[IMAGEN DE HOJA DE VIDA ADJUNTA: ${fileName || 'curriculum.jpg'}]`,
      });
    } else {
      // Plain text or manual paste
      contentsParts.push({
        text: `[TEXTO DE HOJA DE VIDA PROPORCIONADO]:\n\n${text || ''}`,
      });
    }

    const rolePrompt = targetRole && targetRole.trim()
      ? `\nVACANTE O ROL OBJETIVO ESPECIFICADO POR EL USUARIO: "${targetRole.trim()}". Evalúa la adecuación y palabras clave respecto a esta posición.`
      : `\nVACANTE OBJETIVO: No se especificó un rol exacto. Evalúa el CV posicionándolo frente al mercado laboral estándar de su área profesional detectada.`;

    const instructionsPrompt = `
Eres un especialista sénior en optimización de perfiles profesionales y análisis de hojas de vida (CV/Resume).
Tu misión es actuar como una herramienta automatizada de evaluación que analiza documentos de candidatos (PDF, Word, JPG, PNG, Texto) y proporciona retroalimentación estructurada mediante un sistema de semáforo de tres niveles:

CRITERIOS DE CLASIFICACIÓN DE SEMÁFORO:
- VERDE (Criterio bien resuelto): Fortalece el perfil y aumenta significativamente la probabilidad de avanzar en el proceso. Contenido optimizado, claro, profesional, con métricas cuantificadas, logros medibles, palabras clave y formato ATS impecable.
- AZUL (Criterio mejorable): Requiere corrección o ajuste antes de aplicar. El contenido existe pero necesita refinamiento, cuantificación, verbos de acción, o especificidad técnica.
- ROJO (Criterio de alto riesgo): Riesgo alto de descalificación temprana. Información ausente, incompleta, errores ortográficos graves, datos de contacto dudosos o formato que rompe ATS.

EVALÚA OBLIGATORIAMENTE ESTAS 7 SECCIONES:
1. "contacto": Datos de contacto (nombre, email profesional, teléfono/prefijo, ciudad/país, enlaces actualizados a LinkedIn, portafolio/GitHub si aplica).
2. "resumen": Resumen profesional o perfil (propuesta de valor única, años de experiencia, especialidad, enfoque a resultados, sin clichés vacíos).
3. "experiencia": Experiencia laboral (relevancia cronológica inversa, cuantificación con números/porcentajes/impacto financiero con método STAR/CAR, verbos de acción fuertes, palabras clave de la industria).
4. "educacion": Educación y certificaciones (grados académicos, instituciones reconocidas, certificaciones de la industria vigentes, orden y pertinencia).
5. "habilidades": Habilidades y competencias (división clara entre habilidades duras/técnicas y blandas/interpersonales, herramientas actuales de mercado, nivel de dominio).
6. "formato_ats": Formato y compatibilidad ATS (estructura limpia, títulos de sección estándar, ausencia de tablas complejas o gráficos que bloquean parsers, longitud adecuada de 1-2 páginas).
7. "ortografia": Ortografía y gramática (impecable uso de tildes, signos de puntuación, concordancia gramatical, consistencia en tiempos verbales en español).

${rolePrompt}

REGLAS DE RESPUESTA:
- Sé específico y no des feedback genérico.
- Para cada sección que esté en AZUL o ROJO, proporciona al menos un ejemplo concreto de redacción "exampleRewrite" mostrando cómo cambiar una frase débil o ausente por una redacción de alto impacto cuantificada.
- En la sección "recruiterView", evalúa como un reclutador experto de Recursos Humanos (veredicto de screening, riesgos detectados, estimación de años de experiencia).
- Calidad de documento: evalúa si el texto se lee con claridad o si la imagen/archivo tiene dificultades de resolución ("OPTIMA", "LEGIBLE_CON_RESERVAS", "DEFICIENTE").

Debes responder estrictamente en formato JSON con la estructura solicitada.`;

    contentsParts.push({ text: instructionsPrompt });

    const parsedData = await executeAnalysisWithFallback(ai, contentsParts);
    parsedData.analysisDate = new Date().toISOString();

    res.json(parsedData);
  } catch (error: any) {
    console.error('Error al analizar CV:', error);

    const rawMsg = error?.message || String(error);
    let userFriendlyMsg = 'Ocurrió un error al evaluar la hoja de vida. Por favor intenta nuevamente.';

    if (
      rawMsg.includes('503') ||
      rawMsg.includes('high demand') ||
      rawMsg.includes('UNAVAILABLE') ||
      rawMsg.includes('overloaded')
    ) {
      userFriendlyMsg =
        'Los servidores de IA están experimentando una alta demanda momentánea. Por favor haz clic en "Reintentar análisis" en unos segundos.';
    } else if (
      rawMsg.includes('429') ||
      rawMsg.includes('RESOURCE_EXHAUSTED') ||
      rawMsg.includes('quota')
    ) {
      userFriendlyMsg =
        'Se ha alcanzado temporalmente el límite de solicitudes por minuto. Aguarda unos 10 segundos y pulsa "Reintentar análisis".';
    } else if (rawMsg.includes('API key') || rawMsg.includes('GEMINI_API_KEY')) {
      userFriendlyMsg =
        'La clave de API de Gemini no está configurada o no es válida. Verifica la configuración de tu entorno.';
    } else {
      try {
        const parsedJson = JSON.parse(rawMsg);
        if (parsedJson?.error?.message) {
          if (parsedJson.error.code === 503 || parsedJson.error.status === 'UNAVAILABLE') {
            userFriendlyMsg =
              'Los servidores de IA están experimentando una alta demanda temporal. Por favor presiona "Reintentar análisis".';
          } else {
            userFriendlyMsg = parsedJson.error.message;
          }
        }
      } catch {
        // Not a JSON string, keep userFriendlyMsg or use rawMsg if it's descriptive and clean
        if (rawMsg.length < 200 && !rawMsg.includes('{') && !rawMsg.includes('TypeError')) {
          userFriendlyMsg = rawMsg;
        }
      }
    }

    res.status(503).json({
      error: userFriendlyMsg,
    });
  }
});

// Setup Vite development middleware or production static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de Semáforo CV ejecutándose en http://localhost:${PORT}`);
  });
}

startServer();
