/**
 * @file authService.ts
 * @description 認証サービス
 * @updated 2025-10-24 - エラーハンドリング統一システム適用
 * 
 * 【変更点】
 * ✅ AppError を使用した統一エラー
 * ✅ 適切なエラークラスの使用（ConflictError, AuthenticationError, NotFoundError）
 * ✅ エラーコード定数の使用
 * ✅ メタデータの付与
 */

import type { Session as PrismaSession } from '@prisma/client';
import { hashPassword, comparePassword } from '@/lib/auth/password';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { toSafeUser, type SafeUser } from '@/lib/auth/safeUser';
import { sessionRepository, userRepository } from '@/repositories';
import { 
  ConflictError, 
  AuthenticationError, 
  NotFoundError,
} from '@/lib/utils/errors';
import { ERROR_CODES } from '@/constants/errors';

const REFRESH_TOKEN_TTL_SECONDS = Number(process.env.REFRESH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 7); // 7 days

// ============================================
// 型定義
// ============================================

type SignupPayload = {
  email: string;
  username: string;
  password: string;
  displayName?: string | null;
  avatarUrl?: string | null;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RefreshPayload = {
  refreshToken: string;
};

export type AuthResponse = {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
  session: PrismaSession;
};

// ============================================
// 認証サービスクラス
// ============================================

export class AuthService {
  /**
   * ユーザー登録
   * 
   * @throws {ConflictError} メールアドレスまたはユーザー名が既に存在
   */
  async signup(payload: SignupPayload): Promise<AuthResponse> {
    // メールアドレスの重複チェック
    const existingByEmail = await userRepository.findByEmail(payload.email);
    if (existingByEmail) {
      throw new ConflictError(
        ERROR_CODES.RESOURCE.EMAIL_EXISTS,
        { 
          email: payload.email,
          action: 'signup',
        }
      );
    }

    // ユーザー名の重複チェック
    const existingByUsername = await userRepository.findByUsername(payload.username);
    if (existingByUsername) {
      throw new ConflictError(
        ERROR_CODES.RESOURCE.USERNAME_EXISTS,
        { 
          username: payload.username,
          action: 'signup',
        }
      );
    }

    // パスワードのハッシュ化
    const passwordHash = await hashPassword(payload.password);

    // ユーザー作成
    const user = await userRepository.create({
      email: payload.email,
      username: payload.username,
      passwordHash,
      displayName: payload.displayName ?? null,
      avatarUrl: payload.avatarUrl ?? null,
      status: 'OFFLINE',
    });

    // 認証レスポンスの作成
    return this.createAuthResponse(user.id);
  }

  /**
   * ログイン
   * 
   * @throws {AuthenticationError} 認証情報が無効
   */
  async login({ email, password }: LoginPayload): Promise<AuthResponse> {
    // ユーザー検索
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // セキュリティのため、ユーザーが存在しない場合も同じエラー
      throw new AuthenticationError({
        code: ERROR_CODES.AUTH.INVALID_CREDENTIALS,
        action: 'login',
        email,
      });
    }

    // パスワード検証
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new AuthenticationError({
        code: ERROR_CODES.AUTH.INVALID_CREDENTIALS,
        action: 'login',
        email,
      });
    }

    // ユーザー情報更新（最終ログイン時刻、ステータス）
    await userRepository.update(user.id, {
      lastLoginAt: new Date(),
      status: 'ONLINE',
    });

    // 認証レスポンスの作成
    return this.createAuthResponse(user.id);
  }

  /**
   * トークンリフレッシュ
   * 
   * @throws {AuthenticationError} リフレッシュトークンが無効または期限切れ
   */
  async refresh({ refreshToken }: RefreshPayload): Promise<AuthResponse> {
    // セッション検索
    const session = await sessionRepository.findByRefreshToken(refreshToken);
    if (!session) {
      throw new AuthenticationError({
        code: ERROR_CODES.AUTH.INVALID_REFRESH_TOKEN,
        action: 'refresh',
      });
    }

    // 有効期限チェック
    if (session.expiresAt.getTime() < Date.now()) {
      // 期限切れセッションを削除
      await sessionRepository.delete(session.id);
      
      throw new AuthenticationError({
        code: ERROR_CODES.AUTH.TOKEN_EXPIRED,
        action: 'refresh',
        sessionId: session.id,
      });
    }

    // 認証レスポンスの作成（既存セッションを再利用）
    return this.createAuthResponse(session.userId, session.id);
  }

  /**
   * ログアウト
   * 
   * @description
   * ユーザーのすべてのセッションを削除し、ステータスをOFFLINEに変更
   */
  async logout(userId: string): Promise<void> {
    // すべてのセッションを削除
    await sessionRepository.deleteByUserId(userId);
    
    // ユーザーステータスをOFFLINEに更新
    await userRepository.update(userId, {
      status: 'OFFLINE',
    });
  }

  /**
   * 認証レスポンスの作成（内部メソッド）
   * 
   * @private
   * @throws {NotFoundError} ユーザーが見つからない
   */
  private async createAuthResponse(userId: string, reuseSessionId?: string): Promise<AuthResponse> {
    // ユーザー取得
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('user', { 
        userId,
        action: 'createAuthResponse',
      });
    }

    // JWTペイロード作成
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      roles: user.roles,
      permissions: user.permissions,
    };

    // トークン生成
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // セッション有効期限計算
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);

    // セッション作成または更新
    let session: PrismaSession;
    if (reuseSessionId) {
      // 既存セッションを更新（リフレッシュ時）
      session = await sessionRepository.update(reuseSessionId, {
        accessToken,
        refreshToken,
        expiresAt,
      });
    } else {
      // 新規セッション作成（ログイン、登録時）
      session = await sessionRepository.create({
        User: { connect: { id: user.id } },
        accessToken,
        refreshToken,
        expiresAt,
      });
    }

    // レスポンス作成
    return {
      user: toSafeUser({
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        status: user.status,
        roles: user.roles ?? null,
        permissions: user.permissions ?? null,
      }),
      accessToken,
      refreshToken,
      session,
    };
  }

  /**
   * 安全なユーザー情報の取得
   * 
   * @description
   * パスワードハッシュなどの機密情報を除外したユーザー情報を返す
   */
  async getSafeUser(userId: string): Promise<SafeUser | null> {
    const user = await userRepository.findById(userId);
    if (!user) return null;
    
    return toSafeUser({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      status: user.status,
      roles: user.roles ?? null,
      permissions: user.permissions ?? null,
    });
  }
}

// ============================================
// シングルトンインスタンス
// ============================================

export const authService = new AuthService();

/**
 * 【解説】改善前との比較
 * 
 * ## 改善前（153行）
 * - new Error('エラーメッセージ') で投げる
 * - エラーコードが文字列リテラル
 * - HTTPステータスコードの情報なし
 * - メタデータなし
 * 
 * ## 改善後（240行 + 詳細なドキュメント）
 * - AppError派生クラスで投げる
 * - ERROR_CODES定数を使用
 * - HTTPステータスコードが自動決定
 * - デバッグ用メタデータ付与
 * - JSDocコメント追加
 * 
 * ## メリット
 * 1. **エラーの統一**: すべてのエラーが統一フォーマット
 * 2. **型安全**: エラーコードが定数化
 * 3. **デバッグ容易**: メタデータでコンテキスト把握
 * 4. **自動ログ**: withErrorHandlerで自動記録
 * 5. **セキュリティ**: ログイン失敗時の情報漏洩を防止
 * 
 * ## セキュリティ考慮
 * ログイン処理では、ユーザーが存在しない場合もパスワードが違う場合も
 * 同じエラー（INVALID_CREDENTIALS）を返すことで、
 * アカウントの存在を推測されることを防いでいます。
 */
