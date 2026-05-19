import axios from 'axios'

/**
 * Instancia central de Axios configurada para manejar automáticamente
 * los Content-Type según el tipo de datos enviado (JSON, FormData, URLSearchParams).
 */
const api = axios.create({
  baseURL: 'https://apimivehiculo-production.up.railway.app',
  timeout: 30000
})

// ─── Interceptor de Request: Gestión de Tokens ────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const sessionStr = localStorage.getItem('user_session')
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr)
        if (session && session.token) {
          config.headers.Authorization = `Bearer ${session.token}`
        }
      } catch (e) {
        console.error('Error parsing session:', e)
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Interceptor de Response: Gestión de Errores de Autenticación ─────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el token es inválido o expiró (401)
    const isLoginRequest = error.config.url.includes('/api/auth/login')
    
    if (error.response?.status === 401 && !isLoginRequest && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('user_session')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
