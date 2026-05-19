<template>
  <div class="mis-vehiculos-container">
    <div class="v-header">
      <div class="header-text">
        <h3>Mis Vehículos</h3>
        <p class="v-subtitulo">Gestión de flota e historial de mantenimientos</p>
      </div>
      <div class="header-actions">
        <button class="btn-outline" @click="cargarMisVehiculos" :disabled="cargando">
          <span v-if="cargando" class="mini-spinner dark"></span>
          {{ cargando ? 'Sincronizando...' : '↻ Sincronizar' }}
        </button>
        <button class="btn-primary" @click="abrirModal">
          <span class="plus-icon">+</span> Nuevo Vehículo
        </button>
      </div>
    </div>

    <!-- Mensajes de estado -->
    <div v-if="error" class="estado-alerta error">
      <div class="alert-icon">⚠</div>
      <div class="alert-content">
        <strong>Error de conexión</strong>
        <p>{{ error }}</p>
      </div>
    </div>

    <div v-else-if="cargando" class="estado-loading">
      <div class="spinner-modern"></div>
      <p>Recuperando información de su flota...</p>
    </div>

    <div v-else-if="vehiculos.length === 0" class="estado-vacio">
      <div class="empty-icon-wrapper">
        <div class="empty-icon">🚗</div>
      </div>
      <h4>Sin vehículos registrados</h4>
      <p>
        Comience añadiendo su primer vehículo para gestionar sus mantenimientos e historial de
        servicios.
      </p>
      <button class="btn-primary" style="margin-top: 20px" @click="abrirModal">
        + Registrar Vehículo
      </button>
    </div>

    <!-- Grilla de vehículos -->
    <div v-else class="v-grid">
      <div v-for="(v, i) in vehiculos" :key="i" class="v-card">
        <div class="v-card-main">
          <div class="v-card-top">
            <span class="placa-badge">{{ v.placa }}</span>
            <button
              class="btn-delete-icon"
              @click="abrirConfirmacionEliminar(v.placa)"
              title="Dar de baja"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
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
          <div class="v-card-body">
            <h4 class="v-marca">{{ v.marca }}</h4>
            <div class="v-specs">
              <span class="spec-tag">{{ v.cilindraje }} cc</span>
            </div>
          </div>
          <div class="v-card-footer">
            <button
              class="btn-history"
              @click="toggleHistorial(v.placa)"
              :class="{ active: vehiculosExpandidos[v.placa] }"
            >
              {{ vehiculosExpandidos[v.placa] ? 'Ocultar Servicios' : 'Historial de Servicios' }}
              <svg
                class="arrow-icon"
                :class="{ rotated: vehiculosExpandidos[v.placa] }"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Historial desplegable -->
        <div class="v-card-history" :class="{ expanded: vehiculosExpandidos[v.placa] }">
          <div class="history-inner">
            <div v-if="cargandoServicios[v.placa]" class="history-state">
              <span class="mini-spinner dark"></span>
              <span class="loading-text">Cargando registros...</span>
            </div>
            <div
              v-else-if="vehiculoServicios[v.placa] && vehiculoServicios[v.placa].length === 0"
              class="history-state empty"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                stroke="var(--c-text-light)"
                stroke-width="2"
                fill="none"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>No hay mantenimientos registrados.</span>
            </div>
            <div v-else-if="vehiculoServicios[v.placa]" class="history-list">
              <div
                v-for="(servicio, idx) in vehiculoServicios[v.placa]"
                :key="idx"
                class="history-item"
              >
                <div class="h-icon-box">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    stroke="currentColor"
                    stroke-width="2"
                    fill="none"
                  >
                    <path
                      d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                    />
                  </svg>
                </div>
                <div class="h-info">
                  <span class="h-id">Factura #{{ servicio.idFactura }}</span>
                  <p class="h-desc">{{ servicio.descripcionServicio }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Registro Completo -->
    <Transition name="modal-fade">
      <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
        <div class="modal-box">
          <div class="modal-header">
            <div>
              <h4>Registro de Unidad Vehicular</h4>
              <p class="modal-subtitle">Ingrese los datos técnicos y de propiedad</p>
            </div>
            <button class="modal-close" @click="cerrarModal">
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="registrar" class="form-grid">
              <!-- Sección Vehículo -->
              <div class="form-section">
                <div class="section-title">
                  <span class="section-num">1</span>
                  <h5>Especificaciones Técnicas</h5>
                </div>
                <div class="section-content">
                  <div class="input-group">
                    <label>Placa Identificadora</label>
                    <input type="text" v-model="form.placa" required />
                  </div>
                  <div class="input-group">
                    <label>Fabricante / Marca</label>
                    <input type="text" v-model="form.marca" required />
                  </div>
                  <div class="input-group">
                    <label>Cilindraje (cc)</label>
                    <input type="number" v-model="form.cilindraje" required />
                  </div>
                  <div class="input-group">
                    <label>Kilometraje Actual</label>
                    <input type="number" v-model="form.kilometros" />
                  </div>
                </div>
              </div>

              <!-- Sección Tarjeta Propiedad -->
              <div class="form-section">
                <div class="section-title">
                  <span class="section-num">2</span>
                  <h5>Documentación de Propiedad</h5>
                </div>
                <div class="section-content">
                  <div class="input-group">
                    <label>N° Tarjeta / Licencia</label>
                    <input type="number" v-model="form.numero_tarjeta" required />
                  </div>
                  <div class="input-group">
                    <label>Nombre del Titular</label>
                    <input type="text" v-model="form.nombre_propietario" required />
                  </div>
                  <div class="input-group">
                    <label>Documento del Titular</label>
                    <input type="number" v-model="form.documento_propietario" required />
                  </div>
                  <div class="row-group">
                    <div class="input-group">
                      <label>Clase</label>
                      <input type="text" v-model="form.clase_vehiculo" required />
                    </div>
                    <div class="input-group">
                      <label>Modelo (Año)</label>
                      <input type="text" v-model="form.modelo" required />
                    </div>
                  </div>
                  <div class="row-group">
                    <div class="input-group">
                      <label>Capacidad</label>
                      <input type="number" v-model="form.capacidad" required />
                    </div>
                    <div class="input-group">
                      <label>Servicio</label>
                      <select v-model="form.servicio" required>
                        <option>Particular</option>
                        <option>Público</option>
                        <option>Oficial</option>
                      </select>
                    </div>
                  </div>
                  <div class="input-group">
                    <label>Tipo de Carrocería</label>
                    <input type="text" v-model="form.tipo_carroceria" required />
                  </div>
                  <div class="input-group">
                    <label>Línea / Versión</label>
                    <input type="text" v-model="form.linea_vehiculo" required />
                  </div>
                  <div class="input-group">
                    <label>Número de Motor</label>
                    <input type="text" v-model="form.numero_motor" required />
                  </div>
                  <div class="row-group">
                    <div class="input-group">
                      <label>Combustible</label>
                      <select v-model="form.combustible" required>
                        <option>Gasolina</option>
                        <option>Diésel</option>
                        <option>Eléctrico</option>
                        <option>Híbrido</option>
                      </select>
                    </div>
                    <div class="input-group">
                      <label>Color</label>
                      <input type="text" v-model="form.color" required />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <div v-if="errorRegistro" class="error-registrar">⚠️ {{ errorRegistro }}</div>
            <div class="footer-actions">
              <button class="btn-ghost" @click="cerrarModal" type="button">Cancelar</button>
              <button class="btn-primary" @click="registrar" :disabled="creando">
                <span v-if="creando" class="mini-spinner"></span>
                {{ creando ? 'Registrando...' : 'Confirmar Registro' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal de Confirmación de Eliminación -->
    <Transition name="modal-fade">
      <div v-if="mostrarConfirmacion" class="modal-overlay" @click.self="cerrarConfirmacion">
        <div class="modal-box confirm-modal">
          <div class="modal-body confirm-body">
            <template v-if="exitoEliminar">
              <div class="confirm-success-state">
                <div class="check-icon">✓</div>
                <h4>¡Unidad dada de baja!</h4>
                <p>El vehículo ha sido movido a su historial de registros correctamente.</p>
              </div>
            </template>
            <template v-else>
              <div class="confirm-icon-box">
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
              <h4>¿Dar de baja vehículo?</h4>
              <p>
                Está a punto de eliminar la unidad con placa <strong>{{ placaAEliminar }}</strong
                >. Esta acción requiere confirmar su identidad.
              </p>

              <div class="confirm-password-group">
                <label>Confirme su Contraseña</label>
                <input
                  v-model="confirmPassword"
                  type="password"
                  placeholder="Ingrese su contraseña actual"
                  :class="{ 'input-err': errorEliminar }"
                  @keyup.enter="ejecutarBaja"
                />
              </div>

              <div v-if="errorEliminar" class="alert-mini error">
                {{ errorEliminar }}
              </div>
            </template>
          </div>
          <div class="modal-footer confirm-footer" v-if="!exitoEliminar">
            <button class="btn-ghost" @click="cerrarConfirmacion" :disabled="eliminando">
              Cancelar
            </button>
            <button class="btn-danger" @click="ejecutarBaja" :disabled="eliminando">
              <span v-if="eliminando" class="mini-spinner"></span>
              {{ eliminando ? 'Procesando...' : 'Confirmar Baja' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { usuariosService, semanticaService } from '../services/index'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const vehiculos = ref([])
const cargando = ref(false)
const error = ref('')

const mostrarModal = ref(false)
const creando = ref(false)
const errorRegistro = ref('')

// Estados para eliminación profesional
const mostrarConfirmacion = ref(false)
const placaAEliminar = ref('')
const confirmPassword = ref('')
const eliminando = ref(false)
const errorEliminar = ref('')
const exitoEliminar = ref(false)

// Estados para el historial de servicios
const vehiculosExpandidos = ref({})
const vehiculoServicios = ref({})
const cargandoServicios = ref({})

const form = reactive({
  placa: '',
  marca: '',
  cilindraje: '',
  kilometros: 0,
  numero_tarjeta: '',
  nombre_propietario: '',
  documento_propietario: '',
  clase_vehiculo: '',
  modelo: '',
  capacidad: '',
  servicio: 'Particular',
  tipo_carroceria: '',
  linea_vehiculo: '',
  numero_motor: '',
  combustible: 'Gasolina',
  color: '',
})

const resetForm = () => {
  Object.assign(form, {
    placa: '',
    marca: '',
    cilindraje: '',
    kilometros: '',
    numero_tarjeta: '',
    nombre_propietario: authStore.currentUser?.nombre || '',
    documento_propietario: authStore.currentUser?.documento_identidad || '',
    clase_vehiculo: '',
    modelo: '',
    capacidad: '',
    servicio: 'Particular',
    tipo_carroceria: '',
    linea_vehiculo: '',
    numero_motor: '',
    combustible: 'Gasolina',
    color: '',
  })
}

const abrirModal = () => {
  resetForm()
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
  errorRegistro.value = ''
}

const cargarMisVehiculos = async () => {
  const documento = authStore.currentUser?.documento_identidad
  if (!documento) return

  cargando.value = true
  error.value = ''
  try {
    // El endpoint ya devuelve solo vehículos ACTIVOS del usuario autenticado.
    const { data } = await usuariosService.getVehiculos(documento)
    vehiculos.value = Array.isArray(data) ? data : []
    vehiculosExpandidos.value = {}
  } catch (err) {
    console.error('Error obteniendo vehículos:', err)
    error.value = 'No se pudieron sincronizar los datos de su flota.'
  } finally {
    cargando.value = false
  }
}

const toggleHistorial = async (placa) => {
  if (vehiculosExpandidos.value[placa]) {
    vehiculosExpandidos.value[placa] = false
    return
  }

  // Expandir
  vehiculosExpandidos.value[placa] = true

  // Evitar recargar si ya tenemos los datos
  // if (vehiculoServicios.value[placa]) return;

  cargandoServicios.value[placa] = true
  try {
    const { data } = await semanticaService.getServiciosPorPlaca(placa)
    vehiculoServicios.value[placa] = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Error obteniendo servicios para placa:', placa, err)
    vehiculoServicios.value[placa] = []
  } finally {
    cargandoServicios.value[placa] = false
  }
}

const registrar = async () => {
  errorRegistro.value = ''
  if (!form.placa || !form.marca || !form.numero_tarjeta) {
    errorRegistro.value = 'Complete los campos obligatorios: Placa, Marca y Número de Tarjeta.'
    return
  }

  const documento = authStore.currentUser?.documento_identidad
  if (!documento) {
    errorRegistro.value = 'No se pudo obtener el documento del usuario. Inicie sesión nuevamente.'
    return
  }

  creando.value = true
  try {
    const payload = {
      vehiculo: {
        placa: form.placa.trim().toUpperCase(),
        marca: form.marca.trim(),
        cilindraje: parseInt(form.cilindraje) || 0,
      },
      tarjeta_propiedad: {
        numero_tarjeta: parseInt(form.numero_tarjeta),
        nombre_propietario: form.nombre_propietario.trim(),
        documento_propietario: parseInt(form.documento_propietario),
        clase_vehiculo: form.clase_vehiculo.trim(),
        modelo: form.modelo.toString().trim(),
        capacidad: parseInt(form.capacidad) || 1,
        servicio: form.servicio,
        tipo_carroceria: form.tipo_carroceria.trim(),
        linea_vehiculo: form.linea_vehiculo.trim(),
        numero_motor: form.numero_motor.trim(),
        combustible: form.combustible,
        color: form.color.trim(),
      },
      kilometros_registro: parseInt(form.kilometros) || 0,
    }

    console.log('[registrar] Enviando a /api/usuarios/' + documento + '/vehiculos')
    console.log('[registrar] Payload:', JSON.stringify(payload, null, 2))

    await usuariosService.registrarVehiculo(documento, payload)

    console.log('[registrar] ✅ Vehículo registrado exitosamente')
    cerrarModal()
    resetForm()
    await cargarMisVehiculos()
  } catch (err) {
    console.error('[registrar] ❌ Error completo:', err)
    console.error('[registrar] Status:', err.response?.status)
    console.error('[registrar] Data:', JSON.stringify(err.response?.data, null, 2))

    const detail = err.response?.data?.detail
    if (Array.isArray(detail)) {
      // Errores de validación de FastAPI (lista de campos)
      errorRegistro.value = detail
        .map((d) => d.msg + ' (' + (d.loc?.join('.') || '') + ')')
        .join(' | ')
    } else if (typeof detail === 'string') {
      errorRegistro.value = detail
    } else {
      errorRegistro.value =
        'Error ' + (err.response?.status || '') + ': No se pudo registrar la unidad.'
    }
  } finally {
    creando.value = false
  }
}

const abrirConfirmacionEliminar = (placa) => {
  placaAEliminar.value = placa
  confirmPassword.value = ''
  errorEliminar.value = ''
  exitoEliminar.value = false
  mostrarConfirmacion.value = true
}

const cerrarConfirmacion = () => {
  if (eliminando.value) return
  mostrarConfirmacion.value = false
  placaAEliminar.value = ''
  confirmPassword.value = ''
  exitoEliminar.value = false
}

const ejecutarBaja = async () => {
  const documento = authStore.currentUser?.documento_identidad
  if (!documento || !placaAEliminar.value) return
  if (!confirmPassword.value) {
    errorEliminar.value = 'La contraseña es obligatoria para confirmar la baja.'
    return
  }

  eliminando.value = true
  errorEliminar.value = ''
  exitoEliminar.value = false

  try {
    // 1. Verificar contraseña (realismo y seguridad)
    try {
      await authStore.login(documento, confirmPassword.value)
    } catch {
      errorEliminar.value = 'Contraseña incorrecta. Verifique e intente de nuevo.'
      eliminando.value = false
      return
    }

    // 2. Ejecutar la baja (soft delete) en el backend
    try {
      await usuariosService.eliminarVehiculo(documento, placaAEliminar.value)
    } catch (err) {
      const msg = err.response?.data?.detail || ''
      if (!msg.toLowerCase().includes('inactivo')) {
        throw err
      }
    }

    // 3. ÉXITO: el backend ya marcó el vehículo como inactivo.
    // Al recargar, el endpoint solo devuelve activos → desaparece automáticamente.
    exitoEliminar.value = true
    setTimeout(async () => {
      mostrarConfirmacion.value = false
      await cargarMisVehiculos()
    }, 2000)
  } catch (err) {
    console.error('Error eliminando vehículo:', err)
    errorEliminar.value =
      err.response?.data?.detail || 'No fue posible completar la baja de la unidad.'
  } finally {
    eliminando.value = false
  }
}

onMounted(() => cargarMisVehiculos())
</script>

<style scoped>
/* GENERAL */
.mis-vehiculos-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeUp 0.5s ease-out;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Helvetica,
    Arial,
    sans-serif;
  color: #0f172a;
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

/* HEADER */
.v-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 20px 28px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(148, 163, 184, 0.1);
  border: 1px solid var(--c-primary-light);
}
.header-text h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--c-text-main);
  letter-spacing: -0.5px;
}
.v-subtitulo {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--c-text-muted);
  font-weight: 500;
}
.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* ESTADOS */
.estado-alerta {
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  font-size: 14px;
}
.estado-alerta.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}
.alert-icon {
  font-size: 20px;
}
.alert-content strong {
  display: block;
  margin-bottom: 4px;
  font-size: 15px;
}
.alert-content p {
  margin: 0;
  opacity: 0.9;
}

.estado-loading,
.estado-vacio {
  text-align: center;
  padding: 80px 20px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px dashed var(--c-primary);
  color: var(--c-text-muted);
}
.estado-vacio h4 {
  color: var(--c-text-main);
  font-size: 18px;
  margin: 16px 0 8px;
  font-weight: 700;
}
.empty-icon-wrapper {
  width: 72px;
  height: 72px;
  background: var(--c-primary-light);
  color: var(--c-primary-dark);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
.empty-icon {
  font-size: 32px;
}

/* GRILLA DE VEHICULOS */
.v-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}
.v-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid var(--c-primary-light);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(148, 163, 184, 0.1);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.v-card:hover {
  box-shadow: 0 8px 24px rgba(148, 163, 184, 0.15);
  transform: translateY(-3px);
  border-color: var(--c-primary);
}

.v-card-main {
  z-index: 2;
  background: white;
  position: relative;
}
.v-card-top {
  padding: 16px 20px;
  border-bottom: 1px solid var(--c-bg-surface-soft);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--c-bg-surface);
}
.placa-badge {
  background: var(--c-primary);
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 700;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  letter-spacing: 2px;
  font-size: 14px;
}
.btn-delete-icon {
  background: transparent;
  color: #9ca3af;
  border: none;
  cursor: pointer;
  padding: 7px;
  border-radius: 7px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}
.btn-delete-icon:hover {
  background: #fee2e2;
  color: #ef4444;
}

.v-card-body {
  padding: 20px;
}
.v-marca {
  margin: 0 0 10px;
  font-size: 18px;
  color: var(--c-text-main);
  font-weight: 800;
}
.v-specs {
  display: flex;
  gap: 8px;
}
.spec-tag {
  background: var(--c-bg-surface-soft);
  color: var(--c-primary-dark);
  border: 1px solid var(--c-primary);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.v-card-footer {
  padding: 0;
  border-top: 1px solid var(--c-bg-surface-soft);
}
.btn-history {
  width: 100%;
  background: transparent;
  border: none;
  padding: 14px 20px;
  color: var(--c-primary-dark);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s;
  font-family: inherit;
}
.btn-history:hover,
.btn-history.active {
  background: var(--c-bg-surface-soft);
}
.arrow-icon {
  transition: transform 0.3s ease;
}
.arrow-icon.rotated {
  transform: rotate(-180deg);
}

/* HISTORIAL DESPLEGABLE */
.v-card-history {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease-out;
  background: var(--c-bg-surface);
  border-top: 1px solid transparent;
}
.v-card-history.expanded {
  grid-template-rows: 1fr;
  border-top-color: var(--c-primary-light);
}
.history-inner {
  overflow: hidden;
}

.history-state {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 13px;
  color: var(--c-text-muted);
}
.history-state.empty {
  flex-direction: column;
  gap: 6px;
}

.history-list {
  padding: 12px 20px;
  max-height: 250px;
  overflow-y: auto;
}
.history-list::-webkit-scrollbar {
  width: 4px;
}
.history-list::-webkit-scrollbar-thumb {
  background: var(--c-primary);
  border-radius: 4px;
}
.history-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--c-bg-surface-soft);
}
.history-item:last-child {
  border-bottom: none;
}
.h-icon-box {
  background: var(--c-primary-light);
  color: var(--c-primary-dark);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.h-info {
  flex: 1;
}
.h-id {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: var(--c-text-main);
  margin-bottom: 2px;
}
.h-desc {
  margin: 0;
  font-size: 13px;
  color: var(--c-text-muted);
  line-height: 1.4;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(5, 46, 22, 0.35);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-box {
  background: #ffffff;
  border-radius: 20px;
  width: 900px;
  max-width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px rgba(148, 163, 184, 0.2);
  overflow: hidden;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 32px;
  border-bottom: 1px solid var(--c-bg-surface-soft);
  background: var(--c-bg-surface);
}
.modal-header h4 {
  margin: 0;
  font-size: 20px;
  color: var(--c-text-main);
  font-weight: 800;
}
.modal-subtitle {
  margin: 4px 0 0;
  color: var(--c-text-muted);
  font-size: 14px;
}
.modal-close {
  background: var(--c-bg-surface-soft);
  border: 1px solid var(--c-primary-light);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-primary-dark);
  cursor: pointer;
  transition: all 0.2s;
}
.modal-close:hover {
  background: var(--c-primary-light);
  transform: rotate(90deg);
}

.modal-body {
  padding: 32px;
  overflow-y: auto;
}
.modal-footer {
  padding: 20px 32px;
  border-top: 1px solid var(--c-bg-surface-soft);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #fff;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 2px solid var(--c-bg-surface-soft);
  padding-bottom: 12px;
}
.section-num {
  background: var(--c-primary-dark);
  color: var(--c-text-main);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}
.section-title h5 {
  margin: 0;
  color: var(--c-text-main);
  font-size: 16px;
  font-weight: 700;
}
.section-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.row-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.input-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text-muted);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.input-group input,
.input-group select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--c-primary-light);
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  color: var(--c-text-main);
  transition: all 0.2s;
  background: var(--c-bg-surface);
}
.input-group input:focus,
.input-group select:focus {
  outline: none;
  border-color: var(--c-primary-dark);
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12);
}

/* BOTONES */
.btn-primary {
  background: var(--c-primary);
  color: #ffffff;
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
}
.btn-primary:hover:not(:disabled) {
  background: var(--c-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(22, 163, 74, 0.35);
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: var(--c-bg-surface-soft);
  color: var(--c-primary-dark);
  border: 1px solid var(--c-primary);
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}
.btn-outline:hover:not(:disabled) {
  background: var(--c-primary-light);
}

.btn-ghost {
  background: transparent;
  color: var(--c-text-muted);
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.btn-ghost:hover {
  background: var(--c-bg-surface-soft);
  color: var(--c-text-main);
}

.btn-danger {
  background: #ef4444;
  color: #ffffff;
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}
.btn-danger:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
}
.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* CONFIRM MODAL SPECIFIC */
.confirm-modal {
  max-width: 400px;
}
.confirm-body {
  text-align: center;
  padding: 40px 32px 24px;
}
.confirm-icon-box {
  width: 80px;
  height: 80px;
  background: #fef2f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}
.confirm-body h4 {
  margin: 0 0 12px;
  font-size: 20px;
  color: var(--c-text-main);
}
.confirm-body p {
  margin: 0 0 20px;
  color: var(--c-text-muted);
  font-size: 15px;
  line-height: 1.5;
}
.confirm-password-group {
  text-align: left;
  margin-bottom: 12px;
}
.confirm-password-group label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: var(--c-text-main);
  text-transform: uppercase;
  margin-bottom: 6px;
  margin-left: 4px;
}
.confirm-password-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--c-primary-light);
  border-radius: 10px;
  background: var(--c-bg-surface);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}
.confirm-password-group input:focus {
  border-color: var(--c-primary-dark);
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
  background: #fff;
}
.confirm-password-group input.input-err {
  border-color: #fca5a5;
  background: #fff1f2;
}

.confirm-success-state {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: scaleIn 0.3s ease-out;
}
.check-icon {
  width: 64px;
  height: 64px;
  background: var(--c-primary-light);
  color: var(--c-primary-dark);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 800;
}
.confirm-success-state h4 {
  margin: 0;
  color: #065f46;
  font-size: 20px;
}
.confirm-success-state p {
  margin: 0;
  color: #065f46;
  font-size: 14px;
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

.confirm-footer {
  justify-content: center;
  gap: 16px;
  padding: 24px 32px 32px;
  border-top: none;
}

.alert-mini {
  margin-top: 16px;
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
}
.alert-mini.error {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fee2e2;
}
.alert-mini.success {
  background: var(--c-bg-surface-soft);
  color: var(--c-primary-dark);
  border: 1px solid var(--c-primary-light);
}

.plus-icon {
  font-size: 18px;
  line-height: 1;
}

.spinner-modern {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 3px solid var(--c-primary-light);
  border-top-color: var(--c-primary-dark);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.mini-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: var(--c-text-main);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.mini-spinner.dark {
  border-color: rgba(5, 46, 22, 0.15);
  border-top-color: var(--c-primary-dark);
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-registrar {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 500;
  width: 100%;
  margin-bottom: 12px;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
}
</style>
