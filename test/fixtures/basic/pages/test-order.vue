<template>
  <div data-testid="handler-order">
    {{ JSON.stringify(order) }}
  </div>
</template>

<script setup>
const order = ref([])
const { $api } = useNuxtApp()

$api.addHandler('onRequest', () => order.value.push('global-0'), { order: 0 })
$api.addHandler('onRequest', () => order.value.push('global-10'), {
  order: 10,
})

await $api('https://jsonplaceholder.typicode.com/todos/1', {
  onRequest: [
    { handler: () => order.value.push('local-0'), order: 0 },
    { handler: () => order.value.push('local-10'), order: 10 },
  ],
})
</script>
