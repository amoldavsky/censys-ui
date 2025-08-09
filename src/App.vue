<template>
  <v-app>
    <Loader3D :active="loading" />

    <v-app-bar flat height="64" :elevation="0" class="px-2" color="transparent">
      <v-btn icon="mdi-menu" variant="text" @click="drawer = !drawer" />
      <v-toolbar-title class="font-weight-bold">
        <span style="color:var(--pri)">SECURITY</span> <span style="color:#8aa1b5">SCAN</span>
      </v-toolbar-title>
      <v-spacer />
      <v-btn icon="mdi-bell-outline" variant="text" />
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

    <v-navigation-drawer v-model="drawer" :rail="rail" @mouseenter="rail=false" @mouseleave="rail=true" floating>
      <v-list density="comfortable" nav>
        <v-list-item title="Assets" prepend-icon="mdi-lan" to="/assets"/>
        <v-list-item title="Hosts" prepend-icon="mdi-server" to="/hosts"/>
        <v-list-item title="Web" prepend-icon="mdi-web" to="/web"/>
        <v-list-item title="Data" prepend-icon="mdi-database" to="/data"/>
      </v-list>
      <template #append>
        <div class="pa-2">
          <v-btn block color="primary" @click="simulateLoad" prepend-icon="mdi-play">Run Scan</v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Loader3D from '@/components/Loader3D.vue'

const drawer = ref(true)
const rail = ref(false)
const loading = ref(false)

function simulateLoad(){
  loading.value = true
  setTimeout(()=> loading.value = false, 4300)
}

onMounted(()=>{
  // small intro shimmer/loader
  loading.value = true
  setTimeout(()=> loading.value = false, 1600)
})
</script>

<style scoped>
:deep(.v-navigation-drawer){
  border-right: 1px solid var(--edge);
  background: radial-gradient(800px 200px at 0 -10%, rgba(0,226,168,.06), transparent) , var(--bg-1) !important;
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
</style>
