# nuxt-advanced-fetch

[![npm version](https://img.shields.io/npm/v/nuxt-advanced-fetch.svg)](https://www.npmjs.com/package/nuxt-advanced-fetch)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/github/stars/Daisigu/nuxt-advanced-fetch?style=social)](https://github.com/Daisigu/nuxt-advanced-fetch)

**A Nuxt module (Nuxt 3 & 4) that extends `$fetch` with global interceptors, multiple lifecycle handlers per stage, and isolated API client instances.**

Native Nuxt `$fetch` allows only one handler per lifecycle hook and no shared interceptors across calls. This module adds a `$api` client with pluggable global handlers, ordered execution, and the ability to create separate fetch instances (e.g. per backend) with their own handler sets—without touching the global `$fetch`.

---

## Features

- **Multiple handlers per lifecycle** — Register several handlers for `onRequest`, `onRequestError`, `onResponse`, and `onResponseError`; they run in a defined order (globals first, then per-call).
- **Ordered execution** — Control handler order via an `order` option (lower runs first) for both global and per-call handlers.
- **Isolated instances** — Create dedicated API clients with `$api.create({ baseURL, ... })`; each has its own handlers and does not inherit global ones.
- **Type-safe** — Full TypeScript typings for handlers, options, and the `$api` client (e.g. `ApiClient`, `ApiFetchOptions`, `HandlerContextTypes`).
- **Nuxt 3 & 4** — Built as a Nuxt module; works with Nuxt 3 and Nuxt 4. Injects `$api` via `useNuxtApp()` and uses Nitro/ofetch under the hood.

---

## Installation

```bash
npm install nuxt-advanced-fetch
```

```bash
yarn add nuxt-advanced-fetch
```

```bash
pnpm add nuxt-advanced-fetch
```

Add the module to your Nuxt config:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-advanced-fetch'],
})
```

---

## Quick Start

Use the injected `$api` client (same call signature as `$fetch`) and attach global handlers:

```ts
const { $api } = useNuxtApp()

// Optional: global request interceptor
$api.addHandler('onRequest', (ctx) => {
  ctx.options.headers.set('X-Request-Id', crypto.randomUUID())
})

// Optional: global error handling
$api.addHandler('onResponseError', ({ response }) => {
  console.error('API error', response?.status, response?._data)
})

// Use like $fetch
const data = await $api<{ id: number; title: string }>('/api/todos/1', {
  method: 'GET',
})
```

Per-call hooks still work and run after global handlers (you can pass a function or an object with `handler` and `order`):

```ts
const item = await $api('/api/items/1', {
  onResponse: (ctx) => {
    console.log('Fetched', ctx.response?._data)
  },
})
```

---

## API Reference

### Client: `$api` (type `ApiClient`)

Injected via `useNuxtApp().$api`. Callable like `$fetch`; accepts the same request options plus extended hook types.

| Method / signature | Description |
|--------------------|-------------|
| `$api<T>(url: string, options?: ApiFetchOptions): Promise<T>` | Performs a request. Runs global handlers first, then per-call hooks. Returns parsed response body. |
| `addHandler<K>(type: K, handler: (ctx: HandlerContextTypes[K]) => void, options?: GlobalHandlerOptions): void` | Registers a global handler for `onRequest`, `onRequestError`, `onResponse`, or `onResponseError`. Use `options.order` (default `0`); lower runs first. |
| `removeHandler<K>(type: K, handler: (ctx: HandlerContextTypes[K]) => void): void` | Unregisters a global handler by reference. |
| `create(defaultOptions?, customGlobalOptions?): ApiClient` | Returns a new API client (e.g. with `baseURL`) with its own handler list. Does not inherit global handlers from `$api`. |

### Types

| Type | Description |
|------|-------------|
| `ApiClient` | Type of `$api` and instances returned by `$api.create()`. |
| `ApiFetchOptions` | Request options for `$api()`; extends Nitro fetch options. Hook fields (`onRequest`, etc.) accept a function or `LocalHandlerOptions` (or array of either). |
| `LocalHandlerOptions<K>` | `{ handler: (ctx) => void, order?: number }` for per-call hooks. Lower `order` runs first within the same phase. |
| `GlobalHandlerOptions` | `{ order?: number }` for `addHandler()`. |
| `HandlerContextTypes` | Maps hook name to context type (`onRequest` → `FetchContext`, `onResponseError` → context with `response`, etc.). |

### Handler execution order

1. All **global** handlers for that hook, sorted by `order` (ascending).
2. All **per-call** handlers for that hook (from `options.onRequest` etc.), sorted by `order` (ascending).

---

## Examples

### Multiple API backends with isolated handlers

Create one client per backend; each has its own interceptors (e.g. auth, logging) and base URL:

```ts
// plugins/api-clients.ts
export default defineNuxtPlugin(() => {
  const { $api } = useNuxtApp()

  const todosApi = $api.create({
    baseURL: 'https://api.example.com/todos',
  })
  todosApi.addHandler('onRequest', (ctx) => {
    ctx.options.headers.set('X-Client', 'todos-app')
  })

  const usersApi = $api.create({
    baseURL: 'https://api.example.com/users',
  })
  usersApi.addHandler('onResponseError', ({ response }) => {
    if (response?.status === 401) {
      // e.g. redirect to login
    }
  })

  return {
    provide: {
      todosApi,
      usersApi,
    },
  }
})
```

```ts
// Usage in a component
const { todosApi, usersApi } = useNuxtApp()
const tasks = await todosApi<Todo[]>('/')
const profile = await usersApi<User>('/me')
```

### Ordered global handlers (auth then logging)

Control the order of global handlers with the `order` option:

```ts
$api.addHandler('onRequest', (ctx) => {
  ctx.options.headers.set('Authorization', `Bearer ${getToken()}`)
}, { order: 0 })

$api.addHandler('onRequest', (ctx) => {
  console.log('[API]', ctx.request, ctx.options)
}, { order: 10 })
```

Per-call handlers can use the same shape:

```ts
await $api('/api/data', {
  onRequest: [
    { handler: (ctx) => { /* first */ }, order: 0 },
    { handler: (ctx) => { /* second */ }, order: 5 },
  ],
})
```

---

## Repository

[GitHub — Daisigu/nuxt-advanced-fetch](https://github.com/Daisigu/nuxt-advanced-fetch)

---

## License

[MIT](./LICENSE)
