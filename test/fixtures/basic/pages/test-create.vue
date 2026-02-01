<template>
  <div data-testid="handler-log">
    {{ JSON.stringify(log) }}
  </div>
</template>

<script setup>
const log = ref([])
const { $api } = useNuxtApp()

$api.addHandler('onRequest', () => log.value.push('global'))

const instance = $api.create({
  baseURL: 'https://jsonplaceholder.typicode.com/',
})
instance.addHandler('onRequest', () => log.value.push('instance'))

await instance('todos/1')
</script>
