import axios, { AxiosError } from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

/**
 * Store the current tenant ID
 */
export const setTenantId = (tenantId: string): void => {
  localStorage.setItem('tenant_id', tenantId)
}

/**
 * Clear the current tenant ID
 */
export const clearTenantId = (): void => {
  localStorage.removeItem('tenant_id')
}

/**
 * Extract tenant ID from subdomain or localStorage
 * Priority: subdomain > localStorage
 * Example: hdscoder.localhost:3000 -> hdscoder
 * Example: hdscoder.lvh.me:3001 -> hdscoder
 */
export const getTenantId = (): string | null => {
  const hostname = window.location.hostname
  
  // For localhost subdomains (e.g., hdscoder.localhost)
  if (hostname.includes('.localhost')) {
    return hostname.split('.')[0]
  }
  
  // For lvh.me subdomains (e.g., hdscoder.lvh.me)
  if (hostname.includes('.lvh.me')) {
    return hostname.split('.')[0]
  }
  
  // For production subdomains (e.g., hdscoder.example.com)
  const parts = hostname.split('.')
  if (parts.length >= 3) {
    return parts[0]
  }
  
  // Fallback to localStorage for local development without subdomains
  return localStorage.getItem('tenant_id')
}

/**
 * Get the API base path including tenant context
 */
export const getApiBasePath = (): string => {
  const tenantId = getTenantId()
  return tenantId ? `/api/${tenantId}` : '/api'
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false, // Not needed for token-based auth
})

/**
 * For token-based API auth, we don't need CSRF cookies
 * This is a no-op but kept for compatibility
 */
export const getCsrfCookie = async () => {
  // Not needed for token-based authentication
  return Promise.resolve()
}

// Request interceptor to add tenant context to URLs
apiClient.interceptors.request.use(
  (config) => {
    // Exclude central routes that don't need tenant prefix
    const centralRoutes = ['/api/tenants', '/sanctum/csrf-cookie']
    const isCentralRoute = centralRoutes.some(route => config.url?.startsWith(route))
    
    const tenantId = getTenantId()
    // Backend expects: /api/{tenant_id}/auth/login
    if (tenantId && config.url?.startsWith('/api/') && !isCentralRoute) {
      config.url = config.url.replace('/api/', `/api/${tenantId}/`)
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token on 401
      localStorage.removeItem('auth_token')
      delete apiClient.defaults.headers.common['Authorization']
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
