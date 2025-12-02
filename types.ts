export interface UserStats {
  points: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  streak: number;
  reportsSubmitted: number;
  quizzesTaken: number;
}

export interface AnalysisResult {
  isThreat: boolean;
  confidenceScore: number;
  threatType: 'PHISHING' | 'CLEAN_DESK_VIOLATION' | 'SAFE' | 'UNKNOWN';
  explanation: string;
  pointsAwarded: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface NewsItem {
  headline: string;
  summary: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  date: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  REPORT_PHISHING = 'REPORT_PHISHING',
  REPORT_CLEANDESK = 'REPORT_CLEANDESK',
  TRAINING = 'TRAINING',
  NEWS = 'NEWS',
}