import type {
  ApiHandlers,
  HandlerContextTypes,
  ApiClient,
  ApiFetchOptions,
  GlobalHandlerOptions,
  LocalHandlerOption,
  GlobalHandlerEntry,
  LocalHandlerEntry,
} from '../types'
import { defineNuxtPlugin } from '#app'

const DEFAULT_ORDER = 0

function normalizeLocal<K extends keyof HandlerContextTypes>(
  option: LocalHandlerOption<K> | LocalHandlerOption<K>[] | undefined,
): LocalHandlerEntry<K>[] {
  if (option == null) return []
  const list = Array.isArray(option) ? option : [option]
  return list.map((item): LocalHandlerEntry<K> => {
    if (typeof item === 'function') {
      return { handler: item, order: DEFAULT_ORDER }
    }
    return { handler: item.handler, order: item.order ?? DEFAULT_ORDER }
  })
}

function runHandlers<K extends keyof HandlerContextTypes>(
  context: HandlerContextTypes[K],
  globalEntries: GlobalHandlerEntry<K>[],
  localEntries: LocalHandlerEntry<K>[],
): void {
  const sortedGlobal = [...globalEntries].sort((a, b) => a.order - b.order)
  const sortedLocal = [...localEntries].sort((a, b) => a.order - b.order)
  for (const entry of sortedGlobal) entry.handler(context)
  for (const entry of sortedLocal) entry.handler(context)
}

const globalHandlers: ApiHandlers = {
  onRequest: [],
  onRequestError: [],
  onResponse: [],
  onResponseError: [],
}

function enhanceInstance(
  instance: typeof $fetch,
  handlers: ApiHandlers = globalHandlers,
): ApiClient {
  return Object.assign(
    <T>(url: string, options?: ApiFetchOptions): Promise<T> => {
      return instance<T>(url, {
        ...options,
        onRequest: (context) => {
          runHandlers(
            context as HandlerContextTypes['onRequest'],
            handlers.onRequest,
            normalizeLocal(options?.onRequest),
          )
        },
        onRequestError: (error) => {
          runHandlers(
            error as HandlerContextTypes['onRequestError'],
            handlers.onRequestError,
            normalizeLocal(options?.onRequestError),
          )
        },
        onResponse: (context) => {
          runHandlers(
            context as HandlerContextTypes['onResponse'],
            handlers.onResponse,
            normalizeLocal(options?.onResponse),
          )
        },
        onResponseError: (error) => {
          runHandlers(
            error as HandlerContextTypes['onResponseError'],
            handlers.onResponseError,
            normalizeLocal(options?.onResponseError),
          )
        },
      })
    },
    {
      addHandler<K extends keyof ApiHandlers>(
        type: K,
        handler: (context: HandlerContextTypes[K]) => void,
        options?: GlobalHandlerOptions,
      ): void {
        handlers[type].push({
          handler,
          order: options?.order ?? DEFAULT_ORDER,
        })
      },
      removeHandler<K extends keyof ApiHandlers>(
        type: K,
        handler: (context: HandlerContextTypes[K]) => void,
      ): void {
        const index = handlers[type].findIndex(
          entry => entry.handler === handler,
        )
        if (index !== -1) handlers[type].splice(index, 1)
      },
      create(...args: Parameters<typeof instance.create>): ApiClient {
        const newInstance = instance.create(...args)
        return enhanceInstance(newInstance, {
          onRequest: [],
          onRequestError: [],
          onResponse: [],
          onResponseError: [],
        })
      },
    },
  )
}
export default defineNuxtPlugin({
  name: 'api',
  enforce: 'pre',
  setup() {
    return {
      provide: {
        api: enhanceInstance($fetch),
      },
    }
  },
})
