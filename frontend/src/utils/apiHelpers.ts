import axios from "axios";

interface HandleApiRequestOptions<T> {
  apiCall: () => Promise<T>;
  errorContext: string;
  onSuccess?: (result: T) => void | Promise<void>;
  onError?: (error: unknown) => void;
}

/**
 * 汎用的なAPI呼び出しヘルパー関数
 * エラーハンドリングを含む非同期処理をラップします
 *
 * @param options - API呼び出しのオプション
 * @param options.apiCall - 実行するAPI呼び出し関数
 * @param options.errorContext - エラーメッセージのコンテキスト（例: "フォルダ作成中"）
 * @param options.onSuccess - API呼び出し成功時のコールバック（オプション）
 * @param options.onError - API呼び出し失敗時のカスタムエラーハンドリング（オプション）
 */
export async function handleApiRequest<T>({
  apiCall,
  errorContext,
  onSuccess,
  onError,
}: HandleApiRequestOptions<T>): Promise<T | null> {
  try {
    const result = await apiCall();
    if (onSuccess) {
      await onSuccess(result);
    }
    return result;
  } catch (error) {
    console.error(`${errorContext}にエラーが発生しました:`, error);
    // Axiosエラーの場合、詳細メッセージを取得
    let errorMessage = `${errorContext}にエラーが発生しました`;
    if (axios.isAxiosError(error) && error.response?.data?.detail) {
      errorMessage += `\n${error.response.data.detail}`;
    }
    // カスタムエラーハンドリングがあれば実行、なければデフォルトのアラート表示
    if (onError) {
      onError(error);
    } else {
      alert(errorMessage);
    }
    return null;
  }
}

/**
 * エラーメッセージを抽出するヘルパー関数
 *
 * @param error - エラーオブジェクト
 * @param defaultMessage - デフォルトのエラーメッセージ
 * @returns 抽出されたエラーメッセージ
 */
export function extractErrorMessage(
  error: unknown,
  defaultMessage: string = "エラーが発生しました"
): string {
  if (axios.isAxiosError(error)) {
    // サーバーからの詳細メッセージを取得
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }
    // HTTPステータスメッセージを返す
    if (error.response?.statusText) {
      return `${defaultMessage}: ${error.response.statusText}`;
    }
  }

  // エラーオブジェクトにmessageプロパティがある場合
  if (error instanceof Error) {
    return `${defaultMessage}: ${error.message}`;
  }

  return defaultMessage;
}
