import type { NitroFetchOptions } from 'nitropack'
import type { FetchContext, FetchResponse } from 'ofetch'

export type IFetchOptions = NitroFetchOptions<'json'>

export interface IApiHandlerTypes {
  onRequest: FetchContext
  onRequestError: FetchContext & { error: Error }
  onResponse: FetchContext
  onResponseError: FetchContext & { response: FetchResponse<unknown> }
}

export type IApiHandlers = {
  [K in keyof IApiHandlerTypes]: Array<(context: IApiHandlerTypes[K]) => void>
}

export interface IApiPlugin {
  <T>(url: string, options?: IFetchOptions): Promise<T>
  addHandler<K extends keyof IApiHandlers>(
    type: K,
    handler: (context: IApiHandlerTypes[K]) => void
  ): void
  removeHandler<K extends keyof IApiHandlers>(
    type: K,
    handler: (context: IApiHandlerTypes[K]) => void
  ): void
  create(...args: Parameters<typeof $fetch['create']>): IApiPlugin
}

declare module '#app' {
  interface NuxtApp {
    $api: IApiPlugin
  }
}
