<template>
  <div class="historial-container">
    <div class="h-header">
      <div class="header-text">
        <h3>Historial de Vehículos</h3>
        <p class="h-subtitulo">
          Registro histórico de unidades que ya no pertenecen a su flota activa
        </p>
      </div>
      <button class="btn-clear" @click="prepararLimpiarTodo" v-if="historial.length > 0">
        Limpiar Historial
      </button>
    </div>

    <!-- Lista de Historial -->
    <div v-if="historial.length === 0" class="h-vacio">
      <div class="empty-icon-box">
        <svg
          viewBox="0 0 24 24"
          width="40"
          height="40"
          stroke="var(--c-text-light)"
          stroke-width="1.5"
          fill="none"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <h4>No hay registros históricos</h4>
      <p>Aquí aparecerán los vehículos que haya dado de baja o vendido anteriormente.</p>
    </div>

    <div v-else class="h-list">
      <div v-for="(item, i) in historial" :key="i" class="h-item-wrapper">
        <div class="h-card">
          <div class="h-card-left">
            <div class="h-status-badge">DADO DE BAJA</div>
            <span class="h-placa">{{ item.placa }}</span>
          </div>
          <div class="h-card-mid">
            <h4 class="h-marca">{{ item.marca }}</h4>
            <p class="h-fecha">Retirado el: {{ item.fecha_baja }}</p>
          </div>
          <div class="h-card-right">
            <button class="btn-ver-servicios" @click="toggleServicios(item.placa)">
              {{ expandido === item.placa ? 'Ocultar Servicios' : 'Historial de Servicios' }}
            </button>
            <button
              class="btn-del-mini"
              @click="prepararEliminarUno(item.placa)"
              title="Eliminar registro permanentemente"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              >
                <path
                  d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Sección de servicios históricos -->
        <Transition name="slide">
          <div v-if="expandido === item.placa" class="h-servicios-box">
            <div v-if="cargandoServicios" class="s-loading">
              <span class="spinner-mini"></span> Cargando bitácora...
            </div>
            <div v-else-if="servicios.length === 0" class="s-empty">
              No se encontraron registros de mantenimientos previos.
            </div>
            <div v-else class="s-grid">
              <div v-for="(s, idx) in servicios" :key="idx" class="s-card">
                <div class="s-icon">🛠</div>
                <div class="s-info">
                  <span class="s-id">Factura #{{ s.idFactura }}</span>
                  <p class="s-desc">{{ s.descripcionServicio }}</p>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Modal de Seguridad (Contraseña) -->
    <Transition name="modal-fade">
      <div v-if="mostrarModal" class="h-modal-overlay" @click.self="cerrarModal">
        <div class="h-modal-box">
          <div class="h-modal-body">
            <div v-if="exito" class="h-success-state">
              <div class="h-success-icon">✓</div>
              <h4>¡Registro eliminado!</h4>
              <p>
                La información del vehículo ha sido borrada permanentemente de todos los registros.
              </p>
            </div>
            <template v-else>
              <div class="h-alert-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="48"
                  height="48"
                  stroke="#ef4444"
                  stroke-width="2"
                  fill="none"
                >
                  <path
                    d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
                  />
                </svg>
              </div>
              <h4>¿Eliminar permanentemente?</h4>
              <p v-if="modo === 'uno'">
                Está por eliminar el registro de la placa <strong>{{ placaSeleccionada }}</strong
                >. Esta acción no se puede deshacer.
              </p>
              <p v-else>
                Está por vaciar <strong>todo</strong> el historial de vehículos de forma definitiva.
              </p>
              <p class="h-warning">La información no podrá ser recuperada.</p>

              <div class="h-input-group">
                <label>Confirme su Contraseña</label>
                <input
                  v-model="password"
                  type="password"
                  placeholder="Ingrese su contraseña"
                  :class="{ 'h-err': errorMsg }"
                  @keyup.enter="ejecutarAccion"
                />
              </div>

              <div v-if="errorMsg" class="h-error-alert">{{ errorMsg }}</div>
            </template>
          </div>
          <div class="h-modal-footer" v-if="!exito">
            <button class="btn-cancel" @click="cerrarModal" :disabled="procesando">Cancelar</button>
            <button class="btn-confirm" @click="ejecutarAccion" :disabled="procesando">
              {{ procesando ? 'Verificando...' : 'Confirmar Eliminación' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { semanticaService } from '../services/index'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const historial = ref([])
const expandido = ref(null)
const servicios = ref([])
const cargandoServicios = ref(false)

// Seguridad
const mostrarModal = ref(false)
const modo = ref('uno') // 'uno' o 'todo'
const placaSeleccionada = ref('')
const password = ref('')
const errorMsg = ref('')
const procesando = ref(false)
const exito = ref(false)

const cargarHistorial = () => {
  const saved = localStorage.getItem('vehiculos_historial')
  if (saved) {
    historial.value = JSON.parse(saved)
  }
}

const toggleServicios = async (placa) => {
  if (expandido.value === placa) {
    expandido.value = null
    return
  }

  expandido.value = placa
  cargandoServicios.value = true
  servicios.value = []

  try {
    const { data } = await semanticaService.getServiciosPorPlaca(placa)
    servicios.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Error cargando servicios históricos:', err)
  } finally {
    cargandoServicios.value = false
  }
}

const cerrarModal = () => {
  if (procesando.value) return
  mostrarModal.value = false
  password.value = ''
  errorMsg.value = ''
  exito.value = false
}

const prepararEliminarUno = (placa) => {
  modo.value = 'uno'
  placaSeleccionada.value = placa
  mostrarModal.value = true
}

const prepararLimpiarTodo = () => {
  modo.value = 'todo'
  mostrarModal.value = true
}

const ejecutarAccion = async () => {
  if (!password.value) {
    errorMsg.value = 'Ingrese su contraseña para continuar.'
    return
  }

  procesando.value = true
  errorMsg.value = ''

  try {
    // Verificar identidad
    const documento = authStore.currentUser?.documento_identidad
    await authStore.login(documento, password.value)

    // Si llega aquí, contraseña OK
    if (modo.value === 'uno') {
      // Al eliminar del historial, lo guardamos en 'ocultos' para que no vuelva a 'Mis Vehículos'
      const ocultos = JSON.parse(localStorage.getItem('vehiculos_ocultos') || '[]')
      if (!ocultos.includes(placaSeleccionada.value)) {
        ocultos.push(placaSeleccionada.value)
        localStorage.setItem('vehiculos_ocultos', JSON.stringify(ocultos))
      }
      historial.value = historial.value.filter((h) => h.placa !== placaSeleccionada.value)
    } else {
      // Al limpiar todo, todos los del historial pasan a ocultos
      const ocultos = JSON.parse(localStorage.getItem('vehiculos_ocultos') || '[]')
      historial.value.forEach((h) => {
        if (!ocultos.includes(h.placa)) ocultos.push(h.placa)
      })
      localStorage.setItem('vehiculos_ocultos', JSON.stringify(ocultos))
      historial.value = []
    }

    localStorage.setItem('vehiculos_historial', JSON.stringify(historial.value))

    exito.value = true
    setTimeout(() => {
      cerrarModal()
    }, 1500)
  } catch {
    errorMsg.value = 'Contraseña incorrecta. Acción denegada.'
  } finally {
    procesando.value = false
  }
}

onMounted(() => {
  cargarHistorial()
})
</script>

<style scoped>
.historial-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeUp 0.5s ease-out;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.h-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 24px 32px;
  border-radius: 16px;
  border: 1px solid var(--c-primary-light);
}

.header-text h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--c-text-main);
}
.h-subtitulo {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--c-text-muted);
}

.btn-clear {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fee2e2;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-clear:hover {
  background: #fee2e2;
}

.h-vacio {
  text-align: center;
  padding: 80px 20px;
  background: #fff;
  border-radius: 16px;
  border: 1px dashed var(--c-border-hover);
  color: var(--c-text-muted);
}
.empty-icon-box {
  margin-bottom: 16px;
}
.h-vacio h4 {
  color: var(--c-text-main);
  font-size: 18px;
  margin: 0 0 8px;
}

.h-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.h-item-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.h-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--c-border);
  transition: all 0.2s;
  position: relative;
  z-index: 2;
}
.h-card:hover {
  border-color: var(--c-border-hover);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.h-card-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 120px;
}
.h-status-badge {
  font-size: 9px;
  font-weight: 800;
  color: var(--c-text-light);
  letter-spacing: 1px;
  padding: 4px 8px;
  background: var(--c-bg-surface-soft);
  border-radius: 4px;
  width: fit-content;
}
.h-placa {
  font-family: monospace;
  font-weight: 700;
  font-size: 18px;
  color: var(--c-text-main);
  letter-spacing: 2px;
}

.h-card-mid {
  flex: 1;
  margin-left: 40px;
}
.h-marca {
  margin: 0;
  font-size: 17px;
  color: #334155;
  font-weight: 700;
}
.h-fecha {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--c-text-muted);
}

.btn-ver-servicios {
  background: var(--c-bg-surface-soft);
  color: var(--c-primary-dark);
  border: 1px solid var(--c-primary-light);
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-ver-servicios:hover {
  background: var(--c-primary-dark);
  color: #ffffff;
}

.btn-del-mini {
  background: transparent;
  color: var(--c-text-light);
  border: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-del-mini:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* MODAL DE SEGURIDAD */
.h-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.h-modal-box {
  background: white;
  border-radius: 20px;
  width: 400px;
  max-width: 100%;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: modalScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes modalScale {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.h-modal-body {
  padding: 40px 32px 24px;
  text-align: center;
}
.h-alert-icon {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}
.h-error-alert {
  margin-top: 12px;
  color: #ef4444;
  font-size: 12px;
  font-weight: 500;
}

.h-success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
  animation: scaleIn 0.3s ease-out;
}
.h-success-icon {
  width: 60px;
  height: 60px;
  background: var(--c-primary-light);
  color: var(--c-primary-dark);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 800;
}
.h-success-state h4 {
  margin: 0;
  color: #065f46;
  font-size: 20px;
}
.h-success-state p {
  margin: 0;
  color: #065f46;
  font-size: 14px;
  line-height: 1.4;
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.h-modal-footer {
  padding: 24px 32px 32px;
  display: flex;
  gap: 12px;
}
.h-modal-footer button {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.btn-cancel {
  background: var(--c-bg-surface-soft);
  color: var(--c-text-muted);
  border: 1px solid var(--c-border);
}
.btn-cancel:hover {
  background: var(--c-bg-surface-soft);
}
.btn-confirm {
  background: #ef4444;
  color: var(--c-text-main);
  border: none;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}
.btn-confirm:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* TRANSITIONS */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.h-servicios-box {
  background: var(--c-bg-surface-soft);
  border: 1px solid var(--c-border);
  border-top: none;
  border-radius: 0 0 16px 16px;
  padding: 24px;
  margin-top: -8px;
  padding-top: 32px;
  animation: slideDown 0.3s ease-out;
}
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.s-loading,
.s-empty {
  text-align: center;
  padding: 20px;
  color: var(--c-text-light);
  font-size: 14px;
}
.spinner-mini {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid var(--c-border);
  border-top-color: var(--c-primary-dark);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.s-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 900px) {
  .s-grid {
    grid-template-columns: 1fr;
  }
}

.s-card {
  background: white;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid var(--c-bg-surface-soft);
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.s-icon {
  font-size: 16px;
  background: var(--c-bg-surface-soft);
  padding: 8px;
  border-radius: 8px;
}
.s-id {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: var(--c-text-muted);
  margin-bottom: 2px;
}
.s-desc {
  margin: 0;
  font-size: 13px;
  color: #1e293b;
  line-height: 1.4;
}
</style>
