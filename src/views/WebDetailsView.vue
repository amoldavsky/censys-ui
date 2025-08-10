<template>
  <div class="page">
    <div class="header">
      <div class="breadcrumb">
        <v-btn 
          variant="text" 
          prepend-icon="mdi-arrow-left" 
          @click="$router.push('/web')"
          class="back-btn"
        >
          Back to Web Assets
        </v-btn>
      </div>
      
      <div class="title-section">
        <h1 class="title">{{ webAsset?.id || domain }}</h1>
        <v-chip 
          v-if="webAsset"
          :color="getRiskColor(webAsset.security_analysis.risk_level)" 
          size="large" 
          variant="flat"
          class="risk-chip"
        >
          {{ webAsset.security_analysis.risk_level.toUpperCase() }} RISK
        </v-chip>
      </div>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = null">
      {{ error }}
    </v-alert>

    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4">Loading web asset details...</p>
    </div>

    <div v-else-if="webAsset" class="content">
      <!-- Basic Information -->
      <v-card class="info-card mb-6" variant="flat">
        <v-card-title class="text-h6">Certificate Information</v-card-title>
        <v-divider />
        <v-card-text>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Primary Domain</span>
              <span class="value">{{ webAsset.id }}</span>
            </div>
            <div class="info-item">
              <span class="label">Common Name</span>
              <span class="value">{{ webAsset.subject.common_name }}</span>
            </div>
            <div class="info-item">
              <span class="label">Organization</span>
              <span class="value">{{ webAsset.subject.organization || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Issuer</span>
              <span class="value">{{ webAsset.issuer.common_name }}</span>
            </div>
            <div class="info-item">
              <span class="label">Certificate Authority</span>
              <span class="value">{{ webAsset.certificate_authority.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">Validation Level</span>
              <span class="value">{{ webAsset.certificate_authority.validation_level.replace('_', ' ').toUpperCase() }}</span>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Domains -->
      <v-card class="info-card mb-6" variant="flat">
        <v-card-title class="text-h6">Domains ({{ webAsset.domains.length }})</v-card-title>
        <v-divider />
        <v-card-text>
          <div class="domains-container">
            <v-chip 
              v-for="domain in webAsset.domains" 
              :key="domain"
              size="small"
              variant="outlined"
              color="primary"
              class="mr-2 mb-2"
            >
              {{ domain }}
            </v-chip>
          </div>
        </v-card-text>
      </v-card>

      <!-- Validity Period -->
      <v-card class="info-card mb-6" variant="flat">
        <v-card-title class="text-h6">Validity Period</v-card-title>
        <v-divider />
        <v-card-text>
          <div class="validity-info">
            <div class="validity-status">
              <span class="label">Status:</span>
              <v-chip 
                :color="getStatusColor(webAsset.validity_period.status)" 
                variant="flat"
                class="ml-2"
              >
                {{ webAsset.validity_period.status.toUpperCase() }}
              </v-chip>
            </div>
            <div class="validity-dates mt-4">
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Valid From</span>
                  <span class="value">{{ formatDate(webAsset.validity_period.not_before) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Valid Until</span>
                  <span class="value">{{ formatDate(webAsset.validity_period.not_after) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Duration</span>
                  <span class="value">{{ webAsset.validity_period.length_days }} days</span>
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Security Analysis -->
      <v-card class="info-card mb-6" variant="flat">
        <v-card-title class="text-h6">Security Analysis</v-card-title>
        <v-divider />
        <v-card-text>
          <div class="security-info">
            <div class="risk-level">
              <span class="label">Risk Level:</span>
              <v-chip 
                :color="getRiskColor(webAsset.security_analysis.risk_level)" 
                variant="flat"
                class="ml-2"
              >
                {{ webAsset.security_analysis.risk_level.toUpperCase() }}
              </v-chip>
            </div>
            
            <div class="zlint-status mt-4">
              <span class="label">ZLint Status:</span>
              <v-chip 
                :color="webAsset.security_analysis.zlint_status === 'errors_present' ? 'error' : 'warning'"
                variant="flat"
                class="ml-2"
              >
                {{ webAsset.security_analysis.zlint_status.replace('_', ' ').toUpperCase() }}
              </v-chip>
            </div>

            <div v-if="webAsset.security_analysis.notes" class="notes mt-4">
              <span class="label">Notes:</span>
              <p class="notes-text">{{ webAsset.security_analysis.notes }}</p>
            </div>

            <div v-if="webAsset.security_analysis.failed_lints.length > 0" class="failed-lints mt-4">
              <span class="label">Failed Lints ({{ webAsset.security_analysis.failed_lints.length }}):</span>
              <div class="lints-container">
                <v-chip 
                  v-for="lint in webAsset.security_analysis.failed_lints.slice(0, 5)" 
                  :key="lint"
                  size="small"
                  variant="outlined"
                  color="error"
                  class="mr-2 mb-2"
                >
                  {{ lint }}
                </v-chip>
                <span v-if="webAsset.security_analysis.failed_lints.length > 5" class="text-caption">
                  +{{ webAsset.security_analysis.failed_lints.length - 5 }} more
                </span>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Validation -->
      <v-card class="info-card mb-6" variant="flat">
        <v-card-title class="text-h6">Browser Validation</v-card-title>
        <v-divider />
        <v-card-text>
          <div class="validation-info">
            <div class="trusted-status">
              <span class="label">Trusted by Major Browsers:</span>
              <v-chip 
                :color="webAsset.validation.trusted_by_major_browsers ? 'success' : 'error'"
                variant="flat"
                class="ml-2"
              >
                {{ webAsset.validation.trusted_by_major_browsers ? 'YES' : 'NO' }}
              </v-chip>
            </div>
            
            <div class="validation-paths mt-4">
              <span class="label">Validation Paths:</span>
              <div class="paths-grid">
                <div v-for="(trusted, browser) in webAsset.validation.validation_paths" :key="browser" class="path-item">
                  <span class="browser-name">{{ browser.charAt(0).toUpperCase() + browser.slice(1) }}:</span>
                  <v-icon 
                    :color="trusted ? 'success' : 'error'"
                    :icon="trusted ? 'mdi-check-circle' : 'mdi-close-circle'"
                    size="small"
                  />
                </div>
              </div>
            </div>

            <div v-if="webAsset.validation.validation_issues" class="validation-issues mt-4">
              <span class="label">Validation Issues:</span>
              <p class="issues-text">{{ webAsset.validation.validation_issues }}</p>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Threat Intelligence -->
      <v-card v-if="webAsset.threat_intelligence" class="info-card mb-6" variant="flat">
        <v-card-title class="text-h6">Threat Intelligence</v-card-title>
        <v-divider />
        <v-card-text>
          <div class="threat-info">
            <div v-if="webAsset.threat_intelligence.organization_mismatch" class="org-mismatch">
              <v-alert type="warning" variant="tonal" class="mb-4">
                <strong>Organization Mismatch Detected</strong>
              </v-alert>
            </div>
            
            <div v-if="webAsset.threat_intelligence.suspicious_patterns" class="suspicious-patterns">
              <span class="label">Suspicious Patterns:</span>
              <div class="patterns-container">
                <v-chip 
                  v-for="pattern in webAsset.threat_intelligence.suspicious_patterns" 
                  :key="pattern"
                  size="small"
                  variant="outlined"
                  color="warning"
                  class="mr-2 mb-2"
                >
                  {{ pattern }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Certificate Transparency -->
      <v-card class="info-card" variant="flat">
        <v-card-title class="text-h6">Certificate Transparency</v-card-title>
        <v-divider />
        <v-card-text>
          <div class="ct-info">
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Logs Count</span>
                <span class="value">{{ webAsset.certificate_transparency.logs_count }}</span>
              </div>
              <div class="info-item">
                <span class="label">First Seen</span>
                <span class="value">{{ webAsset.certificate_transparency.first_seen ? formatDate(webAsset.certificate_transparency.first_seen) : 'N/A' }}</span>
              </div>
            </div>
            
            <div v-if="webAsset.certificate_transparency.logs.length > 0" class="ct-logs mt-4">
              <span class="label">CT Logs:</span>
              <div class="logs-container">
                <v-chip 
                  v-for="log in webAsset.certificate_transparency.logs.slice(0, 4)" 
                  :key="log"
                  size="small"
                  variant="outlined"
                  class="mr-2 mb-2"
                >
                  {{ log }}
                </v-chip>
                <span v-if="webAsset.certificate_transparency.logs.length > 4" class="text-caption">
                  +{{ webAsset.certificate_transparency.logs.length - 4 }} more
                </span>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { apiService, type WebAsset } from '@/services/api'

const route = useRoute()
const domain = decodeURIComponent(route.params.domain as string)

const webAsset = ref<WebAsset | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function loadWebAssetDetails() {
  loading.value = true
  error.value = null
  
  try {
    webAsset.value = await apiService.getWebAssetByDomain(domain)
  } catch (err) {
    error.value = `Failed to load details for web asset ${domain}. Please try again.`
    console.error('Error loading web asset details:', err)
  } finally {
    loading.value = false
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

function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'success'
    case 'expired': return 'error'
    default: return 'grey'
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadWebAssetDetails()
})
</script>

<style scoped>
.page {
  padding: 12px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 24px;
}

.back-btn {
  margin-bottom: 16px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--txt);
  margin: 0;
}

.risk-chip {
  font-weight: 600;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--txt);
}

.info-card {
  border: 1px solid var(--edge);
  background: var(--bg-1);
  border-radius: 14px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 0.875rem;
  color: #8aa1b5;
  font-weight: 600;
}

.value {
  font-size: 1rem;
  color: var(--txt);
  font-weight: 500;
}

.domains-container {
  margin-top: 8px;
}

.validity-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.validity-status {
  display: flex;
  align-items: center;
}

.security-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.risk-level {
  display: flex;
  align-items: center;
}

.zlint-status {
  display: flex;
  align-items: center;
}

.notes-text {
  margin: 8px 0 0 0;
  font-size: 0.875rem;
  color: var(--txt);
}

.lints-container {
  margin-top: 8px;
}

.validation-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.trusted-status {
  display: flex;
  align-items: center;
}

.paths-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.path-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.browser-name {
  font-size: 0.875rem;
  color: var(--txt);
}

.issues-text {
  margin: 8px 0 0 0;
  font-size: 0.875rem;
  color: var(--txt);
}

.threat-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.patterns-container {
  margin-top: 8px;
}

.ct-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.logs-container {
  margin-top: 8px;
}
</style>
