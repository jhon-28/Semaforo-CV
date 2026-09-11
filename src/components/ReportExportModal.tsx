import React, { useState } from 'react';
import { CvAnalysisResult } from '../types';
import { X, Printer, Copy, Check, FileText } from 'lucide-react';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CvAnalysisResult;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({ isOpen, onClose, result }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMarkdownReport = (): string => {
    let report = `# REPORTE DE EVALUACIÓN SEMÁFORO - HOJA DE VIDA\n`;
    report += `Fecha: ${new Date(result.analysisDate).toLocaleDateString()}\n`;
    if (result.candidateName) report += `Candidato: ${result.candidateName}\n`;
    if (result.targetRole) report += `Vacante Objetivo: ${result.targetRole}\n`;
    report += `Formato Detectado: ${result.detectedFormat}\n`;
    report += `Calidad de Documento: ${result.documentQuality.status} (${result.documentQuality.details})\n\n`;

    report += `## ESTADO GENERAL: ${result.overallStatus} (${result.overallScore}/100)\n`;
    report += `${result.generalVerdict}\n\n`;

    report += `### Posicionamiento ante el mercado:\n${result.jobPositioningSummary}\n\n`;

    if (result.keyPriorities && result.keyPriorities.length > 0) {
      report += `### Top 3 Prioridades de Acción:\n`;
      result.keyPriorities.forEach((p, i) => {
        report += `${i + 1}. ${p}\n`;
      });
      report += `\n`;
    }

    report += `## EVALUACIÓN DETALLADA POR CRITERIOS (7 SECCIONES)\n\n`;
    result.sections.forEach((sec) => {
      report += `### [${sec.status}] ${sec.title} - ${sec.score}/100\n`;
      report += `${sec.summary}\n\n`;

      if (sec.strengths?.length) {
        report += `* Fortalezas:\n`;
        sec.strengths.forEach((s) => (report += `  - ${s}\n`));
      }
      if (sec.weaknesses?.length) {
        report += `* Puntos a mejorar / Riesgos:\n`;
        sec.weaknesses.forEach((w) => (report += `  - ${w}\n`));
      }
      if (sec.recommendations?.length) {
        report += `* Recomendaciones:\n`;
        sec.recommendations.forEach((r) => (report += `  - ${r}\n`));
      }
      if (sec.exampleRewrite) {
        report += `* Propuesta de Redacción:\n`;
        report += `  - Antes: "${sec.exampleRewrite.before}"\n`;
        report += `  - Después: "${sec.exampleRewrite.after}"\n`;
        report += `  - Justificación: ${sec.exampleRewrite.explanation}\n`;
      }
      report += `\n---\n\n`;
    });

    report += `## AUDITORÍA ATS (Compatibilidad: ${result.atsCompatibility.score}%)\n`;
    report += `Filtros superados: ${result.atsCompatibility.passedChecks.join(', ')}\n`;
    if (result.atsCompatibility.riskPoints.length) {
      report += `Puntos de riesgo: ${result.atsCompatibility.riskPoints.join(', ')}\n`;
    }

    report += `\n## FICHA DE RECURSOS HUMANOS\n`;
    report += `Dictamen: ${result.recruiterView.screeningVerdict}\n`;
    report += `Fortalezas clave: ${result.recruiterView.candidateStrengths.join(', ')}\n`;
    report += `Riesgos de contratación: ${result.recruiterView.hiringRisks.join(', ')}\n`;

    return report;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Reporte de Diagnóstico Semáforo
              </h2>
              <p className="text-xs text-slate-500">
                Informe completo para autoevaluación o revisión de preselección
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${
                result.overallStatus === 'VERDE'
                  ? 'bg-emerald-100 text-emerald-900'
                  : result.overallStatus === 'AZUL'
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-rose-100 text-rose-900'
              }`}
            >
              Semáforo: {result.overallStatus} ({result.overallScore}/100)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '¡Copiado!' : 'Copiar Informe'}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar PDF</span>
            </button>
          </div>
        </div>

        {/* Scrollable report body */}
        <div className="overflow-y-auto p-4 my-2 bg-slate-50/70 rounded-xl border border-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-800 selection:bg-emerald-200">
          {generateMarkdownReport()}
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
