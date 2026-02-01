import type { NitroFetchOptions } from 'nitropack'
import type { FetchContext, FetchResponse } from 'ofetch'

export type FetchOptions = NitroFetchOptions<'json'>

export interface HandlerContextTypes {
  onRequest: FetchContext
  onRequestError: FetchContext & { error: Error }
  onResponse: FetchContext
  onResponseError: FetchContext & { response: FetchResponse<unknown> }
}

export type LocalHandlerEntry<K extends keyof HandlerContextTypes> = {
  handler: (context: HandlerContextTypes[K]) => void
  order: number
}

/** Options when adding a global handler via addHandler() */
export interface GlobalHandlerOptions {
  /** Lower runs first. Default: 0 */
  order?: number
}

/** Entry for a global handler (internal storage) */
export interface GlobalHandlerEntry<K extends keyof HandlerContextTypes> {
  handler: (context: HandlerContextTypes[K]) => void
  order: number
}

export type ApiHandlers = {
  [K in keyof HandlerContextTypes]: GlobalHandlerEntry<K>[]
}

/** Options for a per-call (local) handler passed in $api(url, { onRequest: ... }) */
export interface LocalHandlerOptions<K extends keyof HandlerContextTypes> {
  handler: (context: HandlerContextTypes[K]) => void
  /** Lower runs first. Default: 0. Globals run first, then locals (each group sorted by order). */
  order?: number
}

export type LocalHandlerOption<K extends keyof HandlerContextTypes> =
  | ((context: HandlerContextTypes[K]) => void)
  | LocalHandlerOptions<K>

/** Fetch options for $api() — hooks accept a function, options object, or array of either */
export type ApiFetchOptions = Omit<FetchOptions, 'onRequest' | 'onRequestError' | 'onResponse' | 'onResponseError'> & {
  onRequest?: LocalHandlerOption<'onRequest'> | LocalHandlerOption<'onRequest'>[]
  onRequestError?: LocalHandlerOption<'onRequestError'> | LocalHandlerOption<'onRequestError'>[]
  onResponse?: LocalHandlerOption<'onResponse'> | LocalHandlerOption<'onResponse'>[]
  onResponseError?: LocalHandlerOption<'onResponseError'> | LocalHandlerOption<'onResponseError'>[]
}

export interface ApiClient {
  <T>(url: string, options?: ApiFetchOptions): Promise<T>
  addHandler<K extends keyof ApiHandlers>(
    type: K,
    handler: (context: HandlerContextTypes[K]) => void,
    options?: GlobalHandlerOptions
  ): void
  removeHandler<K extends keyof ApiHandlers>(
    type: K,
    handler: (context: HandlerContextTypes[K]) => void
  ): void
  create(...args: Parameters<typeof $fetch['create']>): ApiClient
}

declare module '#app' {
  interface NuxtApp {
    $api: ApiClient
  }
}
