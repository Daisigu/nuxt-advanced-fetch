import type { IFetchOptions, IApiHandlers, IApiHandlerTypes } from '../types'

export default defineNuxtPlugin({
  name: 'api',
  enforce: 'pre',
  setup() {
    const config = useRuntimeConfig()
    const handlers: IApiHandlers = {
      onRequest: [],
      onRequestError: [],
      onResponse: [],
      onResponseError: [],
    }

    function callMaybeArray<T extends (arg: any) => void>(maybeArray: T | T[] | undefined, arg: Parameters<T>[0]) {
      if (Array.isArray(maybeArray)) {
        maybeArray.forEach(fn => fn(arg))
      }
      else if (typeof maybeArray === 'function') {
        maybeArray(arg)
      }
    }

    const fetch = $fetch.create({
      baseURL: config.public.baseURL,
      onRequest: (context: IApiHandlerTypes['onRequest']) => {
        handlers.onRequest.forEach(handler => handler(context))
      },
      onRequestError: (error: IApiHandlerTypes['onRequestError']) => {
        handlers.onRequestError.forEach(handler => handler(error))
      },
      onResponse: (context: IApiHandlerTypes['onResponse']) => {
        handlers.onResponse.forEach(handler => handler(context))
      },
      onResponseError: (error: IApiHandlerTypes['onResponseError']) => {
        handlers.onResponseError.forEach(handler => handler(error))
      },
    })

    function addHandler<K extends keyof IApiHandlers>(type: K, handler: (context: IApiHandlerTypes[K]) => void) {
      handlers[type].push(handler)
    }

    function removeHandler<K extends keyof IApiHandlers>(type: K, handler: (context: IApiHandlerTypes[K]) => void) {
      const index = handlers[type].indexOf(handler)
      if (index !== -1) {
        handlers[type].splice(index, 1)
      }
    }

    function api<T>(url: string, options?: IFetchOptions) {
      return fetch<T>(url, {
        ...options,
        onRequest: (context) => {
          handlers.onRequest.forEach(handler => handler(context as IApiHandlerTypes['onRequest']))
          callMaybeArray(options?.onRequest, context)
        },
        onRequestError: (error) => {
          handlers.onRequestError.forEach(handler => handler(error as IApiHandlerTypes['onRequestError']))
          callMaybeArray(options?.onRequestError, error)
        },
        onResponse: (context) => {
          handlers.onResponse.forEach(handler => handler(context as IApiHandlerTypes['onResponse']))
          callMaybeArray(options?.onResponse, context)
        },
        onResponseError: (error) => {
          handlers.onResponseError.forEach(handler => handler(error as IApiHandlerTypes['onResponseError']))
          callMaybeArray(options?.onResponseError, error)
        },
      })
    }

    // Expose the api function directly along with handlers management
    return {
      provide: {
        api: Object.assign(api, {
          addHandler,
          removeHandler,
        }),
      },
    }
  },
})
