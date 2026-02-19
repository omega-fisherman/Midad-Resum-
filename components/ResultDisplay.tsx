import React, { useState } from 'react';
import { AnalysisResult, AppTab, Language } from '../types';
import { translations } from '../utils/translations';

interface ResultDisplayProps {
  data: AnalysisResult;
  activeTab: AppTab;
  language: Language;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ data, activeTab, language }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<{[key: number]: string}>({});
  const [showExplanation, setShowExplanation] = useState<{[key: number]: boolean}>({});
  const t = translations[language];

  const handleOptionSelect = (qId: number, option: string) => {
    setSelectedAnswer(prev => ({ ...prev, [qId]: option }));
    setShowExplanation(prev => ({ ...prev, [qId]: true }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.HOME:
        return (
          <div className="space-y-6 animate-fade-in pb-8">
            {/* Summary Card */}
            <div className="group bg-gradient-to-br from-white via-indigo-50/30 to-white dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-3xl shadow-lg border border-indigo-100/50 dark:border-slate-700 p-6 md:p-9 relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-indigo-200 dark:hover:border-slate-600 hover:-translate-y-1">
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/20 dark:bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-100/20 dark:bg-blue-500/10 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
              
              <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none transform group-hover:rotate-6 transition-transform duration-300">
                      <i className="fas fa-highlighter text-xl md:text-2xl"></i>
                    </div>
                    <div>
                        <h3 className="font-extrabold text-xl md:text-2xl text-gray-800 dark:text-slate-100 tracking-tight">{t.summaryTitle}</h3>
                        <p className="text-sm text-indigo-400 dark:text-indigo-300 font-medium">{t.summarySubtitle}</p>
                    </div>
                  </div>
                  
                  <div className="prose prose-sm md:prose-lg max-w-none text-gray-600 dark:text-slate-300 leading-relaxed text-justify whitespace-pre-line font-medium marker:text-indigo-500 dark:marker:text-indigo-400">
                    {data.document_summary}
                  </div>
                  
                  {data.metadata && (
                    <div className="mt-8 pt-6 border-t border-indigo-50 dark:border-slate-700 flex flex-wrap gap-3">
                      <span className="px-4 py-2 bg-white/80 dark:bg-slate-700/50 backdrop-blur-sm text-indigo-700 dark:text-indigo-300 rounded-xl text-xs md:text-sm font-bold border border-indigo-100 dark:border-slate-600 flex items-center gap-2 shadow-sm">
                        <i className="fas fa-layer-group text-indigo-400 dark:text-indigo-300"></i> {t.level}: {data.metadata.complexity_level}
                      </span>
                      <span className="px-4 py-2 bg-white/80 dark:bg-slate-700/50 backdrop-blur-sm text-slate-600 dark:text-slate-300 rounded-xl text-xs md:text-sm font-medium border border-slate-100 dark:border-slate-600 flex items-center gap-2 shadow-sm">
                        <i className="fas fa-file-word text-slate-400"></i> {data.metadata.word_count} {t.words}
                      </span>
                    </div>
                  )}
              </div>
            </div>
          </div>
        );

      case AppTab.QUIZ:
        return (
          <div className="space-y-6 animate-fade-in pb-4">
             {data.quiz_data && data.quiz_data.questions.length > 0 ? (
                 <>
                    {/* Quiz Header */}
                    <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white p-5 md:p-8 rounded-3xl shadow-xl shadow-indigo-900/10 relative overflow-hidden transform transition-transform hover:scale-[1.01]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/30 rounded-full blur-2xl -ml-8 -mb-8"></div>
                        <i className="fas fa-stopwatch absolute -bottom-4 -left-4 text-9xl text-indigo-500 opacity-20 transform rotate-12"></i>
                        
                        <div className="relative z-10">
                            <h2 className="text-xl md:text-3xl font-extrabold mb-2 md:mb-3">{data.quiz_data.title || t.quizHeaderTitle}</h2>
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/30 border border-indigo-400/30 text-indigo-100 text-xs md:text-sm backdrop-blur-md">
                                    <i className="fas fa-list-ol"></i>
                                    {data.quiz_data.questions.length} {t.questionsCount}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/30 border border-indigo-400/30 text-indigo-100 text-xs md:text-sm backdrop-blur-md">
                                    <i className="fas fa-clock"></i>
                                    10 {t.minutesCount}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Questions Wrapper: Single Card Container on Mobile, Grid on Desktop */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100/80 dark:border-slate-700 overflow-hidden md:bg-transparent md:dark:bg-transparent md:shadow-none md:border-0">
                        
                        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-6">
                            {data.quiz_data.questions.map((q, index) => {
                                const isAnswered = !!selectedAnswer[q.id];
                                
                                // Wrapper Class: List item on mobile (border-b), Card on Desktop
                                const wrapperClass = "flex flex-col border-b border-gray-100 dark:border-slate-700 last:border-0 md:border md:rounded-2xl md:bg-white md:dark:bg-slate-800 md:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] md:hover:shadow-lg md:transition-all";

                                return (
                                    <div key={q.id} className={wrapperClass}>
                                        
                                        {/* Combined Content Container */}
                                        <div className="p-4 md:p-8">
                                            {/* Header + Question */}
                                            <div className="mb-3 md:mb-6">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-2.5 py-0.5 rounded-lg text-[10px] md:text-xs font-bold border border-indigo-200 dark:border-indigo-800/50">
                                                        {t.questionLabel} {index + 1}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-gray-800 dark:text-slate-100 text-base md:text-xl leading-snug">{q.question}</h4>
                                            </div>
                                            
                                            {/* Options Grid */}
                                            <div className="space-y-2 md:space-y-4">
                                                {q.options.map((opt, idx) => {
                                                    let btnClass = `w-full ${language === 'ar' ? 'text-right' : 'text-left'} p-3 md:p-5 rounded-xl md:rounded-2xl border transition-all duration-200 flex justify-between items-center text-sm md:text-lg relative overflow-hidden `;
                                                    
                                                    if (isAnswered) {
                                                        if (opt === q.correct_answer) {
                                                            btnClass += "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300 font-bold";
                                                        } else if (opt === selectedAnswer[q.id]) {
                                                            btnClass += "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300 font-medium";
                                                        } else {
                                                            btnClass += "bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-400 dark:text-slate-500 opacity-60";
                                                        }
                                                    } else {
                                                        btnClass += "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 active:bg-indigo-50";
                                                    }

                                                    return (
                                                        <button 
                                                            key={idx} 
                                                            onClick={() => !isAnswered && handleOptionSelect(q.id, opt)}
                                                            className={btnClass}
                                                            disabled={isAnswered}
                                                        >
                                                            <span className="leading-snug relative z-10">{opt}</span>
                                                            {isAnswered && opt === q.correct_answer && <i className="fas fa-check-circle text-green-500 dark:text-green-400 text-lg md:text-2xl animate-bounce-short"></i>}
                                                            {isAnswered && opt === selectedAnswer[q.id] && opt !== q.correct_answer && <i className="fas fa-times-circle text-red-500 dark:text-red-400 text-lg md:text-2xl animate-shake"></i>}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                        
                                        {/* Explanation */}
                                        {showExplanation[q.id] && (
                                            <div className="bg-amber-50/50 dark:bg-amber-900/10 p-4 md:p-8 border-t border-amber-100 dark:border-amber-900/30 animate-slide-down mx-0 md:-mx-px md:-mb-px md:rounded-b-2xl">
                                                <div className="flex gap-3">
                                                    <i className="fas fa-lightbulb text-amber-500 mt-1"></i>
                                                    <div>
                                                        <p className="font-bold text-amber-800 dark:text-amber-400 text-xs mb-1">
                                                            {t.academicExplanation}
                                                        </p>
                                                        <p className="text-amber-900 dark:text-amber-200 text-sm md:text-base leading-relaxed">{q.explanation}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                 </>
             ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="bg-gray-50 dark:bg-slate-700 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 dark:text-slate-500">
                        <i className="fas fa-clipboard-check text-5xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-500 dark:text-slate-400 mb-2">{t.noQuestionsTitle}</h3>
                    <p className="text-gray-400 dark:text-slate-500">{t.noQuestionsDesc}</p>
                </div>
             )}
          </div>
        );
    }
  };

  return <div>{renderContent()}</div>;
};

export default ResultDisplay;