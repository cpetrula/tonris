<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Button from 'primevue/button'
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-indigo-600">404</h1>
      <h2 class="text-3xl font-bold text-gray-900 mt-4">Page not found</h2>
      <p class="text-gray-600 mt-2 max-w-md mx-auto">
        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
      </p>
      <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <RouterLink to="/">
          <Button
            label="Go Home"
            icon="pi pi-home"
            class="px-6"
          />
        </RouterLink>
        <Button
          label="Go Back"
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          class="px-6"
          @click="$router.back()"
        />
      </div>
    </div>
  </div>
</template>
