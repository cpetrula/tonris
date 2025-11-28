<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Toast from 'primevue/toast'

const authStore = useAuthStore()

onMounted(async () => {
  // If we have a token, try to fetch the user
  if (authStore.token) {
    await authStore.fetchUser()
  }
})
</script>

<template>
  <Toast />
  <RouterView />
</template>

<style scoped>
/* App-level scoped styles can go here */
</style>
