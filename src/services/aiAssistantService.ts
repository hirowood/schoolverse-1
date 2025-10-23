import type { AiSummarizeInput, AiMindmapInput, AiAdviceInput } from '@/types/ai';

/**
 * AiAssistantService
 * ------------------
 * Phase 4.5 で本格実装予定。OpenAI/Claude などの LLM とやり取りする窓口になる。
 */
export class AiAssistantService {
  /** ノートを要約する (現在は未実装のためエラー) */
  async summarizeNotes(input: AiSummarizeInput) {
    void input; // 後続の実装で利用する値であることを示す
    throw new Error('AI_SUMMARY_NOT_IMPLEMENTED');
  }

  /** マインドマップを自動生成する (Phase 4.5 で実装予定) */
  async generateMindmap(input: AiMindmapInput) {
    void input;
    throw new Error('AI_MINDMAP_NOT_IMPLEMENTED');
  }

  /** 学習アドバイスを提案する (Phase 4.5 で実装予定) */
  async suggestStudyAdvice(input: AiAdviceInput) {
    void input;
    throw new Error('AI_ADVICE_NOT_IMPLEMENTED');
  }
}

export const aiAssistantService = new AiAssistantService();
