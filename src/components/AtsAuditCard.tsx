import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Cpu } from 'lucide-react';

interface AtsAuditCardProps {
  atsCompatibility: {
    score: number;
    passedChecks: string[];
    riskPoints: string[];
  };
}

export const AtsAuditCard: React.FC<AtsAuditCardProps> = ({ atsCompatibility }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Cpu className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Auditoría de Compatibilidad ATS (Applicant Tracking Systems)
            </h3>
            <p className="text-xs text-slate-500">
              Evaluación de legibilidad por los algoritmos de escaneo que filtran el 75% de los CVs antes de RRHH.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 self-start sm:self-center">
          <span className="text-xs font-bold text-slate-600 uppercase">Índice ATS:</span>
          <span
            className={`text-lg font-black ${
              atsCompatibility.score >= 80
                ? 'text-emerald-700'
                : atsCompatibility.score >= 55
                ? 'text-blue-700'
                : 'text-rose-700'
            }`}
          >
            {atsCompatibility.score}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Passed Checks */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Filtros ATS Aprobados ({atsCompatibility.passedChecks.length})</span>
          </div>
          <ul className="space-y-1.5 text-xs text-emerald-900">
            {atsCompatibility.passedChecks.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risk Points */}
        <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-900 uppercase tracking-wider mb-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Puntos de Fricción ATS ({atsCompatibility.riskPoints.length})</span>
          </div>
          {atsCompatibility.riskPoints.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-rose-900">
              {atsCompatibility.riskPoints.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-rose-600 font-bold">⚠</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-800 italic">No se detectaron riesgos de bloqueo por software ATS.</p>
          )}
        </div>
      </div>
    </div>
  );
};
