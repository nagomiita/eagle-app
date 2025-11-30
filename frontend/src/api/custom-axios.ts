import axios from "axios";

export const getApiBaseUrl = (): string => {
  // Vite の環境変数のみを使用します（`VITE_API_BASE_URL`）。
  // 見つからない場合は空文字を返し、Axios は相対URLを使用します。
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return import.meta.env?.VITE_API_BASE_URL ?? "";
};

export const customAxios = async <T>({ url, method = "GET", ...rest }: any): Promise<T> => {
  const baseURL = getApiBaseUrl();
  const response = await axios.request<T>({
    baseURL,
    url,
    method,
    ...rest,
  });
  return response.data;
};
