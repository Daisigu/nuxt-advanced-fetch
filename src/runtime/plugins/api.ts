import type { IApiHandlers, IApiHandlerTypes, IApiPlugin, IFetchOptions } from '../types'

export default defineNuxtPlugin({
  name: 'api',
  enforce: 'pre',
  setup() {
    const globalHandlers: IApiHandlers = {
      onRequest: [],
      onRequestError: [],
      onResponse: [],
      onResponseError: [],
    }

    function callMaybeArray<T extends (arg: any) => void>(
      maybeArray: T | T[] | undefined,
      arg: Parameters<T>[0],
    ): void {
      if (Array.isArray(maybeArray)) {
        maybeArray.forEach(fn => fn(arg))
      }
      else if (typeof maybeArray === 'function') {
        maybeArray(arg)
      }
    }

    function enhanceInstance(instance: typeof $fetch, handlers: IApiHandlers = globalHandlers): IApiPlugin {
      return Object.assign(
        <T>(url: string, options?: IFetchOptions): Promise<T> => {
          return instance<T>(url, {
            ...options,
            onRequest: (context) => {
              handlers.onRequest.forEach(handler =>
                handler(context as IApiHandlerTypes['onRequest']),
              )
              callMaybeArray(options?.onRequest, context)
            },
            onRequestError: (error) => {
              handlers.onRequestError.forEach(handler =>
                handler(error as IApiHandlerTypes['onRequestError']),
              )
              callMaybeArray(options?.onRequestError, error)
            },
            onResponse: (context) => {
              handlers.onResponse.forEach(handler =>
                handler(context as IApiHandlerTypes['onResponse']),
              )
              callMaybeArray(options?.onResponse, context)
            },
            onResponseError: (error) => {
              handlers.onResponseError.forEach(handler =>
                handler(error as IApiHandlerTypes['onResponseError']),
              )
              callMaybeArray(options?.onResponseError, error)
            },
          })
        },
        {
          addHandler<K extends keyof IApiHandlers>(
            type: K,
            handler: (context: IApiHandlerTypes[K]) => void,
          ): void {
            handlers[type].push(handler)
          },
          removeHandler<K extends keyof IApiHandlers>(
            type: K,
            handler: (context: IApiHandlerTypes[K]) => void,
          ): void {
            const index = handlers[type].indexOf(handler)
            if (index !== -1) handlers[type].splice(index, 1)
          },
          create(...args: Parameters<typeof instance.create>): IApiPlugin {
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

    return {
      provide: {
        api: enhanceInstance($fetch),
      },
    }
  },
})
