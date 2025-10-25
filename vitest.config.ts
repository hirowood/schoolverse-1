import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["tests/setup/vitest.setup.ts"],
    exclude: ["**/tests/playwright/**"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}", "src/**/*.{test,spec}.{ts,tsx}"],
    
    // カバレッジ設定
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      reporter: [
        "text",           // コンソール出力
        "text-summary",   // サマリー出力
        "html",           // HTMLレポート
        "lcov",           // lcov形式（Codecov用）
        "json",           // JSON形式
        "json-summary",   // JSONサマリー
      ],
      
      // カバレッジ対象ファイル
      include: [
        "src/app/api/**/*.ts",
        "src/lib/**/*.ts",
        "src/services/**/*.ts",
        "src/repositories/**/*.ts",
      ],
      
      // カバレッジ除外ファイル
      exclude: [
        "**/*.d.ts",
        "**/*.config.*",
        "**/node_modules/**",
        "**/dist/**",
        "**/.next/**",
        "**/tests/**",
        "**/coverage/**",
        "src/app/**/layout.tsx",
        "src/app/**/page.tsx",
        "src/components/**", // コンポーネントは別途テスト
      ],
      
      // カバレッジ閾値（90%目標）
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
      
      // カバレッジが閾値を下回った場合の動作
      // CI環境では失敗させる
      checkCoverage: process.env.CI === 'true',
    },
    
    // テストタイムアウト設定
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // 並列実行設定
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true,
      },
    },
    
    // ネイティブモジュールの処理
    server: {
      deps: {
        inline: [
          // fabricとcanvasをインライン化してモックを適用
          'fabric',
          'canvas',
        ],
      },
    },
    
    // 外部依存関係を除外（ネイティブモジュール）
    deps: {
      optimizer: {
        web: {
          exclude: ['canvas'],
        },
      },
    },
  },
  resolve: {
    alias: {
      // @は従来通りsrcを指す
      "@": resolve(__dirname, "src"),
      // @testsでtestsディレクトリを指す（@/testsではなく）
      "@tests": resolve(__dirname, "tests"),
      // 注: canvasとfabricのvi.mock()でモック化される（vitest.setup.tsを参照）
    },
  },
});
