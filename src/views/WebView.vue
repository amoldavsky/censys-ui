<template>
  <div class="layout">
    <aside class="filters">
      <v-card variant="flat" class="elevated">
        <v-card-title class="text-subtitle-1">Filters</v-card-title>
        <v-divider/>
        <v-list density="compact">
          <v-list-subheader>Types</v-list-subheader>
          <v-checkbox label="hosts" v-model="filters.hosts" hide-details density="compact"/>
          <v-checkbox label="web_properties" v-model="filters.web" hide-details density="compact"/>

          <v-list-subheader class="mt-2">Labels</v-list-subheader>
          <v-checkbox label="swagger-ui" v-model="filters.swagger" hide-details density="compact"/>
          <v-checkbox label="remote-access" v-model="filters.remote" hide-details density="compact"/>
          <v-checkbox label="jquery" v-model="filters.jquery" hide-details density="compact"/>
          <v-checkbox label="database" v-model="filters.database" hide-details density="compact"/>
        </v-list>
      </v-card>
    </aside>

    <main class="content">
      <div class="header">
        <div class="title">Parsed JSON</div>
        <JsonUpload @loaded="onLoaded" />
      </div>

      <div class="cards">
        <v-card v-for="w in cards" :key="w.url" class="card" variant="flat">
          <v-card-title class="text-subtitle-1">
            <a :href="w.url" target="_blank" rel="noreferrer">{{ w.url }}</a>
          </v-card-title>
          <v-card-text>
<pre>{{ formatWeb(w) }}</pre>
            <div class="chips">
              <v-chip v-for="l in w.labels || []" :key="l" size="x-small" variant="flat" color="secondary">{{ l }}</v-chip>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import JsonUpload from '@/components/JsonUpload.vue'
import sample from '@/mock/web.json'

type Web = { url: string, title?: string|null, description?: string|null, labels?: string[] }
const filters = ref({ hosts: false, web: true, swagger: true, remote: true, jquery: true, database: false })
const cards = ref<Web[]>([...sample])

function onLoaded(data:any){
  if(Array.isArray(data)) cards.value = data as Web[]
  else alert('Expected an array at top-level')
}
function formatWeb(w: Web){
  const out: any = { title: w.title, description: w.description, labels: w.labels }
  return JSON.stringify(out, null, 2)
}
</script>

<style scoped>
.layout{ display:grid; grid-template-columns: 260px 1fr; gap: 14px; padding: 12px; }
.filters .elevated{ border:1px solid var(--edge); background: var(--bg-1); border-radius: 14px; }
.content .header{ display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; gap:12px }
.cards{ display:grid; grid-template-columns: 1fr; gap: 12px; }
.card{ border:1px solid var(--edge); background:var(--bg-1); }
pre{ margin:0; font-size:.82rem; color:#a9c1d6; white-space:pre-wrap }
.chips{ margin-top:8px; display:flex; flex-wrap:wrap; gap:6px }
@media(min-width:1100px){ .cards{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
</style>
