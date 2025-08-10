<template>
  <v-app>
    <Loader3D :active="loading" />

    <v-app-bar
      app
      flat
      :height="smAndDown ? 56 : 64"
      class="px-2"
      color="transparent"
      density="comfortable"
    >
      <v-btn icon="mdi-menu" variant="text" @click="drawer = !drawer" />
      <v-toolbar-title class="font-weight-bold">
        <span style="color:var(--pri)">SECURITY</span>
        <span style="color:#8aa1b5">SCAN</span>
      </v-toolbar-title>
      <v-spacer />
      <v-btn icon="mdi-bell-outline" variant="text" class="mr-1" />
      <v-menu>
        <template #activator="{ props }">
          <v-btn v-bind="props" variant="text" class="ml-1">
            <v-icon start>mdi-account-circle</v-icon> assaf.m
            <v-icon end>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item title="Profile" prepend-icon="mdi-account-outline" />
          <v-list-item title="Settings" prepend-icon="mdi-cog-outline" />
          <v-list-item title="Sign out" prepend-icon="mdi-logout-variant" />
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      :rail="!smAndDown && rail"
      :temporary="smAndDown"
      :width="smAndDown ? 280 : undefined"
      floating
    >
      <v-list density="comfortable" nav>
        <v-list-item
          title="Assets"
          prepend-icon="mdi-lan"
          to="/assets"
          :active="isRouteActive('/assets')"
        />
        <v-list-item
          title="Hosts"
          prepend-icon="mdi-server"
          to="/hosts"
          :active="isRouteActive('/hosts')"
        />
        <v-list-item
          title="Web"
          prepend-icon="mdi-web"
          to="/web"
          :active="isRouteActive('/web')"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main class="main-content">
      <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useRoute } from 'vue-router'
import Loader3D from '@/components/Loader3D.vue'

const { smAndDown } = useDisplay()
const route = useRoute()

const drawer = ref(true)
const rail = ref(false)
const loading = ref(false)

function simulateLoad() {
  loading.value = true
  setTimeout(() => (loading.value = false), 3200)
}

function isRouteActive(basePath: string): boolean {
  const currentPath = route.path

  // Exact match for assets
  if (basePath === '/assets') {
    return currentPath === basePath
  }

  // For hosts and web, also match detail pages
  if (basePath === '/hosts') {
    return currentPath === '/hosts' || currentPath.startsWith('/hosts/')
  }

  if (basePath === '/web') {
    return currentPath === '/web' || currentPath.startsWith('/web/')
  }

  return currentPath === basePath
}

onMounted(() => {
  // Keep the loader on-screen a bit on first load
  loading.value = true
  setTimeout(() => (loading.value = false), 2600)
  // Start with closed drawer on mobile
  if (smAndDown.value) drawer.value = false
})
</script>

<style scoped>
.main-content {
  padding-top: 80px !important; /* Add space for the app bar */
}

/* Responsive padding for mobile */
@media (max-width: 600px) {
  .main-content {
    padding-top: 72px !important; /* Smaller padding for mobile app bar */
  }
}

/* Page transition effects */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>

<style scoped>
:deep(.v-navigation-drawer){
  border-right: 1px solid var(--edge);
  background: radial-gradient(800px 200px at 0 -10%, rgba(0,226,168,.06), transparent), var(--bg-1) !important;
}
:deep(.v-app-bar){
  border-bottom: 1px solid var(--edge);
  background: linear-gradient(180deg, #0D1218, #0C1116) !important;
}
:deep(.v-main){
  padding-top: 12px;
  background: radial-gradient(1200px 400px at 70% -10%, rgba(0,194,255,.07), transparent), var(--bg-0) !important;
  min-height: 100vh;
}

/* small-device niceties */
@media (max-width: 600px){
  :deep(.v-main){
    padding-top: 8px;
    padding-left: max(8px, env(safe-area-inset-left));
    padding-right: max(8px, env(safe-area-inset-right));
    padding-bottom: max(8px, env(safe-area-inset-bottom));
  }
}
</style>
