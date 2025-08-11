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
        <!-- Severity Badge and Summary -->
        <div class="d-flex align-start mb-4">
          <v-chip
            :color="getSeverityColor(summary.severity)"
            variant="flat"
            size="large"
            class="mr-3 mt-1 flex-shrink-0"
          >
            <v-icon left size="small">{{ getSeverityIcon(summary.severity) }}</v-icon>
            {{ summary.severity.toUpperCase() }}
          </v-chip>
          <div class="flex-grow-1">
            <p class="text-body-1 mb-0">{{ summary.summary }}</p>
          </div>
        </div>

        <!-- Key Findings -->
        <div v-if="summary.findings && summary.findings.length > 0" class="mb-4">
          <h4 class="text-subtitle-1 mb-2">
            <v-icon class="mr-1" size="small">mdi-magnify</v-icon>
            Key Findings
          </h4>
          <ul class="findings-list">
            <li v-for="finding in summary.findings" :key="finding" class="mb-1">
              {{ finding }}
            </li>
          </ul>
        </div>

        <!-- Recommendations -->
        <div v-if="summary.recommendations && summary.recommendations.length > 0" class="mb-4">
          <h4 class="text-subtitle-1 mb-2">
            <v-icon class="mr-1" size="small">mdi-lightbulb-outline</v-icon>
            Recommendations
          </h4>
          <ul class="recommendations-list">
            <li v-for="recommendation in summary.recommendations" :key="recommendation" class="mb-1">
              {{ recommendation }}
            </li>
          </ul>
        </div>

        <!-- Evidence Extras -->
        <div v-if="summary.evidence_extras && summary.evidence_extras.length > 0" class="mb-4">
          <h4 class="text-subtitle-1 mb-2">
            <v-icon class="mr-1" size="small">mdi-information-outline</v-icon>
            Additional Evidence
          </h4>
          <ul class="evidence-list">
            <li v-for="extra in summary.evidence_extras" :key="extra" class="mb-1">
              {{ extra }}
            </li>
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
              <div v-if="summary.assumptions && summary.assumptions.length > 0" class="mb-3">
                <h5 class="text-caption font-weight-bold mb-1">Assumptions:</h5>
                <ul class="text-caption">
                  <li v-for="assumption in summary.assumptions" :key="assumption">
                    {{ assumption }}
                  </li>
                </ul>
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
import { ref, onMounted, watch } from 'vue'
import { apiService, type SecuritySummary } from '@/services/api'

interface Props {
  domain?: string
  ip?: string
}

interface Emits {
  (e: 'summaryLoaded', summaryId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const summary = ref<SecuritySummary | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const showDetails = ref(false)

async function loadSecuritySummary() {
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
      return
    }

    // Check if data has status field (incomplete) or full summary (complete)
    if ('status' in response.data && (response.data.status === 'pending' || response.data.status === 'processing')) {
      // Status is pending or processing, poll for updates
      pollForCompletion()
    } else {
      // Data is complete summary
      summary.value = response.data as SecuritySummary
      loading.value = false
      // Emit the summary ID for chat context
      emit('summaryLoaded', summary.value.id)
    }
  } catch (err) {
    error.value = 'Failed to load security summary. Please try again.'
    console.error('Error loading security summary:', err)
    loading.value = false
  }
}

async function pollForCompletion() {
  const maxAttempts = 30 // 30 attempts with 2 second intervals = 1 minute max
  let attempts = 0
  
  const poll = async () => {
    if (attempts >= maxAttempts) {
      error.value = 'Security analysis timed out. Please try again.'
      loading.value = false
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
        return
      }

      if (!response.success) {
        error.value = response.error || 'Security analysis failed'
        loading.value = false
        return
      }

      // Check if data has status field (incomplete) or full summary (complete)
      if ('status' in response.data && (response.data.status === 'pending' || response.data.status === 'processing')) {
        // Still processing, continue polling
        attempts++
        setTimeout(poll, 1000)
      } else {
        // Data is complete summary
        summary.value = response.data as SecuritySummary
        loading.value = false
        // Emit the summary ID for chat context
        emit('summaryLoaded', summary.value.id)
      }
    } catch (err) {
      error.value = 'Failed to check analysis status. Please try again.'
      loading.value = false
      console.error('Error polling security summary:', err)
    }
  }
  
  setTimeout(poll, 1000)
}

function retryAnalysis() {
  loadSecuritySummary()
}

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

// Watch for domain or IP changes
watch([() => props.domain, () => props.ip], () => {
  loadSecuritySummary()
})

onMounted(() => {
  loadSecuritySummary()
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
