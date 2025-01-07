import { createResolver, defineNuxtModule, addPlugin } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'nuxt-advanced-fetch',
    configKey: 'nuxtAdvancedFetch',
    version: '1.0.0',
  },

  setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    const runtimeDir = resolve('./runtime')

    addPlugin(resolve(runtimeDir, 'plugins/api'))

    nuxt.options.alias['#api-types'] = resolve(runtimeDir, 'types.d.ts')
  },
})
