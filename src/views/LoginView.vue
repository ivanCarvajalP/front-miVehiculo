<template>
  <div class="auth-container">
    <!-- Fondos dinámicos -->
    <div class="bg-decoration">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="glass-overlay"></div>
    </div>

    <!-- Card Principal -->
    <main class="login-card" :class="{ 'card-loading': cargandoLogin }">
      <div class="card-header">
        <div class="logo-box">
          <div class="logo-icon">
            <svg width="24" height="20" viewBox="0 0 52 40" fill="none">
              <rect x="4" y="16" width="44" height="16" rx="5" fill="white" />
              <path d="M12 16 L18 5 H34 L40 16 Z" fill="white" fill-opacity="0.8" />
              <circle cx="14" cy="33" r="5" fill="var(--c-primary-dark)" />
              <circle cx="38" cy="33" r="5" fill="var(--c-primary-dark)" />
            </svg>
          </div>
          <h1 class="logo-text">mi<span>Vehículo</span></h1>
        </div>
        <p class="tagline">Gestión inteligente de autos y motos</p>
      </div>

      <!-- TABS -->
      <div class="tabs">
        <button 
          class="tab-btn" 
          :class="{ active: modo === 'login' }" 
          @click="cambiarModo('login')"
        >Iniciar Sesión</button>
        <button 
          class="tab-btn" 
          :class="{ active: modo === 'registro' }" 
          @click="cambiarModo('registro')"
        >Crear Cuenta</button>
      </div>

      <Transition name="fade-slide" mode="out-in">
        <!-- FORMULARIO LOGIN -->
        <form v-if="modo === 'login'" key="login" class="auth-form" @submit.prevent="ejecutarLogin">
          <div class="welcome-text">
            <h2>Bienvenido de nuevo</h2>
            <p>Ingresa tus datos para acceder a tu panel.</p>
          </div>

          <div class="input-group">
            <label>Documento de Identidad</label>
            <div class="input-wrapper">
              <span class="icon"></span>
              <input 
                v-model="login.documento" 
                type="number" 
                placeholder=""
                :class="{ 'error-border': erroresLogin.documento }"
              />
            </div>
            <span v-if="erroresLogin.documento" class="error-msg">{{ erroresLogin.documento }}</span>
          </div>

          <div class="input-group">
            <label>Contraseña</label>
            <div class="input-wrapper">
              <span class="icon"></span>
              <input 
                v-model="login.pass" 
                :type="verPass ? 'text' : 'password'" 
                placeholder="••••••••"
                :class="{ 'error-border': erroresLogin.pass }"
              />
              <button type="button" class="btn-toggle" @click="verPass = !verPass">
                {{ verPass ? '' : '' }}
              </button>
            </div>
            <span v-if="erroresLogin.pass" class="error-msg">{{ erroresLogin.pass }}</span>
          </div>

          <button type="submit" class="btn-primary" :disabled="cargandoLogin">
            <span v-if="cargandoLogin" class="spinner"></span>
            {{ cargandoLogin ? 'Iniciando sesión...' : 'Entrar al Sistema' }}
          </button>

          <div v-if="errorLogin" class="alert alert-error">
            <span class="alert-icon"></span>
            {{ errorLogin }}
          </div>
        </form>

        <!-- FORMULARIO REGISTRO -->
        <form v-else key="registro" class="auth-form" @submit.prevent="ejecutarRegistro">
          <div class="welcome-text">
            <h2>Únete a nosotros</h2>
            <p>Registra tu vehículo (auto o moto) hoy mismo.</p>
          </div>

          <div class="form-grid">
            <div class="input-group">
              <label>Nombres</label>
              <input v-model="registro.nombres" type="text" placeholder="Ej: Juan" />
            </div>
            <div class="input-group">
              <label>Apellidos</label>
              <input v-model="registro.apellidos" type="text" placeholder="Ej: Pérez" />
            </div>
          </div>

          <div class="input-group">
            <label>Identificación</label>
            <input v-model="registro.documento_identidad" type="number" placeholder="Documento" />
          </div>

          <div class="input-group">
            <label>Correo Electrónico</label>
            <input v-model="registro.correo" type="email" placeholder="usuario@correo.com" />
          </div>

          <div class="input-group">
            <label>Contraseña</label>
            <input v-model="registro.contrasena" type="password" placeholder="Mín. 6 caracteres" />
          </div>

          <button type="submit" class="btn-primary" :disabled="cargandoRegistro">
            <span v-if="cargandoRegistro" class="spinner"></span>
            {{ cargandoRegistro ? 'Procesando registro...' : 'Crear mi Cuenta' }}
          </button>

          <div v-if="errorRegistro" class="alert alert-error">{{ errorRegistro }}</div>
          <div v-if="exitoRegistro" class="alert alert-success">{{ exitoRegistro }}</div>
        </form>
      </Transition>


      <footer class="card-footer">
        <p>© 2026 Gestión de Vehículos · UDLA</p>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { authService } from '../services/index'

const router = useRouter()
const authStore = useAuthStore()

const modo = ref('login')
const verPass = ref(false)
const cargandoLogin = ref(false)
const cargandoRegistro = ref(false)
const errorLogin = ref('')
const errorRegistro = ref('')
const exitoRegistro = ref('')

const login = reactive({ documento: '', pass: '' })
const erroresLogin = reactive({ documento: '', pass: '' })

const registro = reactive({
  nombres: '',
  apellidos: '',
  documento_identidad: '',
  correo: '',
  fecha_nacimiento: '2000-01-01',
  contrasena: ''
})

const cambiarModo = (m) => {
  modo.value = m
  errorLogin.value = ''
  errorRegistro.value = ''
  exitoRegistro.value = ''
}

const ejecutarLogin = async () => {
  errorLogin.value = ''
  if (!login.documento || !login.pass) {
    if (!login.documento) erroresLogin.documento = 'Campo requerido'
    if (!login.pass) erroresLogin.pass = 'Campo requerido'
    return
  }
  
  cargandoLogin.value = true
  try {
    await authStore.login(parseInt(login.documento), login.pass)
    router.push('/inicio')
  } catch (err) {
    if (err.response) {
      const s = err.response.status
      if (s === 401) errorLogin.value = 'Credenciales incorrectas. Verifica tus datos.'
      else if (s === 404) errorLogin.value = 'No encontramos una cuenta con ese documento.'
      else errorLogin.value = err.response.data?.detail || 'Error en el servidor.'
    } else {
      errorLogin.value = 'No se pudo conectar al servidor. Intenta más tarde.'
    }
  } finally {
    cargandoLogin.value = false
  }
}

const ejecutarRegistro = async () => {
  errorRegistro.value = ''
  exitoRegistro.value = ''
  cargandoRegistro.value = true
  try {
    await authService.register({
      ...registro,
      documento_identidad: parseInt(registro.documento_identidad)
    })
    exitoRegistro.value = '¡Cuenta creada! Redirigiendo...'
    setTimeout(() => cambiarModo('login'), 2000)
  } catch (err) {
    if (err.response) {
      errorRegistro.value = err.response.data?.detail || 'Error en el registro.'
    } else {
      errorRegistro.value = 'Error de conexión.'
    }
  } finally {
    cargandoRegistro.value = false
  }
}

onMounted(() => {
  // Asegurar que no hay basura al cargar el login
  authStore.logout()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #0b0f19;
  position: relative;
  overflow: hidden;
  font-family: 'Outfit', sans-serif;
}

/* Hide number input spinners */
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
input[type=number] {
  appearance: textfield;
  -moz-appearance: textfield;
}

/* Premium Dynamic Background */
.bg-decoration {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
  background: radial-gradient(circle at top right, rgba(16, 185, 129, 0.05), transparent 50%),
              radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.05), transparent 50%);
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.5;
  animation: float 25s infinite ease-in-out alternate;
}
.orb-1 { width: 500px; height: 500px; background: rgba(16, 185, 129, 0.4); top: -200px; left: -100px; }
.orb-2 { width: 400px; height: 400px; background: rgba(59, 130, 246, 0.3); bottom: -100px; right: -100px; animation-delay: -5s; }
.orb-3 { width: 350px; height: 350px; background: rgba(139, 92, 246, 0.25); top: 30%; left: 50%; animation-delay: -10s; }

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(50px, -50px) scale(1.1); }
  100% { transform: translate(-30px, 30px) scale(0.95); }
}

.glass-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(11, 15, 25, 0.7);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
}

/* Premium Card */
.login-card {
  width: 100%;
  max-width: 440px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  padding: 48px;
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 10;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.card-loading {
  transform: scale(0.96);
  opacity: 0.7;
  pointer-events: none;
}

/* Header */
.card-header {
  text-align: center;
  margin-bottom: 35px;
}
.logo-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}
.logo-icon {
  background: linear-gradient(135deg, var(--c-primary-dark), var(--c-primary-dark));
  padding: 10px;
  border-radius: 12px;
  display: flex;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}
.logo-text {
  color: #ffffff;
  font-size: 28px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
}
.logo-text span { color: var(--c-primary-dark); }
.tagline {
  color: var(--c-text-light);
  font-size: 14px;
  font-weight: 400;
  margin: 0;
}

/* Tabs */
.tabs {
  display: flex;
  background: rgba(15, 23, 42, 0.6);
  padding: 6px;
  border-radius: 16px;
  margin-bottom: 32px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.tab-btn {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--c-text-muted);
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}
.tab-btn:hover:not(.active) {
  color: var(--c-border);
}
.tab-btn.active {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02));
  color: #ffffff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Typography */
.welcome-text h2 { color: #ffffff; margin: 0 0 8px; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
.welcome-text p { color: var(--c-text-light); font-size: 14px; margin-bottom: 28px; line-height: 1.5; }

/* Inputs */
.input-group { margin-bottom: 20px; text-align: left; }
.input-group label { 
  display: block; 
  color: var(--c-border-hover); 
  font-size: 13px; 
  font-weight: 500; 
  margin-bottom: 8px;
  margin-left: 4px;
}
.input-wrapper { position: relative; }
.input-wrapper input, .input-group > input {
  width: 100%;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 14px 16px 14px 16px;
  border-radius: 14px;
  color: #ffffff;
  font-size: 15px;
  font-family: inherit;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}
.input-wrapper input::placeholder, .input-group > input::placeholder {
  color: #475569;
}
.input-wrapper input:hover, .input-group > input:hover {
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(15, 23, 42, 0.7);
}
.input-wrapper input:focus, .input-group > input:focus {
  border-color: var(--c-primary-dark);
  background: rgba(15, 23, 42, 0.8);
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.1);
}
.error-border { border-color: #ef4444 !important; }
.error-msg { color: #ef4444; font-size: 12px; margin-top: 6px; display: block; margin-left: 4px; font-weight: 500; }

.btn-toggle {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: var(--c-text-muted); font-size: 12px; font-weight: 600;
  transition: color 0.2s;
}
.btn-toggle:hover { color: #ffffff; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

/* Primary Button */
.btn-primary {
  width: 100%;
  background: linear-gradient(135deg, var(--c-primary-dark), var(--c-primary-dark));
  color: #ffffff;
  border: none;
  padding: 15px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 16px;
  font-family: inherit;
  cursor: pointer;
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
.btn-primary:hover:not(:disabled) { 
  transform: translateY(-3px); 
  box-shadow: 0 15px 35px -5px rgba(16, 185, 129, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
.btn-primary:active { transform: translateY(0); box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4); }
.btn-primary:disabled { opacity: 0.65; cursor: not-allowed; transform: none; box-shadow: none; }

/* Loading Spinner */
.spinner {
  width: 20px; height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Alerts */
.alert {
  margin-top: 24px;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: slideUp 0.3s ease;
}
@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.alert-error { background: rgba(239, 68, 68, 0.08); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.2); }
.alert-success { background: rgba(16, 185, 129, 0.08); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.2); }

/* Footer */
.card-footer { margin-top: 35px; text-align: center; }
.card-footer p { color: #475569; font-size: 12px; margin: 0; font-weight: 500; }

/* Transitions */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-slide-enter-from { opacity: 0; transform: translateY(15px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-15px); }

@media (max-width: 480px) {
  .login-card { padding: 32px 24px; border-radius: 20px; }
  .form-grid { grid-template-columns: 1fr; gap: 0; }
  .logo-text { font-size: 24px; }
  .orb { display: none; }
}
</style>
