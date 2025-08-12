<template>
  <div class="table-wrap elevated">
    <v-data-table
      :headers="headers"
      :items="webAssets"
      :loading="loading"
      item-key="id"
      density="compact"
      fixed-header
      height="auto"
      @click:row="onRowClick"
      class="clickable-table"
    >
      <template #item.id="{ item }">
        <span class="domain-link">{{ item.id }}</span>
      </template>

      <template #item.certificate_authority="{ item }">
        {{ item.certificate_authority.name }}
      </template>

      <template #item.validity_period="{ item }">
        <v-chip
          :color="getStatusColor(item.validity_period.status)"
          size="small"
          variant="flat"
        >
          {{ item.validity_period.status.toUpperCase() }}
        </v-chip>
      </template>

      <template #item.security_analysis="{ item }">
        <v-chip
          :color="getRiskColor(item.security_analysis.risk_level)"
          size="small"
          variant="flat"
        >
          {{ item.security_analysis.risk_level.toUpperCase() }}
        </v-chip>
      </template>

      <template #item.actions="{ item }">
        <v-btn
          icon="mdi-delete"
          size="small"
          color="error"
          variant="text"
          @click.stop="$emit('delete', item)"
        />
      </template>

      <template #bottom></template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { WebAsset } from '@/services/api'

const router = useRouter()

interface Props {
  webAssets: WebAsset[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  delete: [webAsset: WebAsset]
}>()

const headers = [
  { title: 'Domain', key: 'id', width: 200 },
  { title: 'Common Name', key: 'subject.common_name', width: 200 },
  { title: 'Certificate Authority', key: 'certificate_authority', width: 200 },
  { title: 'Status', key: 'validity_period', width: 120 },
  { title: 'Risk Level', key: 'security_analysis', align: 'end', width: 120 },
  { title: 'Actions', key: 'actions', align: 'center', width: 100, sortable: false }
]

function onRowClick(event: Event, { item }: { item: WebAsset }) {
  router.push(`/web/${encodeURIComponent(item.id)}`)
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'success'
    case 'expired': return 'error'
    default: return 'grey'
  }
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

.domain-link {
  color: var(--pri);
  font-weight: 500;
}
</style>
