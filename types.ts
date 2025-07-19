
export enum ResearchField {
  AI = "Artificial Intelligence",
  CYBERSECURITY = "Cybersecurity",
  NETWORKING = "Networking",
}

export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  BRAINSTORMING = 'BRAINSTORMING',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

export interface AnalyzedKeyword {
  keyword: string;
  score: number;
}

export interface Paper {
  title: string;
  summary: string;
  url: string;
  authors: string[];
}

export interface SuggestedTitle {
  title: string;
  justification: string;
}
