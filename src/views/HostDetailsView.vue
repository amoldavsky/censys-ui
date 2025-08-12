<template>
  <div class="page">
    <div class="header">
      <div class="breadcrumb">
        <v-btn
          variant="text"
          prepend-icon="mdi-arrow-left"
          @click="navigateBack"
          class="back-btn"
        >
          Back to Hosts
        </v-btn>
      </div>
      
      <div class="title-section">
        <h1 class="title">{{ host?.ip || ip }}</h1>
        <v-chip 
          v-if="host"
          :color="getRiskColor(host.risk)" 
          size="large" 
          variant="flat"
          class="risk-chip"
        >
          {{ host.risk.toUpperCase() }} RISK
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

    <div v-else-if="host" class="content-with-chat">
      <div class="main-content">
        <!-- AI Security Summary - Using simplified version -->
        <AiSecuritySummarySimple :key="`host-summary-${ip}`" :ip="ip" @summary-loaded="onSummaryLoaded" />

        <!-- Basic Information -->
        <v-card class="info-card mb-6" variant="flat">
        <v-card-title class="text-h6">Host Information</v-card-title>
        <v-divider />
        <v-card-text>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">IP Address</span>
              <span class="value">{{ host.ip }}</span>
            </div>
            <div class="info-item">
              <span class="label">Source</span>
              <span class="value">{{ host.source }}</span>
            </div>
            <div class="info-item">
              <span class="label">AS Name</span>
              <span class="value">{{ host.as_name }}</span>
            </div>
            <div class="info-item">
              <span class="label">Location</span>
              <span class="value">{{ host.location.city }}, {{ host.location.country }}</span>
            </div>
            <div class="info-item">
              <span class="label">Risk Level</span>
              <div class="chip-container">
                <v-chip
                  :color="getRiskColor(host.risk)"
                  variant="flat"
                  size="small"
                >
                  {{ host.risk.toUpperCase() }}
                </v-chip>
              </div>
            </div>
            <div class="info-item">
              <span class="label">Created</span>
              <span class="value">{{ formatDate(host.created_at) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Last Updated</span>
              <span class="value">{{ formatDate(host.updated_at) }}</span>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Location Map -->
      <v-card class="info-card mb-6" variant="flat">
        <v-card-title class="text-h6">Location</v-card-title>
        <v-divider />
        <v-card-text class="pa-0">
          <div class="map-container">
            <div ref="mapContainer" class="leaflet-map">
              <div v-if="!map" class="map-loading">
                <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
                <p class="mt-2">Loading map...</p>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Services -->
      <v-card class="info-card" variant="flat">
        <v-card-title class="text-h6">Services ({{ host.services?.length || 0 }})</v-card-title>
        <v-divider />
        <v-card-text>
          <div class="services-list">
            <v-expansion-panels
              v-if="host.services && host.services.length > 0"
              variant="accordion"
              multiple
              v-model="expandedPanels"
            >
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
                  </div>
                </v-expansion-panel-title>
                
                <v-expansion-panel-text>
                  <div class="service-details">
                    <div class="banner mb-4">
                      <span class="label">Banner:</span>
                      <code class="banner-text">{{ service.banner || 'N/A' }}</code>
                    </div>
                    
                    <div v-if="service.software && service.software.length > 0" class="software mb-4">
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
                    
                    <div v-if="service.vulnerabilities && service.vulnerabilities.length > 0" class="vulnerabilities">
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

      <!-- AI Chat Component -->
      <AiChat
        :key="`host-chat-${ip}`"
        asset-type="host"
        :asset-data="host"
        :suggestions="hostSuggestions"
        :summary-id="summaryId"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiService, type Host, type Location } from '@/services/api'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import AiChat from '@/components/AiChat.vue'
import AiSecuritySummarySimple from '@/components/AiSecuritySummarySimple.vue'

const route = useRoute()
const router = useRouter()
const ip = route.params.ip as string

const host = ref<Host | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const expandedPanels = ref<number[]>([])
const mapContainer = ref<HTMLElement>()
const map = ref<L.Map | null>(null)
const summaryId = ref<string | null>(null)
const mapInitTimeoutId = ref<number | null>(null)

// AI Chat suggestions for host assets
const hostSuggestions = [
  { text: "What are the main security risks for this host?", icon: "mdi-shield-alert" },
  { text: "Explain the vulnerabilities found", icon: "mdi-bug" },
  { text: "What services are running on this host?", icon: "mdi-server" },
  { text: "What should I prioritize for remediation?", icon: "mdi-format-list-numbered" },
  { text: "How can I secure this host better?", icon: "mdi-security" },
  { text: "What monitoring should I set up?", icon: "mdi-monitor-eye" }
]

async function loadHostDetails() {
  loading.value = true
  error.value = null
  
  try {
    host.value = await apiService.getHostAssetByIp(ip)
    console.log('Loaded host details:', host.value)

    // Expand all service panels by default
    if (host.value?.services) {
      expandedPanels.value = host.value.services.map((_, index) => index)
    }

    // Initialize map after host data is loaded
    await nextTick()
    mapInitTimeoutId.value = window.setTimeout(() => {
      initializeMap()
      mapInitTimeoutId.value = null
    }, 100)
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function initializeMap() {
  console.log('Initializing map...')
  console.log('mapContainer.value:', mapContainer.value)
  console.log('host.value?.location:', host.value?.location)

  if (!mapContainer.value || !host.value?.location) {
    console.error('Map container or location not available')
    return
  }

  const lat = host.value.location.coordinates.latitude
  const lng = host.value.location.coordinates.longitude

  console.log('Coordinates:', lat, lng)

  try {
    // Initialize the map
    map.value = L.map(mapContainer.value).setView([lat, lng], 10)
    console.log('Map initialized')

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.value)
    console.log('Tiles added')

    // Create custom red marker
    const redIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div class="marker-pin">
               <div class="marker-icon"></div>
             </div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 20]
    })

    // Add marker with popup
    L.marker([lat, lng], { icon: redIcon })
      .addTo(map.value)
      .bindPopup(`
        <div class="marker-popup">
          <strong>${host.value.location.city}</strong><br>
          ${host.value.location.country}<br>
          <small>IP: ${host.value.ip}</small>
        </div>
      `)
      .openPopup()

    console.log('Marker added')
  } catch (error) {
    console.error('Error initializing map:', error)
  }
}

function onSummaryLoaded(id: string) {
  summaryId.value = id
}

function navigateBack() {
  router.push('/hosts')
}

onMounted(() => {
  loadHostDetails()
})

onBeforeUnmount(() => {
  // Clean up any pending map initialization timeout
  if (mapInitTimeoutId.value) {
    clearTimeout(mapInitTimeoutId.value)
    mapInitTimeoutId.value = null
  }

  // Clean up the Leaflet map to prevent memory leaks and unmounting errors
  if (map.value) {
    map.value.remove()
    map.value = null
  }
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

.main-content-only {
  margin-right: 0; /* No chat component */
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

.chip-container {
  display: flex;
  align-items: flex-start;
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

/* Map Widget Styles */
.map-container {
  position: relative;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
}

.leaflet-map {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: #e5e7eb;
}

.map-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--txt);
}

/* Custom Leaflet Marker Styles */
:deep(.custom-marker) {
  background: transparent !important;
  border: none !important;
}

.marker-pin {
  position: relative;
  width: 20px;
  height: 20px;
}

.marker-icon {
  width: 16px;
  height: 16px;
  background: #ef4444;
  border: 2px solid white;
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 2px;
  animation: pulse 2s infinite;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.marker-icon::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 6px solid #ef4444;
}

:deep(.marker-popup) {
  font-family: inherit;
  text-align: center;
}

@keyframes pulse {
  0% {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  70% {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 8px rgba(239, 68, 68, 0);
  }
  100% {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(239, 68, 68, 0);
  }
}
</style>
