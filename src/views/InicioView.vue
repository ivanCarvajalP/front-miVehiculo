<template>
  <div class="inicio-view">

    <!-- Welcome Banner -->
    <div class="welcome-banner">
      <div class="welcome-info">
        <h1>Bienvenido, <span>{{ adminNombre }}</span></h1>
        <p>Gestión integral de su flota de vehículos y documentos asociados.</p>
      </div>
      <div class="welcome-meta">
        <div class="meta-date">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          {{ currentDate }}
        </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-left">
          <div class="kpi-icon green">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>
          </div>
          <div>
            <p class="kpi-label">Vehículos Registrados</p>
            <h3 class="kpi-value" v-if="!cargando">{{ totalVehiculos }}</h3>
            <div class="kpi-skeleton" v-else></div>
          </div>
        </div>
        <router-link to="/mis-vehiculos" class="kpi-link">Ver flota →</router-link>
      </div>

      <div class="kpi-card">
        <div class="kpi-left">
          <div class="kpi-icon teal">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <div>
            <p class="kpi-label">Facturas Registradas</p>
            <h3 class="kpi-value" v-if="!cargando">{{ totalFacturas }}</h3>
            <div class="kpi-skeleton" v-else></div>
          </div>
        </div>
        <router-link to="/mis-facturas" class="kpi-link">Ver facturas →</router-link>
      </div>

      <div class="kpi-card">
        <div class="kpi-left">
          <div class="kpi-icon emerald">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </div>
          <div>
            <p class="kpi-label">Servicios Activos</p>
            <h3 class="kpi-value" v-if="!cargando">0</h3>
            <div class="kpi-skeleton" v-else></div>
          </div>
        </div>
        <span class="kpi-link inactive">Próximamente</span>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="content-grid">

      <!-- Perfil -->
      <section class="card">
        <div class="card-head">
          <div class="card-head-title">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Perfil del Usuario
          </div>
          <router-link to="/cuenta" class="card-action-btn">
            Configurar Cuenta
          </router-link>
        </div>
        <div class="profile-list">
          <div class="profile-row">
            <span class="pr-label">Nombre Completo</span>
            <span class="pr-value">{{ adminNombre }}</span>
          </div>
          <div class="profile-row">
            <span class="pr-label">Documento de Identidad</span>
            <span class="pr-value mono">{{ adminId }}</span>
          </div>
          <div class="profile-row">
            <span class="pr-label">Correo Electrónico</span>
            <span class="pr-value">{{ adminCorreo || '—' }}</span>
          </div>
          <div class="profile-row">
            <span class="pr-label">Estado de Cuenta</span>
            <span class="badge-active">Verificado</span>
          </div>
        </div>
      </section>

      <!-- Acceso rápido vehículos -->
      <section class="card">
        <div class="card-head">
          <div class="card-head-title">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>
            Flota Reciente
          </div>
          <router-link to="/mis-vehiculos" class="card-action">Gestionar →</router-link>
        </div>

        <div v-if="cargando" class="list-loading">
          <div class="skel-row" v-for="i in 2" :key="i"></div>
        </div>
        <div v-else-if="vehiculosRecientes.length === 0" class="list-empty">
          <svg viewBox="0 0 24 24" width="28" height="28" stroke="var(--c-primary)" stroke-width="1.5" fill="none"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>
          <p>No hay vehículos en esta cuenta.<br>
            <router-link to="/mis-vehiculos" class="link-green">Registrar primer vehículo</router-link>
          </p>
        </div>
        <div v-else class="vehicle-list">
          <div v-for="(v, i) in vehiculosRecientes" :key="i" class="vehicle-row">
            <div class="vr-icon-box">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>
            </div>
            <div class="vr-data">
              <strong>{{ v.placa }}</strong>
              <span>{{ v.marca }} · {{ v.cilindraje || '—' }} cc</span>
            </div>
            <span class="badge-status">Activo</span>
          </div>
        </div>
      </section>
    </div>


  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { usuariosService, facturasService } from '../services/index';

const authStore = useAuthStore();

const adminNombre = computed(() => authStore.currentUser?.nombre || 'Usuario');
const adminId = computed(() => authStore.currentUser?.documento_identidad || '—');
const adminCorreo = computed(() => authStore.currentUser?.correo || '');

const currentDate = ref('');
const cargando = ref(true);
const totalVehiculos = ref(0);
const totalFacturas = ref(0);
const vehiculosRecientes = ref([]);

// Los datos ahora se cargan desde el store central

// ── Carga de datos ──────────────────────────────────────────────────────────────
const cargarDatos = async () => {
  const documento = authStore.currentUser?.documento_identidad;
  if (!documento) { cargando.value = false; return; }

  cargando.value = true;
  try {
    const [resV, resF] = await Promise.allSettled([
      usuariosService.getVehiculos(documento),
      facturasService.getByUsuario(documento)
    ]);

    if (resV.status === 'fulfilled') {
      const raw = resV.value.data;
      const arr = Array.isArray(raw) ? raw : (raw?.data || raw?.vehiculos || raw?.items || []);
      
      // Aplicar filtros de exclusión (historial y eliminados)
      const historial = JSON.parse(localStorage.getItem('vehiculos_historial') || '[]')
      const ocultos = JSON.parse(localStorage.getItem('vehiculos_ocultos') || '[]')
      const excluidos = [...historial.map(h => h.placa), ...ocultos]
      
      const activos = Array.isArray(arr) ? arr.filter(v => {
        const isExcluidoLocal = excluidos.includes(v.placa)
        const isInactiveServer = v.estado?.toLowerCase() === 'inactivo' || v.activo === false || v.de_baja === true
        return !isExcluidoLocal && !isInactiveServer
      }) : [];
      
      vehiculosRecientes.value = activos.slice(0, 4);
      totalVehiculos.value = activos.length;
    }

    if (resF.status === 'fulfilled') {
      const raw = resF.value.data;
      const arr = Array.isArray(raw) ? raw : (raw?.data || raw?.facturas || raw?.items || []);
      totalFacturas.value = Array.isArray(arr) ? arr.length : 0;
    }
  } catch (e) {
    console.error('Error cargando inicio:', e);
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  currentDate.value = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  cargarDatos();
});
</script>

<style scoped>
.inicio-view { animation: fadeUp 0.4s ease-out; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

/* WELCOME BANNER */
.welcome-banner {
  background: linear-gradient(135deg, var(--c-primary-light) 0%, var(--c-primary) 100%);
  border-radius: 20px; padding: 28px 32px;
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 28px;
  box-shadow: 0 4px 20px rgba(148, 163, 184, 0.2);
}
.welcome-info h1 { margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px; }
.welcome-info h1 span { color: #ffffff; }
.welcome-info p { margin: 6px 0 0; color: rgba(255,255,255,0.8); font-size: 14px; font-weight: 400; }

.meta-date { 
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
  color: #ffffff; font-size: 13px; font-weight: 500; padding: 8px 14px; border-radius: 8px;
  display: flex; align-items: center; gap: 6px;
}

/* KPI GRID */
.kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 28px; }
.kpi-card { 
  background: #fff; border-radius: 16px; border: 1px solid var(--c-primary-light);
  padding: 20px 24px; display: flex; align-items: center; justify-content: space-between;
  transition: all 0.2s; box-shadow: 0 2px 8px rgba(148, 163, 184, 0.1);
}
.kpi-card:hover { box-shadow: 0 8px 20px rgba(148, 163, 184, 0.15); transform: translateY(-2px); border-color: var(--c-primary); }
.kpi-left { display: flex; align-items: center; gap: 16px; }
.kpi-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
.kpi-icon.green { background: var(--c-primary-light); color: var(--c-primary-dark); }
.kpi-icon.teal { background: #ccfbf1; color: #0d9488; }
.kpi-icon.emerald { background: var(--c-primary-light); color: var(--c-primary-dark); }
.kpi-label { margin: 0; font-size: 12px; font-weight: 600; color: var(--c-text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.kpi-value { margin: 4px 0 0; font-size: 28px; font-weight: 800; color: var(--c-text-main); letter-spacing: -1px; }
.kpi-skeleton { width: 48px; height: 28px; background: var(--c-primary-light); border-radius: 6px; margin-top: 4px; animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.kpi-link { font-size: 12px; font-weight: 700; color: var(--c-primary-dark); text-decoration: none; white-space: nowrap; padding: 6px 10px; border-radius: 6px; transition: background 0.2s; }
.kpi-link:hover { background: var(--c-bg-surface-soft); }
.kpi-link.inactive { color: #9ca3af; cursor: default; }

/* CONTENT GRID */
.content-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 20px; }

.card { background: #fff; border-radius: 16px; border: 1px solid var(--c-primary-light); padding: 0; overflow: hidden; box-shadow: 0 2px 8px rgba(148, 163, 184, 0.1); }
.card-head { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--c-bg-surface-soft); }
.card-head-title { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; color: var(--c-text-main); }
.card-head-title svg { color: var(--c-primary-dark); }
.card-action { font-size: 13px; font-weight: 600; color: var(--c-primary-dark); text-decoration: none; }
.card-action:hover { text-decoration: underline; }

.card-action-btn {
  background: var(--c-bg-surface-soft); border: 1px solid var(--c-primary); color: var(--c-primary-dark);
  padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;
  font-family: inherit;
}
.card-action-btn:hover { background: var(--c-primary-light); border-color: var(--c-primary); }

/* PROFILE */
.profile-list { padding: 8px 0; }
.profile-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 24px; border-bottom: 1px solid #f9fafb; }
.profile-row:last-child { border-bottom: none; }
.pr-label { font-size: 13px; color: var(--c-text-muted); font-weight: 500; }
.pr-value { font-size: 13px; font-weight: 600; color: var(--c-text-main); }
.pr-value.mono { font-family: monospace; letter-spacing: 1px; }
.badge-active { background: var(--c-primary-light); color: var(--c-success-text); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }

/* VEHICLES */
.list-loading { padding: 16px 24px; display: flex; flex-direction: column; gap: 12px; }
.skel-row { height: 52px; background: var(--c-bg-surface-soft); border-radius: 10px; animation: pulse 1.5s ease-in-out infinite; }

.list-empty { padding: 36px 24px; text-align: center; color: var(--c-text-muted); font-size: 14px; line-height: 1.6; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.link-green { color: var(--c-primary-dark); font-weight: 600; text-decoration: none; }
.link-green:hover { text-decoration: underline; }

.vehicle-list { padding: 8px 0; }
.vehicle-row { display: flex; align-items: center; gap: 14px; padding: 14px 24px; border-bottom: 1px solid #f9fafb; transition: background 0.15s; }
.vehicle-row:last-child { border-bottom: none; }
.vehicle-row:hover { background: var(--c-bg-surface-soft); }
.vr-icon-box { width: 36px; height: 36px; background: var(--c-primary-light); color: var(--c-primary-dark); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.vr-data { flex: 1; }
.vr-data strong { display: block; font-size: 14px; font-weight: 700; color: var(--c-text-main); font-family: monospace; letter-spacing: 1.5px; }
.vr-data span { font-size: 12px; color: var(--c-text-muted); font-weight: 400; }
.badge-status { background: var(--c-bg-surface-soft); color: var(--c-primary-dark); border: 1px solid var(--c-primary); padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }

/* ── MODAL EDICIÓN ─────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(5, 46, 22, 0.45);
  backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
}
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.modal-box {
  background: #fff; border-radius: 20px; width: 520px; max-width: 100%;
  display: flex; flex-direction: column;
  box-shadow: 0 30px 60px rgba(148, 163, 184, 0.2);
  animation: scaleIn 0.2s ease-out;
}
@keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.modal-head {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 24px 28px; border-bottom: 1px solid var(--c-bg-surface-soft);
  background: linear-gradient(135deg, var(--c-primary-light), var(--c-primary));
  border-radius: 20px 20px 0 0;
}
.modal-head-info h4 { margin: 0; font-size: 18px; font-weight: 800; color: var(--c-text-main); }
.modal-sub { margin: 4px 0 0; font-size: 13px; color: var(--c-primary); }
.modal-close-btn {
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
  color: var(--c-primary); width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
}
.modal-close-btn:hover { background: rgba(255,255,255,0.2); transform: rotate(90deg); }

.modal-content { padding: 24px 28px; display: flex; flex-direction: column; gap: 20px; }

.edit-avatar-row { display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--c-bg-surface-soft); border-radius: 12px; border: 1px solid var(--c-primary-light); }
.edit-avatar { width: 52px; height: 52px; background: linear-gradient(135deg, var(--c-primary-dark), var(--c-primary-dark)); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; color: var(--c-text-main); flex-shrink: 0; }
.avatar-name { margin: 0; font-size: 16px; font-weight: 700; color: var(--c-text-main); }
.avatar-doc { font-size: 12px; color: var(--c-text-muted); font-family: monospace; }

.edit-form { display: flex; flex-direction: column; gap: 16px; }
.edit-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.edit-group { display: flex; flex-direction: column; gap: 6px; }
.edit-group label { font-size: 12px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; }
.edit-group input {
  padding: 10px 14px; border: 1px solid var(--c-primary-light); border-radius: 8px;
  font-size: 14px; color: var(--c-text-main); background: var(--c-bg-surface); font-family: inherit;
  transition: all 0.2s; outline: none;
}
.edit-group input:focus { border-color: var(--c-primary-dark); box-shadow: 0 0 0 3px rgba(22,163,74,0.12); background: #fff; }
.edit-group input.input-err { border-color: #ef4444; }
.err-msg { font-size: 12px; color: #ef4444; font-weight: 500; }

.alert-ok { background: var(--c-bg-surface-soft); border: 1px solid var(--c-primary); color: var(--c-success-text); padding: 12px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.alert-err { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 12px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 8px; }

.modal-foot { padding: 20px 28px; border-top: 1px solid var(--c-bg-surface-soft); display: flex; justify-content: flex-end; gap: 12px; }
.btn-cancel { background: #fff; border: 1px solid var(--c-primary-light); color: var(--c-text-muted); padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; font-family: inherit; transition: all 0.2s; }
.btn-cancel:hover:not(:disabled) { background: #f9fafb; }
.btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-save {
  background: linear-gradient(135deg, var(--c-primary-dark), var(--c-primary-dark)); color: var(--c-text-main); border: none;
  padding: 10px 22px; border-radius: 8px; font-weight: 700; font-size: 14px;
  cursor: pointer; font-family: inherit; display: flex; align-items: center; gap: 8px;
  transition: all 0.2s; box-shadow: 0 4px 12px rgba(22,163,74,0.25);
}
.btn-save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(22,163,74,0.35); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.mini-spin { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: var(--c-text-main); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1024px) {
  .kpi-grid { grid-template-columns: 1fr 1fr; }
  .content-grid { grid-template-columns: 1fr; }
}
@media (max-width: 700px) {
  .kpi-grid { grid-template-columns: 1fr; }
  .welcome-banner { flex-direction: column; align-items: flex-start; gap: 16px; }
  .edit-row { grid-template-columns: 1fr; }
}
</style>
