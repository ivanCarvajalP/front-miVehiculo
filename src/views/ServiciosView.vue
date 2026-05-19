<template>
  <div class="servicios-view">
    <div class="view-header">
      <div class="header-main">
        <div class="header-icon">🛠️</div>
        <div>
          <h3>Bitácora Técnica de Servicios</h3>
          <p class="view-sub">Historial estructurado de mantenimientos por unidad</p>
        </div>
      </div>

      <div class="search-panel">
        <div class="search-group">
          <label>UNIDAD A CONSULTAR</label>
          <div class="selector-wrapper">
            <select v-model="placaSeleccionada" @change="consultarTodo">
              <option value="">Seleccione una placa...</option>
              <option v-for="p in todasLasPlacas" :key="p" :value="p">{{ p }}</option>
            </select>
            <button
              class="btn-sync-ia"
              @click="consultarTodo"
              :disabled="cargando || !placaSeleccionada"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
                :class="{ spin: cargando }"
              >
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Sincronizar IA
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="content-container">
      <div v-if="!placaSeleccionada" class="welcome-state">
        <div class="welcome-box">
          <span class="welcome-icon">🔍</span>
          <h4>Consulta tu Flota</h4>
          <p>
            Seleccione un vehículo del menú superior para desglosar su historial técnico procesado
            por IA.
          </p>
        </div>
      </div>

      <div v-else-if="cargando" class="loading-state">
        <div class="spinner-container">
          <div class="modern-spinner"></div>
          <p>
            Analizando expedientes para <strong>{{ placaSeleccionada }}</strong
            >...
          </p>
        </div>
      </div>

      <div v-else class="timeline-container">
        <div v-if="facturasAsociadas.length === 0" class="no-data-state">
          <p>No se encontraron registros procesados para esta placa.</p>
        </div>

        <div v-else class="service-timeline">
          <div v-for="f in facturasAsociadas" :key="f.id_factura" class="timeline-item">
            <div class="timeline-marker"></div>
            <div class="service-card-modern">
              <div class="scm-header">
                <div class="scm-info">
                  <span class="scm-date">{{ f.fecha_factura || 'FECHA NO REGISTRADA' }}</span>
                  <h4 class="scm-empresa">{{ f.nombre_empresa || 'PROVEEDOR INDEFINIDO' }}</h4>
                  <span class="scm-id-full">ID: {{ f.id_factura }}</span>
                </div>
                <div class="scm-header-actions">
                  <a
                    v-if="f.url_factura"
                    :href="f.url_factura"
                    target="_blank"
                    class="btn-pdf-link"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    PDF Original
                  </a>
                  <div class="scm-badge">PROCESADO</div>
                </div>
              </div>

              <div class="scm-body">
                <div class="scm-section-label">DETALLE TÉCNICO DE LA IA</div>
                <div class="scm-table-header">
                  <span>SERVICIO / PRODUCTO</span>
                  <span>CANT.</span>
                  <span>SUBTOTAL</span>
                </div>

                <div v-if="f.servicios && f.servicios.length > 0" class="scm-items-list">
                  <div v-for="(s, idx) in f.servicios" :key="idx" class="scm-item-row">
                    <div class="scm-item-name">
                      <div class="dot"></div>
                      {{ s.nombre }}
                    </div>
                    <div class="scm-item-qty">x{{ s.cantidad || 1 }}</div>
                    <div class="scm-item-cost">$ {{ Number(s.costo).toLocaleString() }}</div>
                  </div>
                </div>
                <div v-else class="scm-pending-msg">
                  ⚙️ La IA está terminando de extraer los servicios de este documento...
                </div>
              </div>

              <div class="scm-footer">
                <div class="scm-total">
                  <span class="total-label">INVERSIÓN TOTAL:</span>
                  <span class="total-value">$ {{ Number(f.costo_total).toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { usuariosService, facturasService } from '../services/index'

const authStore = useAuthStore()
const cargando = ref(false)
const todasLasPlacas = ref([])
const placaSeleccionada = ref('')
const facturasAsociadas = ref([])

const inicializarVista = async () => {
  const documento = authStore.currentUser?.documento_identidad
  if (!documento) return

  try {
    const resV = await usuariosService.getVehiculos(documento)
    const rawV = resV.data
    const vehiculosServidor = Array.isArray(rawV) ? rawV : rawV?.data || rawV?.vehiculos || []
    const historialLocal = JSON.parse(localStorage.getItem('vehiculos_historial') || '[]')

    todasLasPlacas.value = [
      ...new Set([...vehiculosServidor.map((v) => v.placa), ...historialLocal.map((v) => v.placa)]),
    ]
  } catch (err) {
    console.error('Error al inicializar:', err)
  }
}

const consultarTodo = async () => {
  if (!placaSeleccionada.value) return

  cargando.value = true
  facturasAsociadas.value = []

  try {
    const resF = await facturasService.getByVehiculo(placaSeleccionada.value)
    const data = resF.data

    // Según Swagger, la respuesta es { placa: '...', total_facturas: X, facturas: [...] }
    facturasAsociadas.value = data.facturas || []
  } catch (err) {
    console.error('Error en consulta de unidad:', err)
  } finally {
    cargando.value = false
  }
}

onMounted(() => inicializarVista())
</script>

<style scoped>
.servicios-view {
  animation: fadeIn 0.4s ease;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 24px 32px;
  border-radius: 20px;
  border: 1px solid var(--c-primary-light);
  margin-bottom: 32px;
}
.view-header h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--c-text-main);
}
.view-sub {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--c-text-muted);
}
.search-box label {
  display: block;
  font-size: 10px;
  font-weight: 800;
  color: var(--c-primary-dark);
  margin-bottom: 8px;
  letter-spacing: 1px;
}
.search-controls {
  display: flex;
  gap: 12px;
}
.search-controls select {
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid var(--c-border);
  font-weight: 600;
  color: var(--c-text-main);
  min-width: 200px;
}

.btn-sync {
  background: var(--c-primary);
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-sync:disabled {
  background: var(--c-text-light);
  cursor: not-allowed;
}

.search-empty-state {
  padding: 80px;
  text-align: center;
  background: #fff;
  border-radius: 24px;
  border: 1px solid var(--c-border);
  color: var(--c-text-muted);
}
.search-icon-box {
  font-size: 48px;
  margin-bottom: 16px;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 16px;
}
.header-icon {
  font-size: 32px;
  background: var(--c-bg-surface-soft);
  padding: 10px;
  border-radius: 12px;
}
.view-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--c-text-main);
}

.search-panel {
  background: #fff;
  padding: 16px 24px;
  border-radius: 16px;
  border: 1px solid var(--c-primary-light);
}
.search-group label {
  display: block;
  font-size: 10px;
  font-weight: 800;
  color: var(--c-primary-dark);
  margin-bottom: 8px;
  letter-spacing: 1px;
}
.selector-wrapper {
  display: flex;
  gap: 12px;
}
.selector-wrapper select {
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid var(--c-border);
  font-weight: 600;
  min-width: 200px;
  outline: none;
}

.btn-sync-ia {
  background: var(--c-primary);
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}
.btn-sync-ia:hover {
  background: var(--c-primary-dark);
  transform: translateY(-1px);
}

.welcome-state {
  padding: 100px 0;
  display: flex;
  justify-content: center;
}
.welcome-box {
  text-align: center;
  max-width: 400px;
  background: #fff;
  padding: 40px;
  border-radius: 30px;
  border: 1px dashed var(--c-primary);
}
.welcome-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 20px;
}

.service-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
  padding-left: 30px;
}
.service-timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--c-primary-light);
}

.timeline-item {
  position: relative;
  margin-bottom: 40px;
}
.timeline-marker {
  position: absolute;
  left: -36px;
  top: 20px;
  width: 14px;
  height: 14px;
  background: var(--c-primary-dark);
  border: 3px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 4px var(--c-bg-surface-soft);
  z-index: 2;
}

.service-card-modern {
  background: #fff;
  border-radius: 20px;
  border: 1px solid var(--c-border);
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
.scm-header {
  background: var(--c-bg-surface-soft);
  padding: 20px 24px;
  border-bottom: 1px solid var(--c-bg-surface-soft);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.scm-id-full {
  display: block;
  font-size: 9px;
  font-weight: 600;
  color: var(--c-text-light);
  margin-top: 4px;
  font-family: monospace;
}
.scm-header-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.btn-pdf-link {
  background: #fff;
  border: 1px solid var(--c-border);
  color: var(--c-primary-dark);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}
.btn-pdf-link:hover {
  background: var(--c-bg-surface-soft);
  border-color: var(--c-primary-dark);
  transform: translateY(-1px);
}
.scm-date {
  font-size: 11px;
  font-weight: 800;
  color: var(--c-primary-dark);
  letter-spacing: 0.5px;
}
.scm-empresa {
  margin: 4px 0 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--c-text-main);
}
.scm-badge {
  background: var(--c-primary);
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  font-family: monospace;
}

.scm-body {
  padding: 24px;
}
.scm-section-label {
  font-size: 10px;
  font-weight: 800;
  color: var(--c-text-light);
  margin-bottom: 16px;
  letter-spacing: 1px;
}

.scm-table-header {
  display: grid;
  grid-template-columns: 1fr 60px 120px;
  padding: 0 12px 8px;
  border-bottom: 1px solid var(--c-bg-surface-soft);
  font-size: 10px;
  font-weight: 800;
  color: var(--c-text-muted);
}
.scm-item-row {
  display: grid;
  grid-template-columns: 1fr 60px 120px;
  padding: 12px;
  border-bottom: 1px solid var(--c-bg-surface-soft);
  align-items: center;
}
.scm-item-name {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 10px;
}
.dot {
  width: 6px;
  height: 6px;
  background: var(--c-primary-dark);
  border-radius: 50%;
}
.scm-item-qty {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-muted);
  text-align: center;
}
.scm-item-cost {
  font-size: 14px;
  font-weight: 800;
  color: var(--c-text-main);
  text-align: right;
  font-family: monospace;
}

.scm-footer {
  background: var(--c-bg-surface-soft);
  padding: 16px 24px;
  border-top: 1px solid var(--c-primary-light);
}
.scm-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.total-label {
  font-size: 12px;
  font-weight: 800;
  color: var(--c-primary-dark);
}
.total-value {
  font-size: 20px;
  font-weight: 900;
  color: var(--c-text-main);
}

.modern-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid var(--c-bg-surface-soft);
  border-top-color: var(--c-primary-dark);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.mini-empty {
  padding: 40px;
  text-align: center;
  color: var(--c-text-light);
  font-size: 13px;
  font-weight: 500;
  background: var(--c-bg-surface-soft);
  border-radius: 16px;
  border: 1px dashed var(--c-border);
}

.loading-state {
  padding: 100px;
  text-align: center;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--c-bg-surface-soft);
  border-top-color: var(--c-primary-dark);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}
.empty-state {
  padding: 100px;
  text-align: center;
  color: var(--c-text-light);
  background: #fff;
  border-radius: 24px;
  border: 1px dashed var(--c-primary-light);
}
</style>
