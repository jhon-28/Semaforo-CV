import React from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, ShieldAlert, Sparkles, Sliders } from 'lucide-react';

interface TrafficLegendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrafficLegendModal: React.FC<TrafficLegendModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          id="btn-close-legend-modal"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="flex gap-1">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            </span>
            Sistema de Clasificación del Semáforo
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Metodología de diagnóstico estructurado para evaluar hojas de vida ante filtros ATS y evaluadores de RRHH.
          </p>
        </div>

        <div className="space-y-4">
          {/* VERDE */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70">
            <div className="flex items-center gap-2 mb-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <h3 className="font-bold text-emerald-900 text-sm tracking-wide">
                VERDE — Criterio Bien Resuelto
              </h3>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed pl-7">
              Fortalece el perfil y aumenta significativamente la probabilidad de avanzar a la entrevista. El contenido está optimizado, es claro, profesional, incluye métricas de impacto verificables y es 100% compatible con motores ATS.
            </p>
            <div className="mt-2 pl-7 flex flex-wrap gap-1.5">
              <span className="text-[11px] bg-emerald-100/90 text-emerald-900 px-2 py-0.5 rounded font-medium">Logros cuantificados ($, %, números)</span>
              <span className="text-[11px] bg-emerald-100/90 text-emerald-900 px-2 py-0.5 rounded font-medium">Palabras clave de industria</span>
              <span className="text-[11px] bg-emerald-100/90 text-emerald-900 px-2 py-0.5 rounded font-medium">Formato ATS limpio</span>
            </div>
          </div>

          {/* AZUL */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
              <h3 className="font-bold text-blue-900 text-sm tracking-wide">
                AZUL — Criterio Mejorable
              </h3>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed pl-7">
              Requiere corrección o ajuste antes de postular. La información existe en el documento pero carece de profundidad, especificidad o métricas de resultado, reduciendo su competitividad.
            </p>
            <div className="mt-2 pl-7 flex flex-wrap gap-1.5">
              <span className="text-[11px] bg-blue-100/90 text-blue-900 px-2 py-0.5 rounded font-medium">Responsabilidades sin resultados medibles</span>
              <span className="text-[11px] bg-blue-100/90 text-blue-900 px-2 py-0.5 rounded font-medium">Perfil profesional genérico</span>
              <span className="text-[11px] bg-blue-100/90 text-blue-900 px-2 py-0.5 rounded font-medium">Estructura visual poco óptima</span>
            </div>
          </div>

          {/* ROJO */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/70">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <h3 className="font-bold text-rose-900 text-sm tracking-wide">
                ROJO — Criterio de Alto Riesgo
              </h3>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed pl-7">
              Representa un riesgo inminente de descalificación en el primer filtro. El contenido está ausente, incompleto o contiene fallas graves que dañan la credibilidad profesional del candidato.
            </p>
            <div className="mt-2 pl-7 flex flex-wrap gap-1.5">
              <span className="text-[11px] bg-rose-100/90 text-rose-900 px-2 py-0.5 rounded font-medium">Contacto incompleto o email informal</span>
              <span className="text-[11px] bg-rose-100/90 text-rose-900 px-2 py-0.5 rounded font-medium">Errores ortográficos o gramaticales</span>
              <span className="text-[11px] bg-rose-100/90 text-rose-900 px-2 py-0.5 rounded font-medium">Incompatibilidad total con sistemas ATS</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
          <button
            id="btn-confirm-legend-modal"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
