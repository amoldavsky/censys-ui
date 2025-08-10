<template>
  <div class="page">
    <div class="header">
      <h1 class="title">Web Assets</h1>
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
          @click="loadWebAssets"
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
        :items="webAssets"
        :loading="loading"
        item-key="id"
        density="compact"
        fixed-header
        height="600"
        @click:row="onRowClick"
        class="web-assets-table"
      >
        <template #item.id="{ item }">
          <span class="domain-link">{{ item.id }}</span>
        </template>

        <template #item.domains="{ item }">
          <div class="domains-summary">
            <v-chip
              v-for="domain in (item.domains || []).slice(0, 2)"
              :key="domain"
              size="small"
              variant="outlined"
              class="mr-1"
            >
              {{ domain }}
            </v-chip>
            <span v-if="item.domains && item.domains.length > 2" class="text-caption">
              +{{ item.domains.length - 2 }} more
            </span>
          </div>
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

        <template #bottom></template>
      </v-data-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiService, type WebAsset } from '@/services/api'

const router = useRouter()

const webAssets = ref<WebAsset[]>([])
const loading = ref(false)
const uploading = ref(false)
const error = ref<string | null>(null)
const uploadSuccess = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const selectedFileName = ref<string>('')
const fileInput = ref<HTMLInputElement>()

const headers = [
  { title: 'Domain', key: 'id', width: 200 },
  { title: 'All Domains', key: 'domains', width: 250 },
  { title: 'Certificate Authority', key: 'certificate_authority', width: 200 },
  { title: 'Status', key: 'validity_period', width: 120 },
  { title: 'Risk Level', key: 'security_analysis', align: 'end', width: 120 }
]

async function loadWebAssets() {
  loading.value = true
  error.value = null

  try {
    webAssets.value = await apiService.getWebAssets()
    console.log('Loaded web assets:', webAssets.value)
  } catch (err) {
    error.value = 'Failed to load web assets. Please try again.'
    console.error('Error loading web assets:', err)
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
    await apiService.uploadWebAssets(selectedFile.value)
    uploadSuccess.value = `Successfully uploaded ${selectedFile.value.name}. Refreshing web assets list...`

    // Clear the file input
    selectedFile.value = null
    selectedFileName.value = ''
    if (fileInput.value) {
      fileInput.value.value = ''
    }

    // Refresh the web assets list after successful upload
    setTimeout(() => {
      loadWebAssets()
    }, 1000)

  } catch (err) {
    error.value = `Failed to upload ${selectedFile.value?.name || 'file'}. Please try again.`
    console.error('Error uploading file:', err)
  } finally {
    uploading.value = false
  }
}

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

onMounted(() => {
  loadWebAssets()
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

.web-assets-table :deep(.v-data-table__wrapper) {
  min-height: 400px;
}

.web-assets-table :deep(tbody tr) {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.web-assets-table :deep(tbody tr:hover) {
  background-color: rgba(0, 229, 168, 0.05);
}

.domain-link {
  color: var(--pri);
  font-weight: 500;
}

.domains-summary {
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
}
</style>
