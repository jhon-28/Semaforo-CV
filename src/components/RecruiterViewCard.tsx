import React from 'react';
import { UserCheck, AlertTriangle, CheckCircle2, Clock, FileSearch } from 'lucide-react';

interface RecruiterViewCardProps {
  recruiterView: {
    screeningVerdict: 'AVANZAR_A_ENTREVISTA' | 'REQUIERE_REVISION_MANUAL' | 'DESCALIFICACION_PROBABLE';
    hiringRisks: string[];
    candidateStrengths: string[];
    estimatedExperienceYears?: string;
  };
}

export const RecruiterViewCard: React.FC<RecruiterViewCardProps> = ({ recruiterView }) => {
  const getVerdictBadge = () => {
    switch (recruiterView.screeningVerdict) {
      case 'AVANZAR_A_ENTREVISTA':
        return {
          label: 'AVANZAR A ENTREVISTA TÉCNICA',
          badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          desc: 'El perfil cumple con los criterios de relevancia, evidencia cuantitativa y profesionalismo necesarios para la fase de entrevistas.',
        };
      case 'REQUIERE_REVISION_MANUAL':
        return {
          label: 'REQUIERE REVISIÓN MANUAL DETALLADA',
          badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
          desc: 'El perfil tiene potencial, pero presenta ambigüedades en roles o falta de métricas que deben validarse antes de convocarlo.',
        };
      case 'DESCALIFICACION_PROBABLE':
        return {
          label: 'DESCALIFICACIÓN PROBABLE EN FILTRO INICIAL',
          badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
          desc: 'Alto riesgo de no superar el primer cribado curricular debido a vacíos graves de información, falta de métricas o errores formales.',
        };
    }
  };

  const verdict = getVerdictBadge();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Ficha de Preselección (Perspectiva de Recursos Humanos)
            </h3>
            <p className="text-xs text-slate-500">
              Evaluación rápida para headhunters y reclutadores que evalúan cientos de perfiles por vacante.
            </p>
          </div>
        </div>

        {recruiterView.estimatedExperienceYears && (
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Trayectoria estimada: <strong>{recruiterView.estimatedExperienceYears}</strong></span>
          </div>
        )}
      </div>

      {/* Verdict banner */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Dictamen de Cribado:
          </span>
          <span
            className={`text-xs font-black uppercase tracking-wide px-3 py-1 rounded-full border ${verdict.badgeClass}`}
          >
            {verdict.label}
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mt-1">
          {verdict.desc}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Candidate Strengths */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Factores Atractivos para Contratación</span>
          </div>
          <ul className="space-y-1.5 text-xs text-emerald-900">
            {recruiterView.candidateStrengths.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Hiring Risks */}
        <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-900 uppercase tracking-wider mb-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Alertas y Riesgos de Contratación</span>
          </div>
          {recruiterView.hiringRisks.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-rose-900">
              {recruiterView.hiringRisks.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-800 italic">No se detectaron banderas rojas en el perfil.</p>
          )}
        </div>
      </div>
    </div>
  );
};
