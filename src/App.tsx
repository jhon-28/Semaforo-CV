/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { TrafficLegendModal } from './components/TrafficLegendModal';
import { CvUploader } from './components/CvUploader';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { SectionCard } from './components/SectionCard';
import { AtsAuditCard } from './components/AtsAuditCard';
import { RecruiterViewCard } from './components/RecruiterViewCard';
import { ReportExportModal } from './components/ReportExportModal';
import { CvAnalysisResult, FileType, TrafficStatus } from './types';
import {
  RotateCcw,
  FileText,
  UserCheck,
  Cpu,
  Share2,
  Filter,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CvAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activePerspective, setActivePerspective] = useState<'candidato' | 'reclutador'>('candidato');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | TrafficStatus>('TODOS');
  const [lastPayload, setLastPayload] = useState<{
    fileType: FileType;
    fileName?: string;
    fileBase64?: string;
    text?: string;
    targetRole?: string;
  } | null>(null);

  const formatUserFriendlyError = (raw: string): string => {
    if (!raw) return 'Ocurrió un problema al procesar la hoja de vida.';
    if (
      raw.includes('503') ||
      raw.includes('high demand') ||
      raw.includes('UNAVAILABLE') ||
      raw.includes('alta demanda')
    ) {
      return 'Los servidores de IA están experimentando una alta demanda temporal en este momento. Por favor haz clic en el botón de reintentar para procesar tu hoja de vida.';
    }
    if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
      return 'Se ha alcanzado temporalmente el límite de solicitudes por minuto. Por favor espera unos segundos y pulsa "Reintentar análisis".';
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.error?.message) {
        if (parsed.error.code === 503 || parsed.error.status === 'UNAVAILABLE') {
          return 'Los servidores de IA están experimentando una alta demanda temporal. Por favor pulsa "Reintentar análisis".';
        }
        return parsed.error.message;
      }
    } catch {
      // not json
    }
    return raw;
  };

  const handleAnalyze = async (payload: {
    fileType: FileType;
    fileName?: string;
    fileBase64?: string;
    text?: string;
    targetRole?: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLastPayload(payload);

    try {
      const response = await fetch('/api/analyze-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${response.status}: No se pudo procesar la hoja de vida.`);
      }

      const data: CvAnalysisResult = await response.json();
      setAnalysisResult(data);
      setStatusFilter('TODOS');
    } catch (err: any) {
      console.error('Error de análisis:', err);
      setErrorMessage(
        formatUserFriendlyError(
          err.message || 'Ocurrió un problema al procesar el currículum. Por favor verifica tu conexión y prueba nuevamente.'
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastPayload) {
      handleAnalyze(lastPayload);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const filteredSections = analysisResult
    ? analysisResult.sections.filter((sec) => (statusFilter === 'TODOS' ? true : sec.status === statusFilter))
    : [];

  const counts = analysisResult
    ? {
        total: analysisResult.sections.length,
        rojo: analysisResult.sections.filter((s) => s.status === 'ROJO').length,
        azul: analysisResult.sections.filter((s) => s.status === 'AZUL').length,
        verde: analysisResult.sections.filter((s) => s.status === 'VERDE').length,
      }
    : { total: 0, rojo: 0, azul: 0, verde: 0 };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header onOpenLegend={() => setIsLegendOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Banner introduction if no analysis yet */}
        {!analysisResult && !isLoading && (
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Diagnóstico automatizado de Hojas de Vida</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Optimización Profesional con Sistema de Semáforo
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Analiza tu currículum en segundos bajo 7 criterios exhaustivos. Identifica riesgos de descarte (Rojo), oportunidades de refinamiento (Azul) y fortalezas competitivas (Verde) con recomendaciones de redacción accionables.
            </p>

            {/* Visual 3-level pills */}
            <div className="flex flex-wrap justify-center items-center gap-2.5 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-100/80 text-emerald-900 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                VERDE: Criterio Bien Resuelto
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-100/80 text-blue-900 border border-blue-300">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                AZUL: Criterio Mejorable
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-rose-100/80 text-rose-900 border border-rose-300">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                ROJO: Alto Riesgo
              </div>
            </div>
          </div>
        )}

        {/* Upload form / Input */}
        {!analysisResult && (
          <CvUploader onAnalyze={handleAnalyze} isLoading={isLoading} />
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-rose-700" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-wider text-rose-800">
                  Aviso de procesamiento
                </p>
                <p className="text-xs sm:text-sm text-rose-900 leading-relaxed max-w-2xl">
                  {errorMessage}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {lastPayload && (
                <button
                  id="btn-retry-analysis"
                  onClick={handleRetry}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reintentar análisis</span>
                </button>
              )}
              <button
                onClick={() => setErrorMessage(null)}
                className="px-3 py-2 text-xs font-semibold text-rose-700 hover:text-rose-900 hover:bg-rose-100/60 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Loading state indicator */}
        {isLoading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-sm">
              <div className="w-6 h-6 border-2 border-white/30 border-t-emerald-400 rounded-full animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Auditando documento con IA especialista...
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Extrayendo datos de contacto, cuantificación de experiencia laboral, análisis léxico, compatibilidad ATS y asignando semáforos a los 7 criterios.
              </p>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <button
                id="btn-new-analysis"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Evaluar otra Hoja de Vida</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {/* Perspective selector */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                  <button
                    onClick={() => setActivePerspective('candidato')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                      activePerspective === 'candidato'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Vista Candidato</span>
                  </button>
                  <button
                    onClick={() => setActivePerspective('reclutador')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                      activePerspective === 'reclutador'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Vista Reclutador</span>
                  </button>
                </div>

                <button
                  id="btn-export-report"
                  onClick={() => setIsExportOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Exportar Reporte</span>
                </button>
              </div>
            </div>

            {/* Executive summary block */}
            <ExecutiveSummary result={analysisResult} />

            {/* Perspective View Display */}
            {activePerspective === 'reclutador' ? (
              <div className="space-y-6">
                <RecruiterViewCard recruiterView={analysisResult.recruiterView} />
                <AtsAuditCard atsCompatibility={analysisResult.atsCompatibility} />
              </div>
            ) : (
              <div className="space-y-6">
                <AtsAuditCard atsCompatibility={analysisResult.atsCompatibility} />
              </div>
            )}

            {/* 7 Sections Detailed Audit with Traffic Light filter */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Evaluación por Secciones (7 Criterios del Semáforo)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Inspección técnica de cada componente con hallazgos, recomendaciones y reescritura.
                  </p>
                </div>

                {/* Filter pills */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-center">
                  <button
                    onClick={() => setStatusFilter('TODOS')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      statusFilter === 'TODOS'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Todos ({counts.total})
                  </button>
                  <button
                    onClick={() => setStatusFilter('ROJO')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      statusFilter === 'ROJO'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-rose-800 hover:bg-rose-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Rojos ({counts.rojo})
                  </button>
                  <button
                    onClick={() => setStatusFilter('AZUL')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      statusFilter === 'AZUL'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-blue-800 hover:bg-blue-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Azules ({counts.azul})
                  </button>
                  <button
                    onClick={() => setStatusFilter('VERDE')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      statusFilter === 'VERDE'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-emerald-800 hover:bg-emerald-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Verdes ({counts.verde})
                  </button>
                </div>
              </div>

              {/* List of Section Cards */}
              <div className="space-y-3.5">
                {filteredSections.map((section) => (
                  <SectionCard key={section.id} section={section} />
                ))}

                {filteredSections.length === 0 && (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                    No hay secciones con el estado seleccionado ({statusFilter}).
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Call to action to re-evaluate */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-extrabold text-white">
                  ¿Aplicaste las recomendaciones a tu hoja de vida?
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Vuelve a subir tu documento corregido para verificar si tus alertas Rojas y Azules se transformaron en Verde.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-xl transition-colors shrink-0 shadow-xs"
              >
                Volver a Evaluar
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Semáforo CV</span>
            <span>•</span>
            <span>Auditoría de Hojas de Vida con Sistema de 3 Niveles (Verde, Azul, Rojo)</span>
          </div>
          <p>Diseñado para candidatos en búsqueda activa y evaluadores de RRHH</p>
        </div>
      </footer>

      {/* Modals */}
      <TrafficLegendModal
        isOpen={isLegendOpen}
        onClose={() => setIsLegendOpen(false)}
      />

      {analysisResult && (
        <ReportExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          result={analysisResult}
        />
      )}
    </div>
  );
}
