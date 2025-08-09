<template>
  <v-data-table
    :headers="headers"
    :items="items"
    class="elevated"
    item-key="domain"
    density="compact">
    <template #item.status="{ item }">
      <v-chip :color="item.status==='Active' ? 'success' : 'warning'" size="small" variant="flat">
        {{ item.status }}
      </v-chip>
    </template>
    <template #bottom></template>
  </v-data-table>
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
.elevated{ border:1px solid var(--edge); background:var(--bg-1); border-radius:14px; overflow: hidden; }
</style>
