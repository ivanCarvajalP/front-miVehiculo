import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/index'

const SESSION_KEY = 'user_session'

export const useAuthStore = defineStore('auth', () => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const session = ref(JSON.parse(localStorage.getItem(SESSION_KEY)) || null)

  // ─── Getters ────────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => session.value !== null)
  const currentUser = computed(() => session.value)
  const token = computed(() => session.value?.token || null)

  // ─── Actions ─────────────────────────────────────────────────────────────────
  async function login(documento_identidad, contrasena) {
    const { data } = await authService.login(documento_identidad, contrasena)
    // data: { access_token, token_type, nombres, correo, documento_identidad }
    const payload = {
      token: data.access_token,
      token_type: data.token_type,
      nombre: data.nombres,
      correo: data.correo,
      documento_identidad: data.documento_identidad,
    }
    session.value = payload
    localStorage.setItem(SESSION_KEY, JSON.stringify(payload))
    // Mantener compatibilidad con el guard del router
    localStorage.setItem(
      'user_admin',
      JSON.stringify({ nombre: data.nombres, id: data.documento_identidad }),
    )
    return payload
  }

  function logout() {
    session.value = null
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem('user_admin')
  }

  return { session, isAuthenticated, currentUser, token, login, logout }
})
