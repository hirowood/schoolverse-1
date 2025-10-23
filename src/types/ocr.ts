/**
 * OCR 処理で利用する基本的な入力/出力型。
 */
export type OcrJobInput = {
  assetPath: string; // Supabase Storage 等に保存された元画像のパス
  languageHints?: string[]; // 優先言語 (ja, en など)
};

export type OcrResult = {
  text: string;
  confidence?: number; // ベンダーが返す確信度 (任意)
  rawResponse?: unknown; // デバッグ用に生レスポンスを保持
};
