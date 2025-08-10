<template>
  <div class="grid gap-4">
    <div class="kpis">
      <v-card class="kpi" variant="tonal">
        <div class="label">Hosts</div>
        <div class="value">3</div>
      </v-card>
      <v-card class="kpi" variant="tonal">
        <div class="label">Malware</div>
        <div class="value">1</div>
      </v-card>
      <v-card class="kpi" variant="tonal">
        <div class="label">Certificates</div>
        <div class="value">3 <span class="sub">2 active</span></div>
      </v-card>
      <v-card class="kpi" variant="tonal">
        <div class="label">Risks</div>
        <div class="value">1 <span class="sub">High</span></div>
      </v-card>
    </div>

    <v-card class="map" variant="flat">
      <div class="map-inner">
        <div class="pin" style="left:18%;top:55%">New York City<br/><small>U.S.</small></div>
        <div class="pin" style="left:66%;top:42%">Beijing, China</div>
        <div class="pin" style="left:62%;top:60%">Shanghai, China</div>
      </div>
    </v-card>

    <div class="tables">
      <HostsTable :hosts="hosts" :loading="hostsLoading" />
      <WebList :webAssets="webAssets" :loading="webLoading" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import HostsTable from './HostsTable.vue'
import WebList from './WebList.vue'
import { apiService, type Host, type WebAsset } from '@/services/api'

const hosts = ref<Host[]>([])
const webAssets = ref<WebAsset[]>([])
const hostsLoading = ref(false)
const webLoading = ref(false)

async function loadHosts() {
  hostsLoading.value = true
  try {
    hosts.value = await apiService.getHostAssets()
  } catch (err) {
    console.error('Error loading hosts in AssetSummary:', err)
    // Fail silently in the summary component
  } finally {
    hostsLoading.value = false
  }
}

async function loadWebAssets() {
  webLoading.value = true
  try {
    webAssets.value = await apiService.getWebAssets()
  } catch (err) {
    console.error('Error loading web assets in AssetSummary:', err)
    // Fail silently in the summary component
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
.grid{ display:grid; grid-template-columns: 1fr; }
.kpis{ display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:14px; }
.kpi{ padding:16px 18px; border:1px solid var(--edge); background:var(--bg-1); border-radius:14px; }
.kpi .label{ color:#8aa1b5; font-weight:600; font-size:0.85rem; letter-spacing:.3px; }
.kpi .value{ font-size:1.6rem; font-weight:800; display:flex; align-items:center; gap:.5rem }
.kpi .sub{ font-size:.9rem; color:#8aa1b5; font-weight:600 }

.map{ height: 320px; border:1px solid var(--edge); background: radial-gradient(1200px 500px at 20% 10%, rgba(0,226,168,.06), transparent), #0F151C; border-radius:14px; }
.map-inner{
  position: relative; width:100%; height:100%;
  background-image: url('https://raw.githubusercontent.com/djaiss/mapsicon/master/all/earth/earth.png');
  background-size: cover; background-position: center; filter: saturate(.6) brightness(.7) contrast(1.1);
  border-radius:14px; overflow: hidden;
}
.pin{
  position:absolute; transform: translate(-50%, -50%);
  padding:8px 10px; background: rgba(9,13,17,.85); border:1px solid var(--edge); border-radius:10px;
  font-size:.85rem; box-shadow: 0 10px 20px rgba(0,0,0,.35);
  white-space: nowrap;
}

.tables{ display:grid; grid-template-columns: 1fr; gap:16px; margin-top: 16px; }
@media(min-width:1100px){
  .grid{ grid-template-columns: 1fr; }
  .tables{ grid-template-columns: 1fr 1fr; }
}
</style>
