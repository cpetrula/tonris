<script setup lang="ts">
// Floating bar for comparing the pitch variants. Add ?clean to the URL to hide it.
import { RouterLink, useRoute } from 'vue-router'
import { variants } from './content'

const route = useRoute()
</script>

<template>
  <nav v-if="!('clean' in route.query)" class="switcher" aria-label="Design options">
    <span class="switcher-label">Design</span>
    <RouterLink
      v-for="v in variants"
      :key="v.path"
      :to="v.path"
      class="switcher-link"
      :class="{ active: route.path === v.path }"
    >
      {{ v.label.charAt(0) }}<span class="switcher-name">{{ v.label.slice(1) }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.switcher {
  position: fixed;
  left: 50%;
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  transform: translateX(-50%);
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px;
  max-width: calc(100vw - 32px);
  overflow-x: auto;
  background: rgba(20, 20, 22, 0.92);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  font: 500 13px/1 system-ui, -apple-system, sans-serif;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}
.switcher-label {
  padding: 0 10px 0 12px;
  color: #a1a1aa;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 11px;
}
.switcher-link {
  padding: 9px 14px;
  border-radius: 999px;
  color: #f5f5f7;
  text-decoration: none;
  white-space: nowrap;
}
.switcher-link:hover {
  background: rgba(255, 255, 255, 0.08);
}
.switcher-link.active {
  background: #f5f5f7;
  color: #111;
}
@media (max-width: 480px) {
  .switcher-label { display: none; }
  .switcher-link { padding: 8px 14px; font-size: 13px; }
  .switcher-name { display: none; }
}
</style>
