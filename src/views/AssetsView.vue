<template>
  <div class="page">
    <AssetSummary />

    <v-card class="mt-6" variant="flat" style="border:1px solid var(--edge); border-radius:14px;">
      <v-tabs v-model="tab" color="primary" grow bg-color="transparent">
        <v-tab value="hosts">Hosts</v-tab>
        <v-tab value="web">Web</v-tab>
      </v-tabs>
      <v-divider />
      <v-window v-model="tab">
        <v-window-item value="hosts">
          <div class="pad"><HostsTable :hosts="hosts" :loading="loading" /></div>
        </v-window-item>
        <v-window-item value="web">
          <div class="pad"><WebList :webAssets="webAssets" :loading="webLoading" /></div>
        </v-window-item>
      </v-window>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AssetSummary from '@/components/AssetSummary.vue'
import HostsTable from '@/components/HostsTable.vue'
import WebList from '@/components/WebList.vue'
import { apiService, type Host, type WebAsset } from '@/services/api'

const tab = ref('hosts')
const hosts = ref<Host[]>([])
const webAssets = ref<WebAsset[]>([])
const hostsLoading = ref(false)
const webLoading = ref(false)

async function loadHosts() {
  hostsLoading.value = true
  try {
    hosts.value = await apiService.getHostAssets()
  } catch (err) {
    console.error('Error loading hosts in AssetsView:', err)
    // Fail silently in the assets view
  } finally {
    hostsLoading.value = false
  }
}

async function loadWebAssets() {
  webLoading.value = true
  try {
    webAssets.value = await apiService.getWebAssets()
  } catch (err) {
    console.error('Error loading web assets in AssetsView:', err)
    // Fail silently in the assets view
  } finally {
    webLoading.value = false
  }
}

onMounted(() => {
  loadHosts()
  loadWebAssets()
})
</script>

<style scoped>
.page{ padding: 12px; }
.pad{ padding: 12px; }
</style>
