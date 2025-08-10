// API service for host and web asset data
import mockHosts from '@/mock/hosts.json'
import mockWebAssets from '@/mock/web.json'

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1`

// Configuration: Set to false to use real API, true to use mock data
const USE_MOCK_DATA = false

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

export interface Host {
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

export interface WebAsset {
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
            resolve(host as Host)
          } else {
            reject(new Error(`Host with IP ${ip} not found`))
          }
        }, 300) // Simulate network delay
      })
    }
    return this.request<Host>(`/assets/hosts/${ip}`)
  }

  // Web Assets Methods
  async getWebAssets(): Promise<WebAsset[]> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Handle the new data.items structure
          const mockData = mockWebAssets as any
          console.log('Raw mock data:', mockData)
          const items = mockData.data?.items || mockData
          console.log('Extracted items:', items)
          resolve(items as WebAsset[])
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
          // Handle the new data.items structure
          const mockData = mockWebAssets as any
          const items = mockData.data?.items || mockData
          const webAsset = items.find((w: WebAsset) =>
            w.id === domain || w.domains.includes(domain)
          )
          if (webAsset) {
            resolve(webAsset as WebAsset)
          } else {
            reject(new Error(`Web asset with domain ${domain} not found`))
          }
        }, 300) // Simulate network delay
      })
    }
    return this.request<WebAsset>(`/assets/web/${domain}`)
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
