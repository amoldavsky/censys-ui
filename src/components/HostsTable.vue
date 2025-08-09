<template>
  <v-data-table
    :headers="headers"
    :items="items"
    item-key="ip"
    density="compact"
    class="elevated">
    <template #item.severity="{ item }">
      <v-chip :color="item.severity === 'Critical' ? 'error' : 'warning'" size="small" variant="flat">
        {{ item.severity }}
      </v-chip>
    </template>
    <template #bottom></template>
  </v-data-table>
</template>

<script setup lang="ts">
const headers = [
  { title: 'Host', key: 'ip', width: 170 },
  { title: 'City', key: 'city' },
  { title: 'Country', key: 'country' },
  { title: 'AS name', key: 'asn' },
  { title: 'Services', key: 'services' },
  { title: 'Severity', key: 'severity', align: 'end', width: 120 }
]
const items = [
  { ip: '188.196.241.227', city: 'New York City', country: 'U.S.', asn: 'Udasha S.A.', services:'SSH — 11558', severity: 'Critical' },
  { ip: '1.92.135.168', city: 'Beijing', country: 'China', asn: 'HWCSNET', services:'HTTP/2 — 8082', severity: 'Medium' },
  { ip: '1.94.62.205', city: 'Shanghai', country: 'China', asn: 'HWCSNET', services:'FTP/SSH/HTTP', severity: 'Critical' }
]
</script>

<style scoped>
.elevated{
  border: 1px solid var(--edge);
  background: var(--bg-1);
  border-radius: 14px;
  overflow: hidden;
}
</style>
