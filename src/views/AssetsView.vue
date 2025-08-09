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
          <div class="pad"><HostsTable /></div>
        </v-window-item>
        <v-window-item value="web">
          <div class="pad"><WebList /></div>
        </v-window-item>
      </v-window>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AssetSummary from '@/components/AssetSummary.vue'
import HostsTable from '@/components/HostsTable.vue'
import WebList from '@/components/WebList.vue'

const tab = ref('hosts')
</script>

<style scoped>
.page{ padding: 12px; }
.pad{ padding: 12px; }
</style>
