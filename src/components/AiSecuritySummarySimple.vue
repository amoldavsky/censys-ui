<template>
  <v-card class="ai-summary-card mb-6" variant="flat" :loading="loading">
    <template #loader="{ isActive }">
      <v-progress-linear
        :active="isActive"
        color="primary"
        height="4"
        indeterminate
      />
    </template>

    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-robot</v-icon>
      <span class="text-h6">AI Security Summary</span>
    </v-card-title>
    <v-divider />

    <v-card-text>
      <!-- Error State -->
      <div v-if="error" class="error-container">
        <v-alert type="error" variant="tonal" class="mb-4">
          <v-alert-title>Analysis Failed</v-alert-title>
          {{ error }}
        </v-alert>
        <v-btn
          variant="outlined"
          color="primary"
          @click="retryAnalysis"
          :loading="loading"
        >
          <v-icon left>mdi-refresh</v-icon>
          Retry Analysis
        </v-btn>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="loading-container">
        <div class="text-center pa-6">
          <div class="text-h6 mb-2">Analyzing Security...</div>
          <div class="text-body-1 text-medium-emphasis mb-4">
            Our AI is analyzing the security posture of this {{ domain ? 'web' : 'host' }} asset
          </div>
          <v-skeleton-loader
            type="card"
            :loading="true"
            height="200"
          />
        </div>
      </div>

      <!-- Summary Content -->
      <div v-else-if="summary" class="summary-content">
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="d-flex align-center">
            <v-icon :color="getSeverityColor(summary.severity)" class="mr-2">
              {{ getSeverityIcon(summary.severity) }}
            </v-icon>
            <span class="text-h6">{{ summary.severity?.toUpperCase() || 'UNKNOWN' }} RISK</span>
          </div>
          <v-chip color="success" size="small" variant="flat">
            AI Analysis Complete
          </v-chip>
        </div>

        <!-- Summary Text -->
        <div v-if="summary.summary" class="mb-4">
          <h4 class="text-subtitle-1 font-weight-bold mb-2">Summary:</h4>
          <p class="text-body-1">{{ summary.summary }}</p>
        </div>

        <div v-if="summary.findings && summary.findings.length > 0" class="mb-4">
          <h4 class="text-subtitle-1 font-weight-bold mb-2">Key Findings:</h4>
          <ul class="findings-list">
            <li v-for="finding in summary.findings" :key="finding">{{ finding }}</li>
          </ul>
        </div>

        <div v-if="summary.recommendations && summary.recommendations.length > 0" class="mb-4">
          <h4 class="text-subtitle-1 font-weight-bold mb-2">Recommendations:</h4>
          <ul class="recommendations-list">
            <li v-for="recommendation in summary.recommendations" :key="recommendation">{{ recommendation }}</li>
          </ul>
        </div>

        <div v-if="summary.assumptions && summary.assumptions.length > 0" class="mb-4">
          <h4 class="text-subtitle-1 font-weight-bold mb-2">Assumptions:</h4>
          <ul class="evidence-list">
            <li v-for="assumption in summary.assumptions" :key="assumption">{{ assumption }}</li>
          </ul>
        </div>

        <!-- Data Coverage -->
        <div class="data-coverage mt-4 pt-3" style="border-top: 1px solid var(--v-border-color);">
          <div class="d-flex align-center justify-between">
            <span class="text-caption text-medium-emphasis">
              Data Coverage: {{ summary.data_coverage?.fields_present_pct || 0 }}%
            </span>
            <v-btn
              variant="text"
              size="small"
              @click="showDetails = !showDetails"
            >
              {{ showDetails ? 'Hide' : 'Show' }} Details
              <v-icon right size="small">
                {{ showDetails ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
              </v-icon>
            </v-btn>
          </div>

          <v-expand-transition>
            <div v-show="showDetails" class="mt-3">
              <div class="text-caption text-medium-emphasis mb-2">
                Analysis based on available data fields. Missing fields may limit assessment accuracy.
              </div>

              <div v-if="summary.data_coverage && summary.data_coverage.missing_fields && summary.data_coverage.missing_fields.length > 0">
                <h5 class="text-caption font-weight-bold mb-1">Missing Fields:</h5>
                <div class="d-flex flex-wrap gap-1">
                  <v-chip
                    v-for="field in summary.data_coverage.missing_fields"
                    :key="field"
                    size="x-small"
                    variant="outlined"
                    color="warning"
                  >
                    {{ field }}
                  </v-chip>
                </div>
              </div>
            </div>
          </v-expand-transition>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { apiService } from '@/services/api'

// Define the actual API response structure
interface ActualSecuritySummary {
  id: string
  summary: string
  severity: string
  evidence: any
  findings: string[]
  recommendations: string[]
  assumptions: string[]
  data_coverage: {
    fields_present_pct: number
    missing_fields: string[]
  }
  created_at: string
  updated_at: string
  _id: string
  status: string
}

interface Props {
  domain?: string
  ip?: string
}

interface Emits {
  (e: 'summaryLoaded', summaryId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(true)
const error = ref<string | null>(null)
const summary = ref<ActualSecuritySummary | null>(null)
const showDetails = ref(false)
const isUnmounting = ref(false)
const pollTimeoutId = ref<number | null>(null)

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'error'
    case 'high': return 'warning'
    case 'medium': return 'info'
    case 'low': return 'success'
    default: return 'grey'
  }
}

function getSeverityIcon(severity: string): string {
  switch (severity) {
    case 'critical': return 'mdi-alert-circle'
    case 'high': return 'mdi-alert'
    case 'medium': return 'mdi-alert-outline'
    case 'low': return 'mdi-check-circle'
    default: return 'mdi-help-circle'
  }
}

async function loadSecuritySummary() {
  if (isUnmounting.value) return

  loading.value = true
  error.value = null
  summary.value = null

  try {
    let response
    if (props.domain) {
      response = await apiService.getWebSecuritySummary(props.domain)
    } else if (props.ip) {
      response = await apiService.getHostSecuritySummary(props.ip)
    } else {
      error.value = 'Either domain or IP must be provided'
      loading.value = false
      return
    }

    if (!response.success) {
      error.value = response.error || 'Security analysis failed'
      loading.value = false
      return
    }

    // Check if data has status field (incomplete) or full summary (complete)
    if ('status' in response.data && (response.data.status === 'pending' || response.data.status === 'processing')) {
      // Status is pending or processing, poll for updates
      pollForCompletion()
    } else {
      // Data is complete summary
      summary.value = response.data as ActualSecuritySummary
      loading.value = false
      // Emit the summary ID for chat context
      emit('summaryLoaded', summary.value.id)
    }
  } catch (err) {
    if (!isUnmounting.value) {
      error.value = 'Failed to load security summary. Please try again.'
      loading.value = false
      console.error('Error loading security summary:', err)
    }
  }
}

async function pollForCompletion() {
  const maxAttempts = 30 // 30 attempts with 1 second intervals = 30 seconds max
  let attempts = 0

  const poll = async () => {
    if (isUnmounting.value) {
      pollTimeoutId.value = null
      return
    }

    if (attempts >= maxAttempts) {
      error.value = 'Security analysis timed out. Please try again.'
      loading.value = false
      pollTimeoutId.value = null
      return
    }

    try {
      let response
      if (props.domain) {
        response = await apiService.getWebSecuritySummary(props.domain)
      } else if (props.ip) {
        response = await apiService.getHostSecuritySummary(props.ip)
      } else {
        error.value = 'Either domain or IP must be provided'
        loading.value = false
        pollTimeoutId.value = null
        return
      }

      if (!response.success) {
        if (!isUnmounting.value) {
          error.value = response.error || 'Security analysis failed'
          loading.value = false
        }
        pollTimeoutId.value = null
        return
      }

      // Check if data has status field (incomplete) or full summary (complete)
      if ('status' in response.data && (response.data.status === 'pending' || response.data.status === 'processing')) {
        // Still processing, continue polling
        attempts++
        if (!isUnmounting.value) {
          pollTimeoutId.value = window.setTimeout(poll, 1000)
        }
      } else {
        // Data is complete summary
        if (!isUnmounting.value) {
          summary.value = response.data as ActualSecuritySummary
          loading.value = false
          // Emit the summary ID for chat context
          emit('summaryLoaded', summary.value.id)
        }
        pollTimeoutId.value = null
      }
    } catch (err) {
      if (!isUnmounting.value) {
        error.value = 'Failed to check analysis status. Please try again.'
        loading.value = false
        console.error('Error polling security summary:', err)
      }
      pollTimeoutId.value = null
    }
  }

  pollTimeoutId.value = window.setTimeout(poll, 1000)
}

function retryAnalysis() {
  loadSecuritySummary()
}

onMounted(() => {
  loadSecuritySummary()
})

onBeforeUnmount(() => {
  // Set unmounting flag to prevent any new operations
  isUnmounting.value = true

  // Clean up any pending polling timeout
  if (pollTimeoutId.value) {
    clearTimeout(pollTimeoutId.value)
    pollTimeoutId.value = null
  }
})
</script>

<style scoped>
.ai-summary-card {
  border: 1px solid var(--v-border-color);
}

.loading-container {
  min-height: 280px;
}

.summary-content {
  /* Add any specific styling for summary content */
}

.findings-list,
.recommendations-list,
.evidence-list {
  list-style-type: disc;
  padding-left: 20px;
  margin: 0;
}

.findings-list li,
.recommendations-list li,
.evidence-list li {
  margin-bottom: 4px;
  line-height: 1.4;
}

.data-coverage {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 4px;
  padding: 12px;
}

.gap-1 {
  gap: 4px;
}
</style>
