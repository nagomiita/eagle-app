import axios from "axios";

export const customAxios = async <T>({
  url,
  method = "GET",
  ...rest
}: any): Promise<T> => {
  const response = await axios.request<T>({
    baseURL: "http://localhost:8000/api",
    url,
    method,
    ...rest,
  });
  return response.data;
};
