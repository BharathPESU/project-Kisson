export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export type View = 'dashboard' | 'diagnose' | 'chat';

export interface DiagnosisResult {
    disease: string;
    description: string;
    remedy: string;
}
