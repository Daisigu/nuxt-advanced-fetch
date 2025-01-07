<template>
  <pre v-if="data">
    {{ data }}
  </pre>
</template>

<script setup lang="ts">

const { $api } = useNuxtApp()

const firstIntance = $api.create({
  baseURL: 'https://jsonplaceholder.typicode.com/todos/',
})
const secondInstance = $api.create({
  baseURL: 'https://jsonplaceholder.typicode.com/users/',
})
const { data } = await useAsyncData(() => firstIntance<{ userId: number, id: number, title: string, completed: boolean }>('2'))

onMounted(async () => {
  firstIntance.addHandler('onRequest', (_context) => {
    console.log('first instance onRequest handler')
    _context.options.headers.append('Authorization', 'Bearer token')
  })
  firstIntance.addHandler('onResponse', (_context) => {
    console.log('first instance onResponse handler')
  })
  firstIntance.addHandler('onRequestError', (_context) => {
    console.log('first instance onRequestError handler')
  })
  firstIntance.addHandler('onResponseError', (_context) => {
    console.log('first instance onResponseError handler')
  })

  secondInstance.addHandler('onRequest', (context) => {
    console.log('second instance onRequest handler')
  })
  await firstIntance('2')
  await firstIntance('2')

  await secondInstance('1')
  await secondInstance('1')
  const res = await $api('https://jsonplaceholder.typicode.com/todos/2', {
    method: 'GET'
  })
  console.log(res);
})
</script>
