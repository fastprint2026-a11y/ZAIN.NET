import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  RotateCw, 
  Check, 
  ArrowLeft,
  Maximize2,
  Minimize2,
  Sparkles,
  Crown
} from 'lucide-react';
import { ToolItem, UserRole } from '../types';

interface ToolViewerModalProps {
  tool: ToolItem | null;
  quota?: number;
  resellerTrialRemaining?: number;
  userRole?: UserRole;
  onClose: () => void;
  onFinishCreation?: (tool: ToolItem) => void;
}

export const ToolViewerModal: React.FC<ToolViewerModalProps> = ({ 
  tool, 
  quota = 1,
  resellerTrialRemaining = 0,
  userRole = 'public',
  onClose,
  onFinishCreation
}) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tool) {
      setIsLoading(true);
      setShowConfirmFinish(false);
      // Add hash for history back button navigation
      window.history.pushState({ toolModalOpen: true }, '', '#workspace');
      document.body.style.overflow = 'hidden';

      const handlePopState = () => {
        onClose();
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !document.fullscreenElement) {
          onClose();
        }
      };

      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };

      window.addEventListener('popstate', handlePopState);
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('fullscreenchange', handleFullscreenChange);

      return () => {
        document.body.style.overflow = 'auto';
        window.removeEventListener('popstate', handlePopState);
        window.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
      };
    }
  }, [tool, onClose]);

  if (!tool) return null;

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen request failed:', e);
    }
  };

  const handleCompleteUsage = () => {
    if (onFinishCreation) {
      onFinishCreation(tool);
    }
    onClose();
  };

  const isAdmin = userRole === 'admin';
  const isReseller = userRole === 'reseller';
  const isUsingResellerTrial = isReseller && resellerTrialRemaining > 0;

  return (
    <div 
      ref={containerRef}
      id="module-workspace-container"
      className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in fade-in duration-200"
    >
      {/* Top Workspace Header Bar */}
      <header className="h-14 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between gap-2 shrink-0 z-20">
        
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            id="close-workspace-btn"
            onClick={onClose}
            aria-label="Kembali ke menu"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-slate-700/60"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali</span>
          </button>

          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-blue-500/20 shrink-0 hidden xs:flex">
            Z
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white truncate flex items-center gap-2">
              <span className="truncate">{tool.title}</span>
              {isAdmin ? (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 shrink-0">
                  <Crown className="w-2.5 h-2.5 text-amber-400" />
                  <span>Admin Bebas Akses</span>
                </span>
              ) : isUsingResellerTrial ? (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 shrink-0 animate-pulse">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                  <span>Free Trial Reseller ({resellerTrialRemaining}/3x)</span>
                </span>
              ) : (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Sesi Aktif</span>
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-400 truncate hidden md:block">
              {tool.description || 'Modul Pemrosesan & Penyusunan Dokumen Akademik'}
            </p>
          </div>
        </div>

        {/* Right: Integrated Workspace Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Finish & Consume Quota button (Only for non-admins) */}
          {onFinishCreation && !isAdmin && (
            <button
              onClick={() => setShowConfirmFinish(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isUsingResellerTrial ? 'Selesai & Pakai Trial' : 'Selesai & Pakai Kuota'}
              </span>
              <span className="sm:hidden">Selesai</span>
            </button>
          )}

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700/60 hidden sm:flex items-center gap-1 text-xs"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden md:inline">{isFullscreen ? 'Kecilkan' : 'Layar Penuh'}</span>
          </button>

          {/* Reload internal view button */}
          <button
            onClick={handleReload}
            title="Segarkan tampilan modul"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700/60"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Tutup modul"
            className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors cursor-pointer border border-slate-700/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Seamless Workspace Container */}
      <div className="flex-1 relative w-full h-full bg-slate-950 overflow-hidden">
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-10 transition-opacity">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/25 animate-pulse mb-4">
              <span className="text-2xl font-black text-white">Z</span>
            </div>
            <p className="text-sm font-bold text-slate-200">Menyiapkan {tool.title}...</p>
            <p className="text-xs text-slate-400 mt-1">Memuat antarmuka kerja sistem ZAIN.NET</p>
          </div>
        )}

        {/* Embedded Module Content */}
        <iframe
          key={iframeKey}
          id="module-embed-view"
          src={tool.url}
          title={tool.title}
          className="w-full h-full border-0 bg-white"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />

        {/* Confirm Finish Creation Modal */}
        {showConfirmFinish && (
          <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Selesaikan Sesi Pembuatan?</h3>
                  <p className="text-xs text-slate-400">Pastikan Anda sudah mengunduh dokumen hasil (.docx / .pdf).</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <p className="font-semibold text-amber-300">
                  {isUsingResellerTrial ? 'Pemberitahuan Free Trial Reseller:' : 'Pemberitahuan Kuota:'}
                </p>
                <p>
                  {isUsingResellerTrial ? (
                    <>
                      1 sesi <strong>Free Trial Reseller</strong> ({resellerTrialRemaining}/3x tersisa) untuk modul <strong>{tool.title}</strong> akan digunakan. Anda dapat kembali ke menu utama setelah menyelesaikan sesi ini.
                    </>
                  ) : (
                    <>
                      1 kuota pembuatan untuk <strong>{tool.title}</strong> akan digunakan. Anda dapat kembali ke menu utama setelah menyelesaikan sesi ini.
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmFinish(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Lanjut Mengedit
                </button>
                <button
                  type="button"
                  onClick={handleCompleteUsage}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  Ya, Selesai & Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
