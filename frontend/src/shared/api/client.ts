import axios, { AxiosError } from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

// store tenant id
export const setTenantId = (tenantId: string): void => {
  localStorage.setItem('tenant_id', tenantId)
}

// clear tenant id
export const clearTenantId = (): void => {
  localStorage.removeItem('tenant_id')
}

// get tenant id from subdomain or storage
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

// get api path with tenant
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
  withCredentials: false,
})

// csrf not needed for token auth
export const getCsrfCookie = async () => {
  return Promise.resolve()
}

// request interceptor - add tenant to url
apiClient.interceptors.request.use(
  (config) => {
    const centralRoutes = ['/api/tenants', '/sanctum/csrf-cookie']
    const isCentralRoute = centralRoutes.some(route => config.url?.startsWith(route))
    
    const tenantId = getTenantId()
    if (tenantId && config.url?.startsWith('/api/') && !isCentralRoute) {
      config.url = config.url.replace('/api/', `/api/${tenantId}/`)
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// response interceptor - handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
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
