<template>
  <div class="facturas-view">
    <div class="view-header">
      <div>
        <h3>Mis Facturas</h3>
        <p class="view-sub">Carga y administración de documentos legales y técnicos de su flota</p>
      </div>
      <button class="btn-refresh" @click="cargarTodo" :disabled="cargando">
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
        Sincronizar Archivos
      </button>
    </div>

    <!-- Panel de Carga (DISEÑO PREMIUM) -->
    <div v-if="exitoSubida" class="upload-success-state">
      <div class="success-icon-box">
        <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="3" fill="none">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <h4>¡Archivo cargado con éxito!</h4>
      <p>El documento ha sido enviado para su procesamiento técnico.</p>
      <button class="btn-primary-custom" @click="resetCarga">Aceptar</button>
    </div>

    <div v-else class="upload-panel-dark">
      <div class="up-header">
        <div class="up-icon">
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
        </div>
        <div>
          <h4>Subir Nuevo Documento</h4>
          <p>Seleccione el vehículo y el archivo PDF para su procesamiento.</p>
        </div>
      </div>

      <div class="up-form">
        <div class="up-group">
          <label>VEHÍCULO ASOCIADO</label>
          <select v-model="placaSubir" class="select-dark">
            <option value="">Seleccione placa...</option>
            <option v-for="v in vehiculos" :key="v.placa" :value="v.placa">
              {{ v.placa }} - {{ v.marca }}
            </option>
          </select>
        </div>

        <div class="up-group">
          <label>ARCHIVO FACTURA (PDF)</label>
          <div class="file-drop-dark" :class="{ 'file-active': archivoSubir }">
            {{ archivoSubir ? archivoSubir.name.slice(0, 25) + '...' : 'ELEGIR DOCUMENTO' }}
            <!-- ESTE ES EL CAMPO QUE PERMITE SELECCIONAR -->
            <input
              type="file"
              @change="onFileChange"
              accept="application/pdf"
              class="input-hidden"
            />
          </div>
        </div>

        <button
          class="btn-upload-white"
          @click="subirFactura"
          :disabled="subiendo || !placaSubir || !archivoSubir"
        >
          <span v-if="subiendo">CARGANDO...</span>
          <span v-else>Cargar Factura</span>
        </button>
      </div>

      <div v-if="uploadError" class="up-error-msg">⚠️ {{ uploadError }}</div>
    </div>

    <!-- Listado de Gestión -->
    <div class="gestion-section">
      <div class="gs-header">
        <h4>Documentos Registrados</h4>
        <span class="gs-count">{{ facturas.length }} archivos</span>
      </div>

      <div v-if="cargando" class="gs-loading">
        <div class="spinner-mini"></div>
        <p>Actualizando lista...</p>
      </div>

      <div v-else-if="facturas.length === 0" class="gs-empty">
        No se encontraron facturas registradas.
      </div>

      <div v-else class="gs-grid">
        <div v-for="f in facturas" :key="f.id_factura" class="gs-card">
          <div class="gs-card-main">
            <div class="gs-card-icon">📄</div>
            <div class="gs-card-info">
              <span class="gs-card-name">{{ f.nombre_archivo || (f.url_archivo ? f.url_archivo.split('/').pop() : 'Factura #' + f.id_factura) }}</span>
              <span class="gs-card-plate">{{ f.vehiculo_placa || f.placa || 'Documento Técnico' }}</span>
            </div>
          </div>
          <div class="gs-card-actions">
            <button class="btn-delete-mini" @click="eliminarFactura(f.id_factura)" title="Eliminar">
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              >
                <polyline points="3 6 5 6 21 6" />
                <path
                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { facturasService, usuariosService } from '../services/index'

const authStore = useAuthStore()
const vehiculos = ref([])
const facturas = ref([])
const placaSubir = ref('')
const archivoSubir = ref(null)
const subiendo = ref(false)
const uploadError = ref('')
const exitoSubida = ref(false)
const cargando = ref(false)

const cargarTodo = async () => {
  const documento = authStore.currentUser?.documento_identidad
  if (!documento) return

  cargando.value = true
  try {
    const resV = await usuariosService.getVehiculos(documento)
    vehiculos.value = Array.isArray(resV.data) ? resV.data : resV.data?.vehiculos || []

    const resF = await facturasService.getByUsuario(documento)
    const dataF = resF.data
    facturas.value = Array.isArray(dataF) ? dataF : dataF?.facturas || dataF?.data || []
  } catch (err) {
    console.error('Error:', err)
  } finally {
    cargando.value = false
  }
}

const onFileChange = (e) => {
  archivoSubir.value = e.target.files[0] || null
  uploadError.value = ''
}

const subirFactura = async () => {
  const documento = authStore.currentUser?.documento_identidad
  if (!documento || !placaSubir.value || !archivoSubir.value) return

  subiendo.value = true
  uploadError.value = ''
  try {
    await facturasService.upload(documento, placaSubir.value.toUpperCase(), archivoSubir.value)
    exitoSubida.value = true
    archivoSubir.value = null
    placaSubir.value = ''
    await cargarTodo()
  } catch (err) {
    uploadError.value = err.response?.data?.detail || 'Error al subir el archivo.'
  } finally {
    subiendo.value = false
  }
}

const eliminarFactura = async (id) => {
  if (!confirm('¿Eliminar esta factura permanentemente?')) return
  try {
    await facturasService.delete(id)
    await cargarTodo()
  } catch (err) {
    alert('Error al eliminar.')
  }
}

const resetCarga = () => {
  exitoSubida.value = false
}

onMounted(() => cargarTodo())
</script>

<style scoped>
.facturas-view {
  padding: 24px;
  animation: fadeIn 0.4s ease-out;
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
  margin-bottom: 32px;
}
.view-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--c-text-main);
}
.view-sub {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--c-text-muted);
}

.btn-refresh {
  background: var(--c-bg-surface-soft);
  border: 1px solid var(--c-primary);
  color: var(--c-primary-dark);
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* PANEL DE CARGA */
.upload-panel-dark {
  background: var(--c-bg-surface);
  border-radius: 24px;
  padding: 40px;
  color: var(--c-text-main);
  border: 1px solid var(--c-bg-surface-soft);
  box-shadow: var(--shadow-md);
  margin-bottom: 40px;
}
.up-header {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 32px;
}
.up-icon {
  background: var(--c-primary-light);
  color: var(--c-primary);
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.up-header h4 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}
.up-header p {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--c-text-muted);
}

.up-form {
  display: grid;
  grid-template-columns: 1fr 1.2fr auto;
  gap: 20px;
  align-items: flex-end;
}
.up-group label {
  display: block;
  font-size: 10px;
  font-weight: 800;
  color: var(--c-primary-hover);
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}
.select-dark {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid var(--c-border);
  background: var(--c-bg-surface-soft);
  color: var(--c-text-main);
  font-weight: 700;
  outline: none;
}
.select-dark:focus {
  border-color: var(--c-primary);
}

.file-drop-dark {
  position: relative;
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: 2px dashed var(--c-border);
  background: var(--c-bg-surface-soft);
  color: var(--c-text-main);
  font-size: 13px;
  font-weight: 800;
  text-align: center;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s;
}
.file-drop-dark:hover {
  border-color: var(--c-primary);
  background: var(--c-primary-light);
}
.input-hidden {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 10;
}

.btn-upload-white {
  height: 52px;
  background: var(--c-bg-surface-soft);
  color: var(--c-text-muted);
  border: none;
  padding: 0 24px;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-upload-white:not(:disabled) {
  background: var(--c-primary);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(27, 64, 121, 0.2);
}
.btn-upload-white:not(:disabled):hover {
  background: var(--c-primary-hover);
  transform: translateY(-2px);
}

/* ESTADO DE ÉXITO */
.upload-success-state {
  background: var(--c-bg-surface);
  border-radius: 24px;
  padding: 60px 40px;
  text-align: center;
  border: 1px solid var(--c-primary-light);
  box-shadow: var(--shadow-md);
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.4s ease;
}
.success-icon-box {
  width: 72px;
  height: 72px;
  background: var(--c-success-bg);
  color: var(--c-success-text);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}
.upload-success-state h4 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 800;
  color: var(--c-text-main);
}
.upload-success-state p {
  margin: 0 0 32px;
  font-size: 15px;
  color: var(--c-text-muted);
}
.btn-primary-custom {
  background: var(--c-primary);
  color: #ffffff;
  border: none;
  padding: 14px 40px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(27, 64, 121, 0.2);
}
.btn-primary-custom:hover {
  background: var(--c-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(27, 64, 121, 0.3);
}

/* GESTIÓN */
.gestion-section {
  border-top: 1px solid var(--c-primary-light);
  padding-top: 32px;
}
.gs-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}
.gs-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--c-text-main);
}
.gs-count {
  background: var(--c-bg-surface-soft);
  color: var(--c-primary-dark);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}

.gs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.gs-card {
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.gs-card-info {
  display: flex;
  flex-direction: column;
}
.gs-card-name {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}
.gs-card-plate {
  font-size: 11px;
  font-weight: 700;
  color: var(--c-primary-dark);
}

.btn-delete-mini {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gs-empty,
.gs-loading {
  padding: 40px;
  text-align: center;
  color: var(--c-text-light);
}
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
