import React from 'react';
import { TrafficStatus, CvAnalysisResult } from '../types';
import { CheckCircle2, AlertCircle, AlertTriangle, ShieldCheck, Target, ArrowUpRight, Zap } from 'lucide-react';

interface ExecutiveSummaryProps {
  result: CvAnalysisResult;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ result }) => {
  const getStatusConfig = (status: TrafficStatus) => {
    switch (status) {
      case 'VERDE':
        return {
          label: 'VERDE — Perfil Optimizado',
          badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          textClass: 'text-emerald-700',
          borderClass: 'border-emerald-200',
          bgClass: 'bg-emerald-50/60',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          desc: 'Alto potencial de avanzar a entrevistas. El perfil está estructurado y optimizado.',
        };
      case 'AZUL':
        return {
          label: 'AZUL — Requiere Refinamiento',
          badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
          textClass: 'text-blue-700',
          borderClass: 'border-blue-200',
          bgClass: 'bg-blue-50/60',
          icon: <AlertCircle className="w-5 h-5 text-blue-600" />,
          desc: 'Buen fundamento con áreas que necesitan cuantificación y métricas antes de postular.',
        };
      case 'ROJO':
        return {
          label: 'ROJO — Alto Riesgo de Descarte',
          badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
          textClass: 'text-rose-700',
          borderClass: 'border-rose-200',
          bgClass: 'bg-rose-50/60',
          icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
          desc: 'Factores críticos que pueden provocar descalificación inmediata en el primer filtro.',
        };
    }
  };

  const statusConfig = getStatusConfig(result.overallStatus);

  // Count section statuses
  const counts = {
    verde: result.sections.filter((s) => s.status === 'VERDE').length,
    azul: result.sections.filter((s) => s.status === 'AZUL').length,
    rojo: result.sections.filter((s) => s.status === 'ROJO').length,
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
      {/* Top row: Status header + score */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border ${statusConfig.badgeClass}`}
            >
              {statusConfig.icon}
              {statusConfig.label}
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              Formato: {result.detectedFormat}
            </span>
            {result.candidateName && (
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                {result.candidateName}
              </span>
            )}
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Resumen Ejecutivo del Perfil
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            {result.generalVerdict}
          </p>
        </div>

        {/* Global score indicator */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0 self-start lg:self-center">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {result.overallScore}
              <span className="text-base font-medium text-slate-400">/100</span>
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              Calificación Global
            </p>
          </div>

          {/* Traffic light mini counter */}
          <div className="flex flex-col gap-1.5 pl-4 border-l border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>{counts.verde} Verde{counts.verde !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-800 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>{counts.azul} Azul{counts.azul !== 1 ? 'es' : ''}</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-800 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>{counts.rojo} Rojo{counts.rojo !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Positioning & Document Quality */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider mb-2">
            <Target className="w-4 h-4 text-slate-600" />
            <span>Posicionamiento ante Vacante / Mercado</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {result.jobPositioningSummary}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-slate-600" />
              <span>Calidad y Legibilidad del Documento</span>
            </div>
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                result.documentQuality.status === 'OPTIMA'
                  ? 'bg-emerald-100 text-emerald-800'
                  : result.documentQuality.status === 'LEGIBLE_CON_RESERVAS'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {result.documentQuality.status}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {result.documentQuality.details}
          </p>
        </div>
      </div>

      {/* High impact action plan */}
      {result.keyPriorities && result.keyPriorities.length > 0 && (
        <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
              Top 3 Prioridades de Mayor Impacto
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {result.keyPriorities.map((priority, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs leading-relaxed text-slate-300 flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  {index + 1}
                </span>
                <span>{priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
