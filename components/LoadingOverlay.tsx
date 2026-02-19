import React from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface LoadingOverlayProps {
  language: Language;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ language }) => {
  const t = translations[language];

  return (
    <div className="fixed inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 transition-colors duration-300">
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-white dark:bg-slate-800 p-4 rounded-full shadow-lg">
                <i className="fas fa-brain text-indigo-600 dark:text-indigo-400 text-3xl animate-pulse"></i>
            </div>
        </div>
        
        <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-200 mb-2">{t.loadingTitle}</h3>
        
        <div className="space-y-2 w-full max-w-xs">
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-slate-400">
                <i className="fas fa-circle-notch animate-spin text-indigo-500"></i>
                <span>{t.loadingStep1}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-slate-400 delay-150">
                <i className="fas fa-circle-notch animate-spin text-indigo-500" style={{animationDelay: '0.2s'}}></i>
                <span>{t.loadingStep2}</span>
            </div>
             <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-slate-400 delay-300">
                <i className="fas fa-circle-notch animate-spin text-indigo-500" style={{animationDelay: '0.4s'}}></i>
                <span>{t.loadingStep3}</span>
            </div>
        </div>
    </div>
  );
};

export default LoadingOverlay;