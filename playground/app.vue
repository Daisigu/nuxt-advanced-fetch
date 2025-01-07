<template>
  <pre v-if="data">
    {{ data }}
  </pre>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()

// Creating two instances of the API with different base URLs
const firstInstance = $api.create({
  baseURL: 'https://jsonplaceholder.typicode.com/todos/',
})

const secondInstance = $api.create({
  baseURL: 'https://jsonplaceholder.typicode.com/users/',
})

// Using useAsyncData to fetch data asynchronously from the first API instance
const { data } = await useAsyncData(() =>
  firstInstance<{ userId: number, id: number, title: string, completed: boolean }>('2'),
)

onMounted(async () => {
  // Add a request handler for the first instance to modify the request before sending it
  firstInstance.addHandler('onRequest', (_context) => {
    console.log('first instance onRequest handler')
    // Adding an authorization header to the request
    _context.options.headers.append('Authorization', 'Bearer token')
  })

  // Add a response handler for the first instance to handle the response
  firstInstance.addHandler('onResponse', (_context) => {
    console.log('first instance onResponse handler')
    // You can modify the response data here if needed
  })

  // Add a request error handler for the first instance
  firstInstance.addHandler('onRequestError', (_context) => {
    console.log('first instance onRequestError handler')
    // Handle request error logic, e.g., retrying the request or showing an error
  })

  // Add a response error handler for the first instance
  firstInstance.addHandler('onResponseError', (_context) => {
    console.log('first instance onResponseError handler')
    // Handle response error logic, such as logging or retrying
  })

  // Add a request handler for the second instance
  secondInstance.addHandler('onRequest', (_context) => {
    console.log('second instance onRequest handler')
    // You can modify headers or log details for each request here
  })

  await firstInstance('2')
  await firstInstance('2')

  await secondInstance('1')
  await secondInstance('1')

  // Sending a general request directly via $api
  const res = await $api('https://jsonplaceholder.typicode.com/todos/2', {
    method: 'GET',
  })
  console.log(res) // Logging the response from the direct request
})

// Example: Adding a custom request handler that intercepts all requests for logging
$api.addHandler('onRequest', (_context) => {
  console.log('Global onRequest handler for all API calls')
  // You can append global headers here or log request details
  _context.options.headers.append('X-Request-Time', new Date().toISOString())
})

// Example: Adding a custom response handler that checks if a response is successful
$api.addHandler('onResponse', (_context) => {
  console.log('Global onResponse handler for all responses')
  // Example of handling a successful response
  if (_context.response?.status === 200) {
    console.log('Request was successful', _context.response?._data)
  }
})

// Example: Global error handler that catches any error in the request/response cycle
$api.addHandler('onRequestError', (_context) => {
  console.error('Global onRequestError handler')
  // You can add error retry logic or notify the user about the failure
})

$api.addHandler('onResponseError', (_context) => {
  console.error('Global onResponseError handler')
  // Handle errors like 4xx, 5xx HTTP status codes
})

// Example: Using a handler to modify the request or response dynamically
$api.addHandler('onRequest', (_context) => {
  console.log('Adding custom headers for request')
  _context.options.headers.set('Custom-Header', 'MyHeaderValue')
})

$api.addHandler('onResponse', (_context) => {
  console.log('Received response, modifying data before returning')
  if (_context.response?.status === 200) {
    _context.response!._data = { ..._context.response?._data, modified: true }
  }
})
</script>
