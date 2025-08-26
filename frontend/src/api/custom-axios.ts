import axios from "axios";

export const customAxios = async <T>({
  url,
  method = "GET",
  ...rest
}: any): Promise<T> => {
  const response = await axios.request<T>({
    baseURL: "http://192.168.11.11/api",
    url,
    method,
    ...rest,
  });
  return response.data;
};
