import React, { useState } from 'react';
import { SectionAnalysis, TrafficStatus } from '../types';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

interface SectionCardProps {
  section: SectionAnalysis;
}

export const SectionCard: React.FC<SectionCardProps> = ({ section }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const getStatusBadge = (status: TrafficStatus) => {
    switch (status) {
      case 'VERDE':
        return {
          label: 'VERDE — BIEN RESUELTO',
          borderClass: 'border-emerald-200 hover:border-emerald-300',
          badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          pillBg: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
        };
      case 'AZUL':
        return {
          label: 'AZUL — MEJORABLE',
          borderClass: 'border-blue-200 hover:border-blue-300',
          badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
          pillBg: 'bg-blue-500',
          icon: <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />,
        };
      case 'ROJO':
        return {
          label: 'ROJO — ALTO RIESGO',
          borderClass: 'border-rose-200 hover:border-rose-300',
          badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
          pillBg: 'bg-rose-500',
          icon: <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />,
        };
    }
  };

  const badge = getStatusBadge(section.status);

  const handleCopyRewrite = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`bg-white rounded-2xl border ${badge.borderClass} shadow-xs transition-all overflow-hidden`}
    >
      {/* Card Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-start sm:items-center gap-3">
          <div className="mt-0.5 sm:mt-0">{badge.icon}</div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {section.title}
              </h3>
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.badgeClass}`}
              >
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-1 sm:line-clamp-none">
              {section.summary}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
          <div className="text-right">
            <div className="text-sm font-extrabold text-slate-900">
              {section.score}
              <span className="text-xs text-slate-400 font-normal">/100</span>
            </div>
            <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full ${badge.pillBg}`}
                style={{ width: `${section.score}%` }}
              />
            </div>
          </div>

          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Card Body */}
      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-5 bg-white">
          {/* Hallazgos: Fortalezas y Debilidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fortalezas */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fortalezas Identificadas</span>
              </div>
              {section.strengths && section.strengths.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {section.strengths.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">No se identificaron fortalezas sólidas en este criterio.</p>
              )}
            </div>

            {/* Puntos a Mejorar / Debilidades */}
            <div
              className={`p-4 rounded-xl border ${
                section.status === 'ROJO'
                  ? 'bg-rose-50/40 border-rose-200/80'
                  : 'bg-slate-50 border-slate-200/80'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                {section.status === 'ROJO' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                )}
                <span>Puntos a Mejorar o Riesgos</span>
              </div>
              {section.weaknesses && section.weaknesses.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {section.weaknesses.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                          section.status === 'ROJO' ? 'bg-rose-500' : 'bg-blue-500'
                        }`}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-700 italic">Criterio resuelto sin debilidades notorias.</p>
              )}
            </div>
          </div>

          {/* Recomendaciones Concretas */}
          {section.recommendations && section.recommendations.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-600" />
                <span>Recomendaciones Concretas de Acción</span>
              </h4>
              <div className="space-y-2">
                {section.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200"
                  >
                    <span className="text-[11px] font-bold text-slate-500 shrink-0 mt-0.5">
                      {idx + 1}.
                    </span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ejemplo de Redacción Mejorada (Antes vs Después) */}
          {section.exampleRewrite && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Propuesta de Redacción Optimizada (Antes vs Después)
                  </h4>
                </div>

                <button
                  onClick={() => handleCopyRewrite(section.exampleRewrite!.after)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
                  title="Copiar texto optimizado"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-300">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-300" />
                      <span>Copiar Optimización</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs">
                {/* Antes */}
                <div className="bg-rose-950/40 border border-rose-800/40 rounded-lg p-3 text-rose-200">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block mb-1">
                    Redacción Débil o Genérica (Antes)
                  </span>
                  <p className="italic font-mono leading-relaxed">
                    "{section.exampleRewrite.before}"
                  </p>
                </div>

                {/* Después */}
                <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-3 text-emerald-200">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block mb-1">
                    Redacción de Alto Impacto Cuantificada (Después)
                  </span>
                  <p className="font-semibold leading-relaxed">
                    "{section.exampleRewrite.after}"
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 pt-1 border-t border-white/10 leading-relaxed">
                <strong className="text-slate-300 font-semibold">Por qué funciona: </strong>
                {section.exampleRewrite.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
