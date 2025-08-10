<template>
  <div class="page">
    <div class="header">
      <h1 class="title">Host Assets</h1>
      <div class="header-actions">
        <!-- Hidden file input -->
        <input
          ref="fileInput"
          type="file"
          accept="application/json,.json"
          @change="onFileSelected"
          style="display: none;"
        />

        <v-btn
          color="secondary"
          prepend-icon="mdi-upload"
          @click="handleUploadClick"
          :loading="uploading"
          class="mr-2"
        >
          Upload
        </v-btn>

        <v-btn
          color="primary"
          prepend-icon="mdi-refresh"
          @click="loadHosts"
          :loading="loading"
          variant="outlined"
        >
          Refresh
        </v-btn>
      </div>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = null">
      {{ error }}
    </v-alert>

    <v-alert v-if="uploadSuccess" type="success" variant="tonal" class="mb-4" closable @click:close="uploadSuccess = null">
      {{ uploadSuccess }}
    </v-alert>

    <div class="table-container">
      <v-data-table
        :headers="headers"
        :items="hosts"
        :loading="loading"
        item-key="ip"
        density="compact"
        fixed-header
        height="600"
        @click:row="onRowClick"
        class="hosts-table"
      >
        <template #item.ip="{ item }">
          <span class="ip-link">{{ item.ip }}</span>
        </template>

        <template #item.location="{ item }">
          {{ item.location.city }}, {{ item.location.country }}
        </template>

        <template #item.autonomous_system="{ item }">
          {{ item.autonomous_system.name }}
        </template>

        <template #item.services="{ item }">
          <div class="services-summary">
            <v-chip
              v-for="service in item.services.slice(0, 2)"
              :key="service.port"
              size="small"
              variant="outlined"
              class="mr-1"
            >
              {{ service.protocol }} - {{ service.port }}
            </v-chip>
            <span v-if="item.services.length > 2" class="text-caption">
              +{{ item.services.length - 2 }} more
            </span>
          </div>
        </template>

        <template #item.threat_intelligence="{ item }">
          <v-chip
            :color="getRiskColor(item.threat_intelligence.risk_level)"
            size="small"
            variant="flat"
          >
            {{ item.threat_intelligence.risk_level.toUpperCase() }}
          </v-chip>
        </template>

        <template #bottom></template>
      </v-data-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiService, type Host } from '@/services/api'

const router = useRouter()

const hosts = ref<Host[]>([])
const loading = ref(false)
const uploading = ref(false)
const error = ref<string | null>(null)
const uploadSuccess = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const selectedFileName = ref<string>('')
const fileInput = ref<HTMLInputElement>()

const headers = [
  { title: 'IP Address', key: 'ip', width: 150 },
  { title: 'Location', key: 'location', width: 200 },
  { title: 'AS Name', key: 'autonomous_system', width: 200 },
  { title: 'Services', key: 'services', width: 250 },
  { title: 'Risk Level', key: 'threat_intelligence', align: 'end', width: 120 }
]

async function loadHosts() {
  loading.value = true
  error.value = null

  try {
    hosts.value = await apiService.getHostAssets()
  } catch (err) {
    error.value = 'Failed to load host assets. Please try again.'
    console.error('Error loading hosts:', err)
  } finally {
    loading.value = false
  }
}

function handleUploadClick() {
  // If no file is selected, trigger file selection
  if (!selectedFile.value) {
    if (fileInput.value) {
      fileInput.value.click()
    }
  } else {
    // If file is already selected, proceed with upload
    uploadFile()
  }
}

function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  // Clear previous messages when a new file is selected
  error.value = null
  uploadSuccess.value = null

  if (file) {
    // Validate file type
    if (!file.type.includes('json') && !file.name.endsWith('.json')) {
      error.value = 'Please select a valid JSON file.'
      selectedFile.value = null
      selectedFileName.value = ''
      // Clear the file input
      if (fileInput.value) {
        fileInput.value.value = ''
      }
      return
    }

    selectedFile.value = file
    selectedFileName.value = file.name

    // Automatically proceed with upload after file selection
    uploadFile()
  } else {
    selectedFile.value = null
    selectedFileName.value = ''
  }
}

async function uploadFile() {
  if (!selectedFile.value) {
    error.value = 'Please select a file to upload.'
    return
  }

  uploading.value = true
  error.value = null
  uploadSuccess.value = null

  try {
    await apiService.uploadHostAssets(selectedFile.value)
    uploadSuccess.value = `Successfully uploaded ${selectedFile.value.name}. Refreshing host list...`

    // Clear the file input
    selectedFile.value = null
    selectedFileName.value = ''
    if (fileInput.value) {
      fileInput.value.value = ''
    }

    // Refresh the hosts list after successful upload
    setTimeout(() => {
      loadHosts()
    }, 1000)

  } catch (err) {
    error.value = `Failed to upload ${selectedFile.value?.name || 'file'}. Please try again.`
    console.error('Error uploading file:', err)
  } finally {
    uploading.value = false
  }
}

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

onMounted(() => {
  loadHosts()
})
</script>

<style scoped>
.page {
  padding: 12px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--txt);
}

.table-container {
  border: 1px solid var(--edge);
  background: var(--bg-1);
  border-radius: 14px;
  overflow: hidden;
}

.hosts-table :deep(.v-data-table__wrapper) {
  min-height: 400px;
}

.hosts-table :deep(tbody tr) {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.hosts-table :deep(tbody tr:hover) {
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

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .header-actions {
    flex-direction: column;
    gap: 8px;
  }

  .header-actions .v-file-input {
    max-width: none !important;
  }
}
</style>
