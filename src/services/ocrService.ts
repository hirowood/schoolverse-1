import type { OcrJobInput, OcrResult } from '@/types/ocr';

/**
 * OcrService
 * ----------
 * Phase 4.5 で本実装予定。ここではインターフェースとコメントのみを整備しておく。
 * - Google Vision / tesseract どちらを使うかは環境変数で切り替える想定
 * - 追加の前処理（ノイズ除去等）は別ヘルパーへ委譲する予定
 */
export class OcrService {
  /** 画像パスを受け取り、文字認識を実行する (現段階では未実装) */
  async extractText(job: OcrJobInput): Promise<OcrResult> {
    void job; // 未使用警告を回避しつつ、後続で利用予定であることを明示
    throw new Error('OCR_NOT_IMPLEMENTED');
  }

  /** 認識結果テキストを整形する (将来的に句読点補正や段落復元を追加) */
  postProcess(text: string): string {
    return text;
  }
}

export const ocrService = new OcrService();
