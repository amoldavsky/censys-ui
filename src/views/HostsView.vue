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

      <v-alert v-if="!cards.length" type="info" variant="tonal" class="mb-3">
        Upload a JSON array of host objects to render rich cards. Sample data is preloaded.
      </v-alert>

      <div class="cards">
        <v-card v-for="h in cards" :key="h.ip" class="card" variant="flat">
          <v-card-title class="text-subtitle-1">
            <a :href="'#'">{{ h.ip }}</a>
          </v-card-title>
          <v-card-text>
<pre>{{ formatHost(h) }}</pre>
            <div class="chips">
              <v-chip
                v-for="l in h.labels || []"
                :key="l"
                size="x-small"
                variant="flat"
                color="secondary"
              >{{ l }}</v-chip>
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
import sample from '@/mock/hosts.json'

type Host = {
  ip: string
  name?: string
  autonomous_system?: number
  location?: { city?: string, country?: string }
  labels?: string[]
}

const filters = ref({ hosts: true, web: false, swagger: true, remote: true, jquery: false, database: false })
const cards = ref<Host[]>([...sample])

function onLoaded(data:any){
  if(Array.isArray(data)) cards.value = data as Host[]
  else alert('Expected an array at top-level')
}

function formatHost(h: Host){
  const out: any = {
    name: h.name,
    autonomous_system: h.autonomous_system,
    location: h.location,
    labels: h.labels
  }
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
