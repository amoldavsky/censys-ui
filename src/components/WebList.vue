<template>
  <div class="table-wrap elevated">
    <v-data-table
      :headers="headers"
      :items="items"
      item-key="domain"
      density="compact"
      fixed-header
      height="auto"
    >
      <template #item.status="{ item }">
        <v-chip :color="item.status==='Active' ? 'success' : 'warning'" size="small" variant="flat">
          {{ item.status }}
        </v-chip>
      </template>
      <template #bottom></template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
const headers = [
  { title: 'Certificate', key: 'cert', width: 260 },
  { title: 'Common Name', key: 'common' },
  { title: 'Domain', key: 'domain' },
  { title: 'Status', key: 'status', align: 'end', width: 120 }
]
const items = [
  { cert:'000043671259...', common:'gamecogames.com', domain:'gamecogames.com', status:'Active' },
  { cert:'00004710132eb...', common:'www.prayerculture.tv', domain:'www.prayerculture.tv', status:'Expired' }
]
</script>

<style scoped>
.table-wrap{
  border:1px solid var(--edge);
  background: var(--bg-1);
  border-radius:14px;
  overflow:auto;
}
.table-wrap :deep(table){
  min-width: 680px;
}
</style>
