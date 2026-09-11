import React from 'react';
import { ShieldCheck, HelpCircle, FileText } from 'lucide-react';

interface HeaderProps {
  onOpenLegend: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLegend }) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <div className="flex flex-col gap-0.5 items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="w-2 h-2 rounded-full bg-rose-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Semáforo CV
              </h1>
              <span className="text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                Auditoría ATS & HR
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Evaluación automatizada en 3 niveles (Verde / Azul / Rojo) para hojas de vida
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-open-legend"
            onClick={onOpenLegend}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Criterios de Semáforo</span>
            <span className="sm:hidden">Criterios</span>
          </button>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 pl-3 border-l border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Formatos: PDF, Word, JPG, PNG</span>
          </div>
        </div>
      </div>
    </header>
  );
};
