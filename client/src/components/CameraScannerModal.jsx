import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { playBeep } from '../utils/audioChime';
import { useLanguage } from '../context/LanguageContext';

export default function CameraScannerModal({ isOpen, onClose, onScanSuccess }) {
  if (!isOpen) return null;

  const [scanError, setScanError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const html5QrCodeRef = useRef(null);
  const { t, tRole } = useLanguage();

  useEffect(() => {
    let qrInstance = null;

    const startScanner = async () => {
      try {
        setScanError(null);
        qrInstance = new Html5Qrcode('qr-reader');
        html5QrCodeRef.current = qrInstance;

        await qrInstance.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            playBeep();
            if (qrInstance) {
              qrInstance.stop().catch(() => {});
            }
            onScanSuccess(decodedText);
            onClose();
          },
          () => {}
        );
        setCameraActive(true);
      } catch (err) {
        console.warn('Camera start error / permissions not granted:', err);
        setScanError(t('cameraSearching'));
        setCameraActive(false);
      }
    };

    startScanner();

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, [onScanSuccess, onClose, t]);

  const handleSimulateScan = (id) => {
    playBeep();
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch(() => {});
    }
    onScanSuccess(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{t('cameraTitle')}</h3>
              <p className="text-xs text-slate-400">{t('cameraSub')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Container */}
        <div className="p-6 flex flex-col items-center">
          
          <div className="relative w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 flex items-center justify-center shadow-inner">
            <div id="qr-reader" className="w-full h-full" />

            {/* Viewfinder Reticle Overlay */}
            <div className="absolute inset-4 pointer-events-none border-2 border-teal-500/40 rounded-2xl flex flex-col justify-between p-2">
              <div className="flex justify-between">
                <div className="w-5 h-5 border-t-2 border-l-2 border-teal-400 rounded-tl" />
                <div className="w-5 h-5 border-t-2 border-r-2 border-teal-400 rounded-tr" />
              </div>
              
              {/* Scan Beam */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_12px_#2dd4bf] animate-scan-beam relative" />

              <div className="flex justify-between">
                <div className="w-5 h-5 border-b-2 border-l-2 border-teal-400 rounded-bl" />
                <div className="w-5 h-5 border-b-2 border-r-2 border-teal-400 rounded-br" />
              </div>
            </div>
          </div>

          {scanError && (
            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-center flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{scanError}</span>
            </div>
          )}

          {/* Quick Simulation Options */}
          <div className="w-full mt-6 pt-4 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
              {t('cameraSimulationTitle')}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSimulateScan('DUCP2024-0101')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition text-xs"
              >
                <span className="block font-bold text-purple-300">🎓 {tRole('Professor')}</span>
                <span className="text-[10px] text-slate-400 font-mono">DUCP2024-0101</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulateScan('DUC2024-0417')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition text-xs"
              >
                <span className="block font-bold text-blue-300">👩‍🎓 {tRole('Student')}</span>
                <span className="text-[10px] text-slate-400 font-mono">DUC2024-0417</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulateScan(`NEW-${Math.floor(1000 + Math.random() * 9000)}`)}
                className="p-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-left transition text-xs"
              >
                <span className="block font-bold text-teal-300">✨ {t('btnRegister')}</span>
                <span className="text-[10px] text-teal-400/80 font-mono">{t('unregisteredBadge')}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
