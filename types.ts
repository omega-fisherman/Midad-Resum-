export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

export interface Metadata {
  word_count: number;
  language: string;
  complexity_level: string;
}

export interface AnalysisResult {
  action_performed: string;
  document_summary: string;
  quiz_data?: QuizData;
  metadata?: Metadata;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  title: string;
  data: AnalysisResult;
}

export enum AppTab {
  HOME = 'HOME',
  QUIZ = 'QUIZ',
}

export type FileType = 'pdf' | 'image';

export type Language = 'ar' | 'en' | 'fr';