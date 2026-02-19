import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult, AppTab, HistoryItem, Language } from './types';
import { analyzeDocument } from './services/geminiService';
import LoadingOverlay from './components/LoadingOverlay';
import ResultDisplay from './components/ResultDisplay';
import { translations, getDir } from './utils/translations';

const App: React.FC = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.HOME);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('ar');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[language];

  // Initialize Theme, History and Language
  useEffect(() => {
    // History
    const savedHistory = JSON.parse(localStorage.getItem('midad_history') || '[]');
    setHistoryItems(savedHistory);

    // Theme
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }

    // Language
    const savedLang = (localStorage.getItem('midad_language') as Language) || 'ar';
    setLanguage(savedLang);
    document.documentElement.dir = getDir(savedLang);
    document.documentElement.lang = savedLang;
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
        setIsDarkMode(false);
    } else {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
        setIsDarkMode(true);
    }
  };

  const cycleLanguage = () => {
    let newLang: Language = 'ar';
    if (language === 'ar') newLang = 'en';
    else if (language === 'en') newLang = 'fr';
    else newLang = 'ar';

    setLanguage(newLang);
    localStorage.setItem('midad_language', newLang);
    document.documentElement.dir = getDir(newLang);
    document.documentElement.lang = newLang;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset state
    setResult(null);
    setError(null);
    setLoading(true);
    setShowHistory(false);

    try {
      const data = await analyzeDocument(file, language);
      
      // Auto-save to history
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        title: data.quiz_data?.title || file.name.replace(/\.[^/.]+$/, ""),
        data: data
      };
      
      const savedHistory = JSON.parse(localStorage.getItem('midad_history') || '[]');
      const updatedHistory = [newItem, ...savedHistory].slice(0, 50); // Keep last 50 items
      localStorage.setItem('midad_history', JSON.stringify(updatedHistory));
      setHistoryItems(updatedHistory);
      
      setResult(data);
    } catch (err: any) {
      setError(t.errorGeneric);
      console.error(err);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleShowHistory = () => {
    setShowHistory(true);
    setResult(null);
    setError(null);
  };

  const handleHistoryItemSelect = (item: HistoryItem) => {
    setResult(item.data);
    setShowHistory(false);
    setActiveTab(AppTab.HOME);
  };

  const handleDeleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updatedHistory = historyItems.filter(item => item.id !== id);
    setHistoryItems(updatedHistory);
    localStorage.setItem('midad_history', JSON.stringify(updatedHistory));
  };

  const handleBack = () => {
    setResult(null);
    setError(null);
    setShowHistory(false);
    setActiveTab(AppTab.HOME);
  };

  return (
    // Main Container: Full width, background fill
    <div className="w-full bg-slate-50 dark:bg-slate-950 min-h-screen relative flex flex-col transition-colors duration-300">
      
      {/* Header */}
      <header className="bg-indigo-700 dark:bg-indigo-900 text-white p-5 md:p-8 rounded-b-[2.5rem] lg:rounded-b-[4rem] shadow-xl relative z-10 overflow-hidden shrink-0 transition-all duration-300">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 md:w-48 md:h-48 bg-indigo-500/30 rounded-full blur-xl -ml-5 -mb-5 pointer-events-none"></div>

        {/* Header Content Container */}
        <div className="max-w-7xl mx-auto w-full relative z-10">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    {(result || showHistory) && (
                        <button 
                            onClick={handleBack}
                            className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all backdrop-blur-md border border-white/10 active:scale-95 ${language === 'ar' ? 'rotate-0' : 'rotate-180'}`}
                            aria-label={t.backBtn}
                        >
                            <i className="fas fa-arrow-right text-indigo-100"></i>
                        </button>
                    )}
                    <h1 className="text-2xl md:text-4xl font-extrabold tracking-wide flex items-center gap-3">
                        <i className="fas fa-graduation-cap text-indigo-300"></i>
                        {t.appTitle}
                    </h1>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                         onClick={cycleLanguage}
                         className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md hover:bg-white/30 transition-colors font-bold text-sm border border-white/10"
                         title="Change Language"
                    >
                        {language.toUpperCase()}
                    </button>
                    <button 
                        onClick={toggleTheme}
                        className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md hover:bg-white/30 transition-colors"
                        aria-label="Toggle Dark Mode"
                    >
                        {isDarkMode ? <i className="fas fa-sun text-amber-300"></i> : <i className="fas fa-moon text-indigo-100"></i>}
                    </button>
                </div>
            </div>
            
            <div className="flex flex-col items-start lg:items-center lg:text-center w-full">
                {!result && !showHistory ? (
                    <p className="text-indigo-100 text-sm md:text-xl opacity-90 leading-relaxed max-w-2xl relative z-10 animate-fade-in">
                      {t.subHeader} <span className="font-bold text-white border-b-2 border-indigo-400 pb-0.5 mx-1">{t.subHeaderHighlight1}</span> & <span className="font-bold text-white border-b-2 border-indigo-400 pb-0.5 mx-1">{t.subHeaderHighlight2}</span>.
                    </p>
                ) : showHistory ? (
                    <p className="text-indigo-100 text-sm md:text-lg opacity-90 relative z-10 animate-fade-in flex items-center gap-2">
                        <i className="fas fa-history text-amber-400"></i>
                        {t.historyTitle}
                    </p>
                ) : (
                    <p className="text-indigo-100 text-sm md:text-lg opacity-90 relative z-10 animate-fade-in flex items-center gap-2">
                        <i className="fas fa-check-circle text-emerald-400"></i>
                        {t.successMessage}
                    </p>
                )}

                {/* Action Buttons */}
                {!result && !showHistory && (
                    <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-lg lg:max-w-2xl relative z-10 animate-fade-in">
                        <button 
                            onClick={triggerFileInput} 
                            className="bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 hover:shadow-2xl transition-all p-4 md:p-8 rounded-2xl md:rounded-3xl flex flex-col items-center gap-4 group"
                        >
                            <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <i className="fas fa-file-powerpoint text-xl md:text-3xl"></i>
                            </div>
                            <span className="font-bold text-sm md:text-lg">{t.uploadBtn}</span>
                        </button>
                        <button 
                            onClick={handleShowHistory} 
                            className="bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 hover:shadow-2xl transition-all p-4 md:p-8 rounded-2xl md:rounded-3xl flex flex-col items-center gap-4 group"
                        >
                            <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-white text-amber-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <i className="fas fa-history text-xl md:text-3xl"></i>
                            </div>
                            <span className="font-bold text-sm md:text-lg">{t.historyBtn}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 md:px-8 -mt-6 relative z-0 pt-10 pb-24 flex-1 w-full max-w-7xl mx-auto">
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*,.pdf"
        />

        {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 p-6 rounded-xl text-center mb-6 flex flex-col items-center gap-3 animate-fade-in max-w-2xl mx-auto">
                <i className="fas fa-exclamation-triangle text-3xl"></i>
                <p className="font-medium text-lg">{error}</p>
                <button onClick={() => setError(null)} className="px-6 py-2 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 rounded-lg text-sm font-bold text-red-700 dark:text-red-200 transition-colors mt-2">{t.tryAgain}</button>
            </div>
        )}

        {!result && !showHistory && !loading && !error && (
            <div className="text-center py-12 lg:py-20 opacity-60 animate-fade-in">
                <div className="inline-block p-6 rounded-full bg-indigo-50 dark:bg-slate-800 mb-6 animate-bounce">
                    <i className="fas fa-cloud-upload-alt text-4xl md:text-6xl text-indigo-400 dark:text-indigo-300"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-700 dark:text-slate-200 mb-3">{t.readyTitle}</h3>
                <p className="text-lg text-gray-500 dark:text-slate-400 max-w-md mx-auto">{t.readyDesc}</p>
            </div>
        )}

        {showHistory && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                {historyItems.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-gray-400 dark:text-slate-500">
                        <i className="fas fa-history text-4xl mb-4 opacity-30"></i>
                        <p className="text-lg font-medium">{t.emptyHistoryTitle}</p>
                        <p className="text-sm mt-2 max-w-xs mx-auto">{t.emptyHistoryDesc}</p>
                    </div>
                ) : (
                    historyItems.map((item) => (
                        <div 
                            key={item.id} 
                            onClick={() => handleHistoryItemSelect(item)}
                            className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex justify-between items-center cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all group active:scale-[0.99]"
                        >
                            <div className="flex items-center gap-4 overflow-hidden">
                                <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-300 flex items-center justify-center font-bold text-xl group-hover:bg-indigo-500 group-hover:text-white transition-colors shrink-0">
                                    <i className="fas fa-book-open"></i>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-gray-800 dark:text-slate-100 text-base line-clamp-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">{item.title}</h3>
                                    <p className="text-sm text-gray-400 dark:text-slate-400 mt-1 font-medium">
                                        <i className="far fa-clock ml-1"></i>
                                        {new Date(item.timestamp).toLocaleDateString(language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-300 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 transition-colors z-10 shrink-0"
                            >
                                <i className="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    ))
                )}
            </div>
        )}

        {result && !showHistory && (
            <ResultDisplay data={result} activeTab={activeTab} language={language} />
        )}
      </main>

      {/* Bottom Navigation */}
      {result && !showHistory && (
        <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-none">
            <nav className="pointer-events-auto w-full md:w-auto md:min-w-[400px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t md:border border-gray-100 dark:border-slate-800 md:border-gray-200 px-6 py-3 md:py-4 flex justify-around items-center shadow-[0_-5px_20px_rgba(0,0,0,0.05)] md:shadow-2xl md:rounded-full md:mb-6 pb-safe transition-all">
                <button 
                    onClick={() => setActiveTab(AppTab.HOME)}
                    className={`flex flex-col items-center gap-1 transition-colors px-6 ${activeTab === AppTab.HOME ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'}`}
                >
                    <i className={`fas fa-book-reader text-xl md:text-2xl ${activeTab === AppTab.HOME ? 'animate-pulse' : ''}`}></i>
                    <span className="text-[10px] md:text-xs font-bold">{t.tabSummary}</span>
                </button>
                
                <div className="w-px h-8 bg-gray-200 dark:bg-slate-700 hidden md:block"></div>

                <button 
                    onClick={() => setActiveTab(AppTab.QUIZ)}
                    className={`flex flex-col items-center gap-1 transition-colors px-6 ${activeTab === AppTab.QUIZ ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'}`}
                >
                    <i className="fas fa-brain text-xl md:text-2xl"></i>
                    <span className="text-[10px] md:text-xs font-bold">{t.tabQuiz}</span>
                </button>
            </nav>
        </div>
      )}

      {loading && <LoadingOverlay language={language} />}
    </div>
  );
};

export default App;