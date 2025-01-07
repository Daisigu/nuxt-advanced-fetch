import type { NitroFetchOptions } from 'nitropack'
import type { FetchContext, FetchResponse } from 'ofetch'

export type IFetchOptions = NitroFetchOptions<'json'>

export interface IApiHandlerTypes {
  onRequest: FetchContext
  onRequestError: FetchContext & { error: Error }
  onResponse: FetchContext
  onResponseError: FetchContext & { response: FetchResponse<any> }
}

export type IApiHandlers = {
  [K in keyof IApiHandlerTypes]: Array<(context: IApiHandlerTypes[K]) => void>;
}

export interface IApiPlugin {
  addHandler<K extends keyof IApiHandlers>(type: K, handler: (context: IApiHandlerTypes[K]) => void): void
  removeHandler<K extends keyof IApiHandlers>(type: K, handler: (context: IApiHandlerTypes[K]) => void): void
  get<T>(url: string, params?: IFetchOptions['params'], options?: IFetchOptions): Promise<T>
  post<T>(url: string, body?: IFetchOptions['body'], options?: IFetchOptions): Promise<T>
  put<T>(url: string, body?: IFetchOptions['body'], options?: IFetchOptions): Promise<T>
  patch<T>(url: string, body?: IFetchOptions['body'], options?: IFetchOptions): Promise<T>
  delete<T>(url: string, body?: IFetchOptions['body'], options?: IFetchOptions): Promise<T>
}

declare module '#app' {
  interface NuxtApp {
    $api: IApiPlugin
  }
}
