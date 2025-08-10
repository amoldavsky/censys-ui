<template>
  <div class="table-wrap elevated">
    <v-data-table
      :headers="headers"
      :items="hosts"
      :loading="loading"
      item-key="ip"
      density="compact"
      fixed-header
      height="auto"
      @click:row="onRowClick"
      class="clickable-table"
    >
      <template #item.ip="{ item }">
        <span class="ip-link">{{ item.ip }}</span>
      </template>

      <template #item.location="{ item }">
        {{ item.location.city }}, {{ item.location.country }}
      </template>

      <template #item.as_name="{ item }">
        {{ item.as_name }}
      </template>

      <template #item.services="{ item }">
        <div class="services-summary">
          <v-chip
            v-for="service in (item.services || []).slice(0, 2)"
            :key="service.port"
            size="small"
            variant="outlined"
            class="mr-1"
          >
            {{ service.protocol }} - {{ service.port }}
          </v-chip>
          <span v-if="item.services && item.services.length > 2" class="text-caption">
            +{{ item.services.length - 2 }} more
          </span>
        </div>
      </template>

      <template #item.risk="{ item }">
        <v-chip
          :color="getRiskColor(item.risk)"
          size="small"
          variant="flat"
        >
          {{ item.risk.toUpperCase() }}
        </v-chip>
      </template>

      <template #bottom></template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Host } from '@/services/api'

const router = useRouter()

interface Props {
  hosts: Host[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const headers = [
  { title: 'IP Address', key: 'ip', width: 150 },
  { title: 'Location', key: 'location', width: 200 },
  { title: 'AS Name', key: 'as_name', width: 250 },
  { title: 'Services', key: 'services', width: 250 },
  { title: 'Risk Level', key: 'risk', align: 'end', width: 120 }
]

function onRowClick(event: Event, { item }: { item: Host }) {
  router.push(`/hosts/${item.ip}`)
}

function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'critical': return 'error'
    case 'high': return 'warning'
    case 'medium': return 'info'
    case 'low': return 'success'
    default: return 'grey'
  }
}
</script>

<style scoped>
.table-wrap {
  border: 1px solid var(--edge);
  background: var(--bg-1);
  border-radius: 14px;
  overflow: auto;
}

.table-wrap :deep(table) {
  min-width: 680px;
}

.clickable-table :deep(tbody tr) {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clickable-table :deep(tbody tr:hover) {
  background-color: rgba(0, 229, 168, 0.05);
}

.ip-link {
  color: var(--pri);
  font-weight: 500;
}

.services-summary {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
</style>
