/**
 * AI 要約・思考整理で利用する入力型。
 */
export type AiSummarizeInput = {
  noteIds: string[];
  summaryLevel: 'short' | 'normal' | 'detailed';
};

export type AiMindmapInput = {
  sourceText: string;
  maxDepth?: number;
};

export type AiAdviceInput = {
  studentId: string;
  recentNotes: string[];
  weakSkills?: string[];
};
