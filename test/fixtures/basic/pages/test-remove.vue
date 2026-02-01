<template>
  <div data-testid="handler-log">{{ JSON.stringify(log) }}</div>
</template>

<script setup>
const log = ref([])
const { $api } = useNuxtApp()

const handlerToRemove = () => log.value.push('removed')
$api.addHandler('onRequest', () => log.value.push('kept'), { order: 0 })
$api.addHandler('onRequest', handlerToRemove, { order: 1 })
$api.removeHandler('onRequest', handlerToRemove)

await $api('https://jsonplaceholder.typicode.com/todos/1')
</script>
