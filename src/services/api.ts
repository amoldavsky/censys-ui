// API service for host and web asset data
import mockHosts from '@/mock/hosts.json'
import mockWebAssets from '@/mock/web.json'

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1`

// Configuration: Set to false to use real API, true to use mock data
const USE_MOCK_DATA = false;

export interface Location {
  city: string
  country: string
  country_code: string
  coordinates: {
    latitude: number
    longitude: number
  }
}

export interface AutonomousSystem {
  asn: number
  name: string
  country_code: string
}

export interface Software {
  product: string
  vendor: string
  version: string
}

export interface Vulnerability {
  cve_id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  cvss_score: number
  description: string
}

export interface Service {
  port: number
  protocol: string
  banner: string
  software: Software[]
  vulnerabilities: Vulnerability[]
}

export interface ThreatIntelligence {
  security_labels: string[]
  risk_level: 'critical' | 'high' | 'medium' | 'low'
}

// Simple Host interface matching the actual API response
export interface Host {
  id: string
  source: string
  created_at: string
  updated_at: string
  ip: string
  as_name: string
  services: Service[]
  risk: 'low' | 'medium' | 'high' | 'critical'
  location: Location // Location data for map display
}

// Legacy complex interface (keeping for reference)
export interface ComplexHost {
  ip: string
  location: Location
  autonomous_system: AutonomousSystem
  services: Service[]
  threat_intelligence: ThreatIntelligence
}

// Web Asset Interfaces
export interface WebAssetSubject {
  common_name: string
  organization: string | null
  country: string | null
}

export interface WebAssetIssuer {
  common_name: string
  organization: string
  country: string
}

export interface ValidityPeriod {
  not_before: string
  not_after: string
  length_days: number
  status: 'active' | 'expired'
}

export interface KeyInfo {
  algorithm: string
  key_size: number
  public_key_fingerprint: string
}

export interface CertificateAuthority {
  name: string
  type: 'public_ca' | 'commercial_ca'
  validation_level: 'domain_validated' | 'organization_validated'
}

export interface CertificateTransparency {
  logs_count: number
  first_seen: string | null
  logs: string[]
}

export interface ValidationPaths {
  apple: boolean
  chrome: boolean
  microsoft: boolean
  mozilla: boolean
}

export interface Validation {
  trusted_by_major_browsers: boolean
  validation_paths: ValidationPaths
  expiry_status?: string
  validation_issues?: string
}

export interface SecurityAnalysis {
  zlint_status: 'errors_present' | 'notices_present'
  failed_lints: string[]
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  notes?: string
}

export interface WebThreatIntelligence {
  organization_mismatch?: boolean
  suspicious_patterns?: string[]
}

export interface UsageIndicators {
  ever_seen_in_scan: boolean
  last_seen: string
}

// Simple WebAsset interface matching the actual API response
export interface WebAsset {
  id: string
  source: string
  created_at: string
  updated_at: string
  domains: string[]
  certificate_authority: string
  status: 'active' | 'expired'
  risks: 'low' | 'medium' | 'high' | 'critical'
}

// Legacy complex interface (keeping for reference)
export interface ComplexWebAsset {
  id: string
  fingerprint_sha256: string
  fingerprint_sha1: string
  fingerprint_md5: string
  domains: string[]
  subject: WebAssetSubject
  issuer: WebAssetIssuer
  validity_period: ValidityPeriod
  key_info: KeyInfo
  certificate_authority: CertificateAuthority
  certificate_transparency: CertificateTransparency
  validation: Validation
  security_analysis: SecurityAnalysis
  threat_intelligence?: WebThreatIntelligence
  usage_indicators: UsageIndicators
}

class ApiService {
  private async request<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Host Assets Methods
  async getHostAssets(): Promise<Host[]> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Handle both array and data.items structure
          const mockData = mockHosts as any
          const items = Array.isArray(mockData) ? mockData : mockData.data?.items || []
          resolve(items as Host[])
        }, 500) // Simulate network delay
      })
    }

    try {
      // Try to get data.items structure first
      const response = await this.request<{ data: { items: Host[] } }>('/assets/hosts')
      return response.data.items
    } catch (error) {
      // Fallback to direct array if the API returns a simple array
      return this.request<Host[]>('/assets/hosts')
    }
  }

  async getHostAssetByIp(ip: string): Promise<Host> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Handle both array and data.items structure
          const mockData = mockHosts as any
          const items = Array.isArray(mockData) ? mockData : mockData.data?.items || []
          const host = items.find((h: Host) => h.ip === ip)
          if (host) {
            // Simulate the API response structure for individual asset
            const response = {
              success: true,
              data: host
            }
            resolve(response.data as Host)
          } else {
            reject(new Error(`Host with IP ${ip} not found`))
          }
        }, 300) // Simulate network delay
      })
    }

    // For real API calls, handle the new response structure
    const response = await this.request<{ success: boolean, data: Host }>(`/assets/hosts/${ip}`)
    return response.data
  }

  // Web Assets Methods
  async getWebAssets(): Promise<WebAsset[]> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          try {
            // Handle the new data.items structure
            const mockData = mockWebAssets as any
            console.log('Raw mock data:', mockData)

            // Extract items from the nested structure
            let items: WebAsset[] = []
            if (mockData && typeof mockData === 'object') {
              if (mockData.data && mockData.data.items && Array.isArray(mockData.data.items)) {
                items = mockData.data.items
              } else if (Array.isArray(mockData)) {
                items = mockData
              }
            }

            console.log('Extracted items:', items)
            console.log('Items count:', items.length)
            resolve(items)
          } catch (error) {
            console.error('Error processing mock web assets:', error)
            resolve([])
          }
        }, 500) // Simulate network delay
      })
    }

    // For real API calls, handle the data.items structure
    const response = await this.request<{ data: { items: WebAsset[] } }>('/assets/web')
    console.log('API response:', response)
    return response.data.items
  }

  async getWebAssetByDomain(domain: string): Promise<WebAsset> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            // Handle the new data.items structure
            const mockData = mockWebAssets as any
            let items: WebAsset[] = []

            if (mockData && typeof mockData === 'object') {
              if (mockData.data && mockData.data.items && Array.isArray(mockData.data.items)) {
                items = mockData.data.items
              } else if (Array.isArray(mockData)) {
                items = mockData
              }
            }

            const webAsset = items.find((w: WebAsset) =>
              w.id === domain || (w.domains && w.domains.includes(domain))
            )

            if (webAsset) {
              // Simulate the API response structure for individual asset
              const response = {
                success: true,
                data: webAsset
              }
              resolve(response.data as WebAsset)
            } else {
              reject(new Error(`Web asset with domain ${domain} not found`))
            }
          } catch (error) {
            console.error('Error finding web asset:', error)
            reject(new Error(`Error processing web asset data: ${error}`))
          }
        }, 300) // Simulate network delay
      })
    }

    // For real API calls, handle the new response structure
    const response = await this.request<{ success: boolean, data: WebAsset }>(`/assets/web/${domain}`)
    return response.data
  }

  // Legacy methods for backward compatibility
  async getAssets(): Promise<Host[]> {
    return this.getHostAssets()
  }

  async getAssetByIp(ip: string): Promise<Host> {
    return this.getHostAssetByIp(ip)
  }

  async uploadHostAssets(file: File): Promise<any> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate validation
          if (!file.type.includes('json') && !file.name.endsWith('.json')) {
            reject(new Error('Invalid file type. Please upload a JSON file.'))
            return
          }

          // Simulate successful upload
          resolve({
            success: true,
            message: `Successfully uploaded ${file.name}`,
            uploaded_at: new Date().toISOString(),
            file_size: file.size
          })
        }, 1000) // Simulate upload time
      })
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE_URL}/assets/hosts/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Host assets upload failed:', error)
      throw error
    }
  }

  async uploadWebAssets(file: File): Promise<any> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate validation
          if (!file.type.includes('json') && !file.name.endsWith('.json')) {
            reject(new Error('Invalid file type. Please upload a JSON file.'))
            return
          }

          // Simulate successful upload
          resolve({
            success: true,
            message: `Successfully uploaded ${file.name}`,
            uploaded_at: new Date().toISOString(),
            file_size: file.size
          })
        }, 1000) // Simulate upload time
      })
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE_URL}/assets/web/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Web assets upload failed:', error)
      throw error
    }
  }

  // Legacy method for backward compatibility
  async uploadAssets(file: File): Promise<any> {
    return this.uploadHostAssets(file)
  }
}

export const apiService = new ApiService()
