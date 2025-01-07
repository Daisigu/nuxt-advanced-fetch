# API Plugin for Nuxt 3 🚀

This plugin enhances the `$fetch` instance in Nuxt 3 by introducing powerful handler mechanisms and customizable fetch instances. Whether you need global request/response handlers or isolated configurations for specific use cases, this plugin has you covered.

---

## Key Features ✨

1. **Multiple Handlers Support**:
   - Add multiple handlers for different fetch lifecycle stages: `onRequest`, `onRequestError`, `onResponse`, `onResponseError`.
   - Handlers can be added and removed dynamically.

2. **Instance Creation**:
   - Easily create new fetch instances with their own set of handlers.
   - Each instance can have isolated behavior and configurations.

3. **Enhanced Debugging**:
   - Centralize and manage request/response handlers for better control and observability.

---

## Installation 📦

1. Add the plugin to your project:
   ```bash
   npm install nuxt-advanced-fetch

   pnpm add nuxt-advanced-fetch

   yarn add nuxt-advanced-fetch
   ```

2. Register the plugin in your Nuxt application:
   ```javascript
   // nuxt.config.ts
   export default defineNuxtConfig({
     modules: ['nuxt-advanced-fetch']
   })
   ```

---

## Usage 🛠️

### Accessing the Enhanced API
The enhanced `$fetch` instance is available in useNuxtApp():

```typescript


const { $api } = useNuxtApp()


const data = await $api('/api/resource', {
  method: 'GET',
  onRequest(context) {
    console.log('Request started:', context)
  },
  onResponse(context) {
    console.log('Response received:', context)
  }
})
```

### Adding Handlers
You can add handlers globally or per-instance:

```typescript
$api.addHandler('onRequest', (context) => {
  console.log('Global onRequest handler:', context)
})

$api.addHandler('onResponseError', (error) => {
  console.error('Global response error:', error)
})
```

### Removing Handlers

```typescript
const handler = (context) => console.log('Removing this handler', context)
$api.addHandler('onRequest', handler)
$api.removeHandler('onRequest', handler)
```

### Creating Custom Instances
Each custom instance has its own set of handlers:

```typescript
const customApi = $api.create({ baseURL: 'https://custom-api.com' })

customApi.addHandler('onResponse', (context) => {
  context.options.headers.append('Authorization', `Bearer ${token}`)
})

await customApi('/custom-endpoint')
```

---

## API Reference 📖

### Methods

#### `$api(url: string, options?: IFetchOptions): Promise<any>`
- Enhanced fetch method with lifecycle handlers.

#### `addHandler(type: keyof IApiHandlers, handler: (context: IApiHandlerTypes[K]) => void): void`
- Adds a new handler for the specified lifecycle stage.

#### `removeHandler(type: keyof IApiHandlers, handler: (context: IApiHandlerTypes[K]) => void): void`
- Removes an existing handler for the specified lifecycle stage.

#### `create(options?: IFetchOptions): IApiPlugin`
- Creates a new fetch instance with isolated handlers and configurations.

---

## Why Use This Plugin? 🤔

### Problem 1: Lack of Multiple Handlers
Native `$fetch` in Nuxt lacks the ability to manage multiple handlers for a single lifecycle stage. This plugin resolves that by allowing you to:
- Register multiple handlers for `onRequest`, `onRequestError`, `onResponse`, and `onResponseError`.
- Dynamically add or remove handlers as needed.

### Problem 2: Limited Customization for Instances
Creating multiple fetch instances with isolated configurations is not straightforward. With this plugin:
- You can create multiple instances, each with its own handlers and configurations.
- This is especially useful for modular or microservice-based applications.

---

## Contributing 🤝
Contributions are welcome! Please submit an issue or a pull request on GitHub if you have suggestions or improvements.

---

## License 📜
This plugin is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

