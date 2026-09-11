import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Sparkles, AlertTriangle, CheckCircle2, AlertCircle, ArrowRight, Trash2 } from 'lucide-react';
import { FileType, SampleResume } from '../types';
import { SAMPLE_RESUMES } from '../data/samples';

interface CvUploaderProps {
  onAnalyze: (payload: {
    fileType: FileType;
    fileName?: string;
    fileBase64?: string;
    text?: string;
    targetRole?: string;
  }) => void;
  isLoading: boolean;
}

export const CvUploader: React.FC<CvUploaderProps> = ({ onAnalyze, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'text' | 'samples'>('upload');
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: number;
    type: FileType;
    base64: string;
  } | null>(null);
  const [cvText, setCvText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const determineFileType = (fileName: string, mimeType: string): FileType => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf' || mimeType.includes('pdf')) return 'PDF';
    if (ext === 'docx' || ext === 'doc' || mimeType.includes('word') || mimeType.includes('officedocument')) return 'Word';
    if (ext === 'png' || mimeType.includes('png')) return 'PNG';
    if (ext === 'jpg' || ext === 'jpeg' || mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'JPG';
    return 'Texto';
  };

  const processFile = (file: File) => {
    setUploadError(null);
    const validExtensions = ['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png', 'txt'];
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';

    if (!validExtensions.includes(fileExt)) {
      setUploadError('Formato no admitido. Por favor sube un archivo PDF, Word (.docx), JPG o PNG.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('El archivo excede el tamaño límite de 15MB.');
      return;
    }

    const detectedType = determineFileType(file.name, file.type);
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      // Extract base64 without prefix data:...;base64,
      const base64Data = result.split(',')[1] || result;
      setSelectedFile({
        name: file.name,
        size: file.size,
        type: detectedType,
        base64: base64Data,
      });
    };

    reader.onerror = () => {
      setUploadError('Error al leer el archivo. Intenta de nuevo o pega el texto directamente.');
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleLoadSample = (sample: SampleResume) => {
    setSelectedFile(null);
    setCvText(sample.text);
    setTargetRole(sample.role);
    setActiveTab('text');
  };

  const handleStartAnalysis = () => {
    if (activeTab === 'upload' && selectedFile) {
      onAnalyze({
        fileType: selectedFile.type,
        fileName: selectedFile.name,
        fileBase64: selectedFile.base64,
        targetRole: targetRole.trim() || undefined,
      });
    } else if (cvText.trim()) {
      onAnalyze({
        fileType: 'Texto',
        text: cvText.trim(),
        targetRole: targetRole.trim() || undefined,
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canSubmit = (activeTab === 'upload' && !!selectedFile) || (activeTab === 'text' && cvText.trim().length > 30);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Analizar Hoja de Vida
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Sube tu CV en PDF, Word o Imagen para auditar los 7 criterios del semáforo.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-center border border-slate-200">
          <button
            id="tab-upload-file"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Subir Archivo
          </button>
          <button
            id="tab-paste-text"
            onClick={() => setActiveTab('text')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'text'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pegar Texto
          </button>
          <button
            id="tab-sample-cvs"
            onClick={() => setActiveTab('samples')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'samples'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Ejemplos Guiados
          </button>
        </div>
      </div>

      {/* Target Role input (optional) */}
      <div className="mt-5 mb-5">
        <label htmlFor="input-target-role" className="block text-xs font-semibold text-slate-700 mb-1.5">
          Vacante o Puesto Objetivo <span className="text-slate-400 font-normal">(Opcional — mejora la precisión de palabras clave)</span>
        </label>
        <div className="relative">
          <input
            id="input-target-role"
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Ej: Desarrollador Frontend Senior, Coordinador de Marketing Digital, Contador Auditor..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Tab 1: File Upload */}
      {activeTab === 'upload' && (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.txt"
            onChange={handleFileChange}
            className="hidden"
            id="file-input-cv"
          />

          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-slate-800 bg-slate-50 scale-[1.005]'
                  : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50/60'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Haz clic para seleccionar o arrastra tu archivo aquí
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Formatos compatibles: <span className="font-semibold text-slate-700">PDF, Word (.docx), JPG, PNG</span> (Máx. 15MB)
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 shrink-0 shadow-xs">
                  <FileText className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-md">
                      {selectedFile.name}
                    </p>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                      {selectedFile.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatFileSize(selectedFile.size)} • Listo para diagnóstico
                  </p>
                </div>
              </div>

              <button
                id="btn-remove-selected-file"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-white transition-colors"
                title="Quitar archivo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Text Paste */}
      {activeTab === 'text' && (
        <div className="space-y-3">
          <textarea
            id="textarea-cv-content"
            rows={8}
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder="Pega aquí el contenido completo de tu currículum (datos personales, experiencia, educación, habilidades)..."
            className="w-full p-4 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent leading-relaxed"
            disabled={isLoading}
          />
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>{cvText.length} caracteres</span>
            {cvText.length > 0 && (
              <button
                onClick={() => setCvText('')}
                className="text-slate-500 hover:text-rose-600 transition-colors"
              >
                Limpiar texto
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Sample CVs */}
      {activeTab === 'samples' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_RESUMES.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleLoadSample(sample)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all hover:shadow-sm ${
                sample.expectedStatus === 'ROJO'
                  ? 'border-rose-200 bg-rose-50/40 hover:bg-rose-50/80'
                  : sample.expectedStatus === 'AZUL'
                  ? 'border-blue-200 bg-blue-50/40 hover:bg-blue-50/80'
                  : 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    sample.expectedStatus === 'ROJO'
                      ? 'bg-rose-100 text-rose-800'
                      : sample.expectedStatus === 'AZUL'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {sample.expectedStatus === 'ROJO' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                  {sample.expectedStatus === 'AZUL' && <AlertCircle className="w-3 h-3 text-blue-600" />}
                  {sample.expectedStatus === 'VERDE' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                  {sample.level}
                </span>
                <span className="text-xs text-slate-400 font-mono">Prueba</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{sample.name}</h4>
              <p className="text-xs text-slate-600 font-medium mb-1.5">{sample.role}</p>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                {sample.description}
              </p>
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900">
                Cargar este ejemplo <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Button */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Evaluación integral en 7 dimensiones técnicas y ATS</span>
        </div>

        <button
          id="btn-evaluate-cv"
          onClick={handleStartAnalysis}
          disabled={!canSubmit || isLoading}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
            canSubmit && !isLoading
              ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer hover:shadow-md'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analizando documento y aplicando semáforo...</span>
            </>
          ) : (
            <>
              <span>Evaluar Hoja de Vida</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
