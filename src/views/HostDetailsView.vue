<template>
  <div class="page">
    <div class="header">
      <div class="breadcrumb">
        <v-btn 
          variant="text" 
          prepend-icon="mdi-arrow-left" 
          @click="$router.push('/hosts')"
          class="back-btn"
        >
          Back to Hosts
        </v-btn>
      </div>
      
      <div class="title-section">
        <h1 class="title">{{ host?.ip || ip }}</h1>
        <v-chip 
          v-if="host"
          :color="getRiskColor(host.threat_intelligence.risk_level)" 
          size="large" 
          variant="flat"
          class="risk-chip"
        >
          {{ host.threat_intelligence.risk_level.toUpperCase() }} RISK
        </v-chip>
      </div>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = null">
      {{ error }}
    </v-alert>

    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4">Loading host details...</p>
    </div>

    <div v-else-if="host" class="content">
      <!-- Basic Information -->
      <v-card class="info-card mb-6" variant="flat">
        <v-card-title class="text-h6">Basic Information</v-card-title>
        <v-divider />
        <v-card-text>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">IP Address</span>
              <span class="value">{{ host.ip }}</span>
            </div>
            <div class="info-item">
              <span class="label">Location</span>
              <span class="value">{{ host.location.city }}, {{ host.location.country }}</span>
            </div>
            <div class="info-item">
              <span class="label">Country Code</span>
              <span class="value">{{ host.location.country_code }}</span>
            </div>
            <div class="info-item">
              <span class="label">Coordinates</span>
              <span class="value">{{ host.location.coordinates.latitude }}, {{ host.location.coordinates.longitude }}</span>
            </div>
            <div class="info-item">
              <span class="label">ASN</span>
              <span class="value">{{ host.autonomous_system.asn }}</span>
            </div>
            <div class="info-item">
              <span class="label">AS Name</span>
              <span class="value">{{ host.autonomous_system.name }}</span>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Threat Intelligence -->
      <v-card class="info-card mb-6" variant="flat">
        <v-card-title class="text-h6">Threat Intelligence</v-card-title>
        <v-divider />
        <v-card-text>
          <div class="threat-info">
            <div class="risk-level">
              <span class="label">Risk Level:</span>
              <v-chip 
                :color="getRiskColor(host.threat_intelligence.risk_level)" 
                variant="flat"
                class="ml-2"
              >
                {{ host.threat_intelligence.risk_level.toUpperCase() }}
              </v-chip>
            </div>
            <div class="security-labels mt-4">
              <span class="label">Security Labels:</span>
              <div class="labels-container">
                <v-chip 
                  v-for="label in host.threat_intelligence.security_labels" 
                  :key="label"
                  size="small"
                  variant="outlined"
                  color="warning"
                  class="mr-2 mb-2"
                >
                  {{ label }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Services -->
      <v-card class="info-card" variant="flat">
        <v-card-title class="text-h6">Services ({{ host.services.length }})</v-card-title>
        <v-divider />
        <v-card-text>
          <div class="services-list">
            <v-expansion-panels v-if="host.services.length > 0" variant="accordion">
              <v-expansion-panel 
                v-for="(service, index) in host.services" 
                :key="index"
                class="service-panel"
              >
                <v-expansion-panel-title>
                  <div class="service-header">
                    <div class="service-basic">
                      <span class="protocol">{{ service.protocol }}</span>
                      <span class="port">Port {{ service.port }}</span>
                    </div>
                    <div class="vulnerability-count">
                      <v-chip 
                        v-if="service.vulnerabilities.length > 0"
                        :color="getHighestSeverityColor(service.vulnerabilities)"
                        size="small"
                        variant="flat"
                      >
                        {{ service.vulnerabilities.length }} {{ service.vulnerabilities.length === 1 ? 'vulnerability' : 'vulnerabilities' }}
                      </v-chip>
                    </div>
                  </div>
                </v-expansion-panel-title>
                
                <v-expansion-panel-text>
                  <div class="service-details">
                    <div class="banner mb-4">
                      <span class="label">Banner:</span>
                      <code class="banner-text">{{ service.banner }}</code>
                    </div>
                    
                    <div v-if="service.software.length > 0" class="software mb-4">
                      <span class="label">Software:</span>
                      <div class="software-list">
                        <v-chip 
                          v-for="software in service.software" 
                          :key="`${software.vendor}-${software.product}`"
                          size="small"
                          variant="outlined"
                          class="mr-2 mb-2"
                        >
                          {{ software.vendor }} {{ software.product }} {{ software.version }}
                        </v-chip>
                      </div>
                    </div>
                    
                    <div v-if="service.vulnerabilities.length > 0" class="vulnerabilities">
                      <span class="label">Vulnerabilities:</span>
                      <div class="vulnerability-list">
                        <v-card 
                          v-for="vuln in service.vulnerabilities" 
                          :key="vuln.cve_id"
                          class="vulnerability-card mb-2"
                          variant="outlined"
                        >
                          <v-card-text class="pa-3">
                            <div class="vuln-header">
                              <span class="cve-id">{{ vuln.cve_id }}</span>
                              <v-chip 
                                :color="getSeverityColor(vuln.severity)"
                                size="small"
                                variant="flat"
                              >
                                {{ vuln.severity.toUpperCase() }}
                              </v-chip>
                              <span class="cvss-score">CVSS: {{ vuln.cvss_score }}</span>
                            </div>
                            <p class="vuln-description mt-2">{{ vuln.description }}</p>
                          </v-card-text>
                        </v-card>
                      </div>
                    </div>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
            
            <div v-else class="no-services">
              <v-icon size="48" color="grey">mdi-server-off</v-icon>
              <p class="mt-2 text-grey">No services detected</p>
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
import { apiService, type Host, type Vulnerability } from '@/services/api'

const route = useRoute()
const ip = route.params.ip as string

const host = ref<Host | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function loadHostDetails() {
  loading.value = true
  error.value = null
  
  try {
    host.value = await apiService.getHostAssetByIp(ip)
  } catch (err) {
    error.value = `Failed to load details for host ${ip}. Please try again.`
    console.error('Error loading host details:', err)
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

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'error'
    case 'high': return 'warning'
    case 'medium': return 'info'
    case 'low': return 'success'
    default: return 'grey'
  }
}

function getHighestSeverityColor(vulnerabilities: Vulnerability[]): string {
  const severityOrder = ['critical', 'high', 'medium', 'low']
  
  for (const severity of severityOrder) {
    if (vulnerabilities.some(v => v.severity === severity)) {
      return getSeverityColor(severity)
    }
  }
  
  return 'grey'
}

onMounted(() => {
  loadHostDetails()
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

.threat-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.risk-level {
  display: flex;
  align-items: center;
}

.labels-container {
  margin-top: 8px;
}

.service-panel {
  margin-bottom: 8px;
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.service-basic {
  display: flex;
  align-items: center;
  gap: 12px;
}

.protocol {
  font-weight: 600;
  color: var(--pri);
}

.port {
  color: var(--txt);
}

.service-details {
  padding-top: 8px;
}

.banner-text {
  background: rgba(0, 0, 0, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  margin-left: 8px;
}

.software-list {
  margin-top: 8px;
}

.vulnerability-list {
  margin-top: 8px;
}

.vulnerability-card {
  border: 1px solid var(--edge);
}

.vuln-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cve-id {
  font-weight: 600;
  color: var(--pri);
}

.cvss-score {
  font-size: 0.875rem;
  color: #8aa1b5;
}

.vuln-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--txt);
}

.no-services {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
}
</style>
