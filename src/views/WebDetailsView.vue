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
      </div>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = null">
      {{ error }}
    </v-alert>

    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4">Loading web asset details...</p>
    </div>

    <div v-else-if="webAsset" class="content-with-chat">
      <div class="main-content">
        <!-- AI Security Summary - Show when webAsset is loaded -->
        <AiSecuritySummary :domain="domain" />

          <!-- Basic Information -->
          <v-card class="info-card mb-6" variant="flat">
        <v-card-title class="text-h6">Web Asset Information</v-card-title>
        <v-divider />
        <v-card-text>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Primary Domain</span>
              <span class="value">{{ webAsset.id }}</span>
            </div>
            <div class="info-item">
              <span class="label">Source</span>
              <span class="value">{{ webAsset.source }}</span>
            </div>
            <div class="info-item">
              <span class="label">Certificate Authority</span>
              <span class="value">{{ webAsset.certificate_authority }}</span>
            </div>
            <div class="info-item">
              <span class="label">Status</span>
              <div class="chip-container">
                <v-chip
                  :color="getStatusColor(webAsset.status)"
                  variant="flat"
                  size="small"
                >
                  {{ webAsset.status.toUpperCase() }}
                </v-chip>
              </div>
            </div>
            <div class="info-item">
              <span class="label">Risk Level</span>
              <div class="chip-container">
                <v-chip
                  :color="getRiskColor(webAsset.risks)"
                  variant="flat"
                  size="small"
                >
                  {{ webAsset.risks.toUpperCase() }}
                </v-chip>
              </div>
            </div>
            <div class="info-item">
              <span class="label">Created</span>
              <span class="value">{{ formatDate(webAsset.created_at) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Last Updated</span>
              <span class="value">{{ formatDate(webAsset.updated_at) }}</span>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Domains -->
      <v-card class="info-card" variant="flat">
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
      </div>

      <!-- AI Chat Component -->
      <AiChat
        asset-type="web"
        :asset-data="webAsset"
        :suggestions="webSuggestions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { apiService, type WebAsset } from '@/services/api'
import AiChat from '@/components/AiChat.vue'
import AiSecuritySummary from '@/components/AiSecuritySummary.vue'

const route = useRoute()
const domain = decodeURIComponent(route.params.domain as string)

const webAsset = ref<WebAsset | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// AI Chat suggestions for web assets
const webSuggestions = [
  { text: "What are the certificate security issues?", icon: "mdi-certificate" },
  { text: "Analyze the SSL/TLS configuration", icon: "mdi-lock" },
  { text: "What domains are associated with this asset?", icon: "mdi-web" },
  { text: "How can I improve web security?", icon: "mdi-shield-check" }
]

async function loadWebAssetDetails() {
  loading.value = true
  error.value = null
  
  try {
    webAsset.value = await apiService.getWebAssetByDomain(domain)
    console.log('Loaded web asset details:', webAsset.value)
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
  max-width: 1600px; /* Increased to accommodate chat */
  margin: 0 auto;
}

.content-with-chat {
  margin-right: 320px; /* Make space for fixed chat */
}

.main-content {
  width: 100%;
}

/* Responsive layout adjustments */
@media (max-width: 960px) {
  .content-with-chat {
    margin-right: 0; /* Remove margin when chat is hidden */
  }

  .page {
    max-width: 1200px;
    padding: 8px;
  }
}

@media (max-width: 600px) {
  .page {
    padding: 4px;
  }
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

.chip-container {
  display: flex;
  align-items: flex-start;
}
</style>
