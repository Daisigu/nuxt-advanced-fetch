<template>
  <div data-testid="handler-order">
    {{ JSON.stringify(order) }}
  </div>
</template>

<script setup>
const order = ref([])
const { $api } = useNuxtApp()

$api.addHandler('onRequest', () => order.value.push('global'), { order: 0 })

await $api('https://jsonplaceholder.typicode.com/todos/1', {
  onRequest: () => order.value.push('local'),
})
</script>
