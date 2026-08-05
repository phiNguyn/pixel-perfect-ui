/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

// Base API client
export const apiClient: AxiosInstance = axios.create({
  baseURL: "https://ophim1.com/v1/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;

export class BaseApi {
  constructor(protected baseURL: string) {}

  protected async get<T>(
    url: string,
    useBaseURL = true,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const fullUrl = useBaseURL ? `${this.baseURL}${url}` : url;
    const response = await apiClient.get(fullUrl, config);
    return response.data;
  }

  protected async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await apiClient.post(
      `${this.baseURL}${url}`,
      data,
      config,
    );
    return response.data;
  }

  protected async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await apiClient.patch(
      `${this.baseURL}${url}`,
      data,
      config,
    );
    return response.data;
  }

  protected async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await apiClient.put(`${this.baseURL}${url}`, data, config);
    return response.data;
  }

  protected async delete<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await apiClient.delete(`${this.baseURL}${url}`, config);
    return response.data;
  }
}
