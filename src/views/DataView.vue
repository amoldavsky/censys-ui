<template>
  <div class="page">
    <v-card class="elevated pa-4">
      <div class="text-subtitle-1 mb-2">Data Ingestion</div>
      <p class="mb-4">Upload any JSON assets and we’ll parse them into visual representations (backend already implemented).</p>
      <JsonUpload @loaded="(d)=>payload = d"/>
      <v-divider class="my-4"/>
      <div v-if="payload">
        <div class="text-subtitle-2 mb-2">Preview</div>
        <pre>{{ pretty }}</pre>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import JsonUpload from '@/components/JsonUpload.vue'
const payload = ref<any | null>(null)
const pretty = computed(()=> JSON.stringify(payload.value, null, 2))
</script>

<style scoped>
.page{ padding: 12px; }
.elevated{ border:1px solid var(--edge); background:var(--bg-1); border-radius:14px; }
pre{ margin:0; font-size:.85rem; color:#a9c1d6; white-space:pre-wrap }
</style>
