export type TrafficStatus = 'VERDE' | 'AZUL' | 'ROJO';

export type FileType = 'PDF' | 'Word' | 'JPG' | 'PNG' | 'Texto';

export interface SectionAnalysis {
  id: 'contacto' | 'resumen' | 'experiencia' | 'educacion' | 'habilidades' | 'formato_ats' | 'ortografia';
  title: string;
  status: TrafficStatus;
  score: number; // 0 to 100
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  exampleRewrite?: {
    before: string;
    after: string;
    explanation: string;
  };
}

export interface CvAnalysisResult {
  candidateName?: string;
  targetRole?: string;
  detectedFormat: FileType;
  documentQuality: {
    status: 'OPTIMA' | 'LEGIBLE_CON_RESERVAS' | 'DEFICIENTE';
    details: string;
  };
  overallStatus: TrafficStatus;
  overallScore: number; // 0 - 100
  generalVerdict: string;
  jobPositioningSummary: string; // Posicionamiento ante vacante
  keyPriorities: string[]; // Top 3 prioridades inmediatas
  sections: SectionAnalysis[];
  atsCompatibility: {
    score: number;
    passedChecks: string[];
    riskPoints: string[];
  };
  recruiterView: {
    screeningVerdict: 'AVANZAR_A_ENTREVISTA' | 'REQUIERE_REVISION_MANUAL' | 'DESCALIFICACION_PROBABLE';
    hiringRisks: string[];
    candidateStrengths: string[];
    estimatedExperienceYears?: string;
  };
  analysisDate: string;
}

export interface SampleResume {
  id: string;
  name: string;
  role: string;
  description: string;
  level: 'Alto Riesgo (Rojo)' | 'Mejorable (Azul)' | 'Optimizado (Verde)';
  expectedStatus: TrafficStatus;
  text: string;
}
