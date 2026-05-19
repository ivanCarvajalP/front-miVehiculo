<template>
  <div class="cuenta-container">
    <div class="cuenta-header">
      <div class="header-info">
        <h3>Gestión de Cuenta</h3>
        <p>Administre su información personal y configuraciones de seguridad</p>
      </div>
    </div>

    <div class="cuenta-layout">
      <!-- Sidebar de pestañas -->
      <aside class="cuenta-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <div class="tab-icon" v-html="tab.icon"></div>
          <span>{{ tab.label }}</span>
        </button>
      </aside>

      <!-- Contenido de pestañas -->
      <main class="cuenta-content">
        <!-- PESTAÑA PERFIL -->
        <div v-if="activeTab === 'perfil'" class="tab-pane animate-in">
          <div class="pane-header">
            <h4>Información del Perfil</h4>
            <p>Datos básicos vinculados a su identidad en la plataforma</p>
          </div>

          <div class="profile-card">
            <div class="avatar-section">
              <div class="large-avatar">{{ userInitial }}</div>
              <div class="avatar-meta">
                <h5>{{ authStore.currentUser?.nombre }}</h5>
                <span>Documento: {{ authStore.currentUser?.documento_identidad }}</span>
              </div>
            </div>

            <form @submit.prevent="actualizarPerfil" class="profile-form">
              <div class="form-grid">
                <div class="input-group">
                  <label>Nombres</label>
                  <input v-model="perfilForm.nombres" type="text" required />
                </div>
                <div class="input-group">
                  <label>Apellidos</label>
                  <input v-model="perfilForm.apellidos" type="text" required />
                </div>
                <div class="input-group full">
                  <label>Correo Electrónico</label>
                  <input v-model="perfilForm.correo" type="email" required />
                </div>
                <div class="input-group">
                  <label>Fecha de Nacimiento</label>
                  <input v-model="perfilForm.fecha_nacimiento" type="date" />
                </div>
              </div>

              <div v-if="statusMsg.texto" :class="['status-alert', statusMsg.tipo]">
                {{ statusMsg.texto }}
              </div>

              <div class="form-actions">
                <button type="submit" class="btn-primary" :disabled="guardando">
                  <span v-if="guardando" class="spinner-mini"></span>
                  {{ guardando ? 'Guardando...' : 'Actualizar Datos' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- PESTAÑA SEGURIDAD -->
        <div v-if="activeTab === 'seguridad'" class="tab-pane animate-in">
          <div class="pane-header">
            <h4>Seguridad y Contraseña</h4>
            <p>Administre la protección de su acceso</p>
          </div>

          <div class="security-card">
            <div class="security-item">
              <div class="si-icon">🔐</div>
              <div class="si-text">
                <h5>Cambio de Contraseña</h5>
                <p>Se recomienda usar una combinación fuerte de letras, números y símbolos.</p>
              </div>
            </div>

            <form @submit.prevent="cambiarPassword" class="security-form">
              <div class="input-group">
                <label>Contraseña Actual</label>
                <input v-model="passForm.actual" type="password" required />
              </div>
              <div class="input-group">
                <label>Nueva Contraseña</label>
                <input v-model="passForm.nueva" type="password" required />
              </div>
              <div class="input-group">
                <label>Confirmar Nueva Contraseña</label>
                <input v-model="passForm.confirmar" type="password" required />
              </div>

              <div v-if="statusPass.texto" :class="['status-alert', statusPass.tipo]">
                {{ statusPass.texto }}
              </div>

              <div class="form-actions">
                <button type="submit" class="btn-primary" :disabled="cambiandoPass">
                  {{ cambiandoPass ? 'Procesando...' : 'Cambiar Contraseña' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { usuariosService } from '../services/index'

const authStore = useAuthStore()
const activeTab = ref('perfil')
const guardando = ref(false)
const cambiandoPass = ref(false)

const tabs = [
  {
    id: 'perfil',
    label: 'Mi Perfil',
    icon: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  },
  {
    id: 'seguridad',
    label: 'Seguridad',
    icon: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  },
]

const userInitial = computed(() => authStore.currentUser?.nombre?.[0]?.toUpperCase() || 'U')

const perfilForm = reactive({
  nombres: '',
  apellidos: '',
  correo: '',
  fecha_nacimiento: '',
})

const passForm = reactive({
  actual: '',
  nueva: '',
  confirmar: '',
})

const statusMsg = reactive({ texto: '', tipo: '' })
const statusPass = reactive({ texto: '', tipo: '' })

const cargarDatos = () => {
  const user = authStore.currentUser
  if (user) {
    perfilForm.nombres = user.nombre?.split(' ')[0] || ''
    perfilForm.apellidos = user.nombre?.split(' ').slice(1).join(' ') || ''
    perfilForm.correo = user.correo || ''
    perfilForm.fecha_nacimiento = user.fecha_nacimiento || ''
  }
}

const actualizarPerfil = async () => {
  guardando.value = true
  statusMsg.texto = ''

  try {
    const doc = authStore.currentUser.documento_identidad
    const payload = {
      nombres: perfilForm.nombres.trim(),
      apellidos: perfilForm.apellidos.trim(),
      correo: perfilForm.correo.trim(),
      fecha_nacimiento: perfilForm.fecha_nacimiento || null,
    }

    await usuariosService.update(doc, payload)

    // Actualizar Store
    const nuevaSession = {
      ...authStore.currentUser,
      nombre: `${payload.nombres} ${payload.apellidos}`,
      correo: payload.correo,
      fecha_nacimiento: payload.fecha_nacimiento,
    }
    authStore.session = nuevaSession
    localStorage.setItem('user_session', JSON.stringify(nuevaSession))
    localStorage.setItem(
      'user_admin',
      JSON.stringify({ nombre: nuevaSession.nombre, id: nuevaSession.documento_identidad }),
    )

    statusMsg.texto = 'Perfil actualizado con éxito.'
    statusMsg.tipo = 'success'
  } catch (err) {
    statusMsg.texto = err.response?.data?.detail || 'Error al actualizar el perfil.'
    statusMsg.tipo = 'error'
  } finally {
    guardando.value = false
  }
}

const cambiarPassword = async () => {
  if (passForm.nueva !== passForm.confirmar) {
    statusPass.texto = 'Las contraseñas no coinciden.'
    statusPass.tipo = 'error'
    return
  }

  cambiandoPass.value = true
  statusPass.texto = ''

  try {
    const doc = authStore.currentUser.documento_identidad
    await usuariosService.actualizarPassword(doc, passForm.nueva)

    statusPass.texto = 'Contraseña actualizada correctamente en el sistema.'
    statusPass.tipo = 'success'
    passForm.actual = ''
    passForm.nueva = ''
    passForm.confirmar = ''
  } catch (err) {
    statusPass.texto =
      err.response?.data?.detail ||
      'No se pudo actualizar la contraseña. Verifique con el administrador.'
    statusPass.tipo = 'error'
  } finally {
    cambiandoPass.value = false
  }
}

onMounted(cargarDatos)
</script>

<style scoped>
.cuenta-container {
  display: flex;
  flex-direction: column;
  gap: 28px;
  animation: fadeIn 0.5s ease;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.cuenta-header h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--c-text-main);
}
.cuenta-header p {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--c-text-muted);
}

.cuenta-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 32px;
  align-items: start;
}

/* TABS */
.cuenta-tabs {
  background: #fff;
  border-radius: 16px;
  border: 1px solid var(--c-primary-light);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(5, 46, 22, 0.03);
}
.tab-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 10px;
  color: var(--c-text-muted);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}
.tab-btn:hover {
  background: var(--c-bg-surface-soft);
  color: var(--c-primary-dark);
}
.tab-btn.active {
  background: var(--c-primary-dark);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);
}
.tab-icon {
  display: flex;
  align-items: center;
}

/* CONTENT */
.cuenta-content {
  background: #fff;
  border-radius: 20px;
  border: 1px solid var(--c-primary-light);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(148, 163, 184, 0.1);
}

.tab-pane {
  padding: 32px;
}
.animate-in {
  animation: slideIn 0.3s ease-out;
}
@keyframes slideIn {
  from {
    transform: translateX(10px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.pane-header {
  margin-bottom: 28px;
  border-bottom: 1px solid var(--c-bg-surface-soft);
  padding-bottom: 20px;
}
.pane-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--c-text-main);
}
.pane-header p {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--c-text-light);
}

/* PROFILE CARD */
.profile-card,
.security-card {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: var(--c-bg-surface);
  border-radius: 16px;
  border: 1px solid var(--c-primary-light);
}
.large-avatar {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--c-primary-dark), var(--c-primary-dark));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-main);
  font-size: 24px;
  font-weight: 800;
  box-shadow: 0 8px 16px rgba(22, 163, 74, 0.2);
}
.avatar-meta h5 {
  margin: 0;
  font-size: 16px;
  color: var(--c-text-main);
  font-weight: 700;
}
.avatar-meta span {
  font-size: 12px;
  color: var(--c-text-muted);
  font-family: monospace;
}

.profile-form,
.security-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.input-group.full {
  grid-column: span 2;
}
.input-group label {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.input-group input {
  padding: 12px 16px;
  border: 1px solid var(--c-primary-light);
  border-radius: 10px;
  background: var(--c-bg-surface);
  font-family: inherit;
  font-size: 14px;
  transition: all 0.2s;
  outline: none;
}
.input-group input:focus {
  border-color: var(--c-primary-dark);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.08);
}

.status-alert {
  padding: 14px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
}
.status-alert.success {
  background: var(--c-bg-surface-soft);
  color: var(--c-primary-dark);
  border: 1px solid var(--c-primary-light);
}
.status-alert.error {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fee2e2;
}

.form-actions {
  margin-top: 12px;
}
.btn-primary {
  background: var(--c-primary);
  color: #ffffff;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);
  display: flex;
  align-items: center;
  gap: 10px;
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(22, 163, 74, 0.3);
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* SECURITY */
.security-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--c-bg-surface-soft);
  border-radius: 12px;
  border: 1px solid var(--c-border);
}
.si-icon {
  font-size: 24px;
}
.si-text h5 {
  margin: 0;
  font-size: 15px;
  color: #0f172a;
}
.si-text p {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--c-text-muted);
}

@media (max-width: 900px) {
  .cuenta-layout {
    grid-template-columns: 1fr;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .input-group.full {
    grid-column: span 1;
  }
}
</style>
