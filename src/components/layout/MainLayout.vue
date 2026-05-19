<template>
  <div class="main-layout">
    <aside class="sidebar">
      <!-- Logo -->
      <div class="sidebar-brand">
        <div class="brand-icon">
          <svg width="20" height="16" viewBox="0 0 52 40" fill="none">
            <rect x="4" y="16" width="44" height="16" rx="5" fill="white"/>
            <path d="M12 16 L18 5 H34 L40 16 Z" fill="white" fill-opacity="0.8"/>
            <circle cx="14" cy="33" r="5" fill="var(--c-primary-dark)"/>
            <circle cx="38" cy="33" r="5" fill="var(--c-primary-dark)"/>
          </svg>
        </div>
        <div class="brand-text">
          <span class="brand-name">mi<strong>Vehículo</strong></span>
          <span class="brand-sub">Sistema de Gestión</span>
        </div>
      </div>

      <!-- Divider -->
      <div class="sidebar-divider"></div>

      <!-- Nav -->
      <nav class="side-nav">
        <p class="nav-label">PRINCIPAL</p>
        <router-link to="/inicio" custom v-slot="{ navigate, isActive }">
          <button @click="navigate" :class="['nav-item', { active: isActive }]">
            <div class="nav-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>
            </div>
            <span>Inicio</span>
          </button>
        </router-link>
        <router-link to="/cuenta" custom v-slot="{ navigate, isActive }">
          <button @click="navigate" :class="['nav-item', { active: isActive }]">
            <div class="nav-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <span>Mi Cuenta</span>
          </button>
        </router-link>

        <p class="nav-label" style="margin-top: 24px;">MÓDULOS</p>
        <router-link to="/mis-vehiculos" custom v-slot="{ navigate, isActive }">
          <button @click="navigate" :class="['nav-item', { active: isActive }]">
            <div class="nav-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>
            </div>
            <span>Mis Vehículos</span>
          </button>
        </router-link>
        <router-link to="/mis-facturas" custom v-slot="{ navigate, isActive }">
          <button @click="navigate" :class="['nav-item', { active: isActive }]">
            <div class="nav-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            </div>
            <span>Mis Facturas</span>
          </button>
        </router-link>
        <router-link to="/servicios" custom v-slot="{ navigate, isActive }">
          <button @click="navigate" :class="['nav-item', { active: isActive }]">
            <div class="nav-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            </div>
            <span>Historial de Servicios</span>
          </button>
        </router-link>
        <router-link to="/historial" custom v-slot="{ navigate, isActive }">
          <button @click="navigate" :class="['nav-item', { active: isActive }]">
            <div class="nav-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <span>Historial Vehículos</span>
          </button>
        </router-link>
      </nav>

      <!-- Spacer -->
      <div style="flex: 1;"></div>

      <!-- User Card -->
      <div class="sidebar-user-card">
        <div class="user-avatar">{{ userLetra }}</div>
        <div class="user-details">
          <span class="user-name">{{ userName }}</span>
          <span class="user-doc">Doc: {{ userDoc }}</span>
        </div>
        <button @click="logout" class="btn-logout" title="Cerrar sesión">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-header">
        <div class="page-title-block">
          <h2>{{ route.meta.title || 'Panel Principal' }}</h2>
        </div>
        <div class="header-user-pill">
          <div class="pill-avatar">{{ userLetra }}</div>
          <span>{{ userName }}</span>
        </div>
      </header>
      <div class="view-content">
        <router-view></router-view>
      </div>
    </main>
    <FloatingChat />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import FloatingChat from '../ui/FloatingChat.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const userName = computed(() => authStore.currentUser?.nombre || 'Usuario')
const userDoc = computed(() => authStore.currentUser?.documento_identidad || '---')
const userLetra = computed(() => userName.value?.[0]?.toUpperCase() || 'U')

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

* { box-sizing: border-box; }

.main-layout { 
  display: flex; height: 100vh; 
  font-family: 'Inter', -apple-system, sans-serif;
  background: var(--c-bg-surface-soft);
}

/* ── SIDEBAR ──────────────────────────────── */
.sidebar { 
  width: 268px; min-width: 268px;
  background: var(--c-primary); /* Yale Blue */
  padding: 28px 20px;
  display: flex; flex-direction: column;
  border-right: none;
}

.sidebar-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.brand-icon { 
  width: 40px; height: 40px; background: linear-gradient(135deg, var(--c-primary-dark), var(--c-primary-dark));
  border-radius: 12px; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4);
  flex-shrink: 0;
}
.brand-text { display: flex; flex-direction: column; }
.brand-name { color: #ffffff; font-size: 16px; font-weight: 400; }
.brand-name strong { font-weight: 800; }
.brand-sub { color: var(--c-primary-light); font-size: 10px; font-weight: 500; letter-spacing: 0.8px; text-transform: uppercase; }

.sidebar-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 20px 0; }

.nav-label { 
  font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.6); letter-spacing: 1px; 
  text-transform: uppercase; margin: 0 0 8px 8px;
}

.side-nav { display: flex; flex-direction: column; gap: 4px; }

.nav-item { 
  width: 100%; background: transparent; border: none; 
  color: rgba(255,255,255,0.8); padding: 11px 12px; border-radius: 10px; cursor: pointer; 
  font-weight: 500; font-size: 14px; font-family: inherit;
  display: flex; align-items: center; gap: 12px;
  transition: all 0.2s ease;
  text-align: left;
}
.nav-item:hover { background: rgba(255,255,255,0.1); color: #ffffff; }
.nav-item.active { background: var(--c-primary-hover); color: #ffffff; font-weight: 600; box-shadow: 0 4px 14px rgba(0,0,0,0.15); }
.nav-item.active .nav-icon { color: #ffffff; }
.nav-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; opacity: 0.85; color: inherit; }
.nav-item.active .nav-icon { opacity: 1; }

/* ── USER CARD ────────────────────────────── */
.sidebar-user-card { 
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px; padding: 14px 16px;
  display: flex; align-items: center; gap: 12px;
}
.user-avatar { 
  width: 36px; height: 36px; min-width: 36px;
  background: linear-gradient(135deg, var(--c-primary-dark), var(--c-primary-dark));
  border-radius: 10px; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px; color: #ffffff;
}
.user-details { flex: 1; overflow: hidden; }
.user-name { display: block; color: #ffffff; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-doc { display: block; color: var(--c-primary-light); font-size: 11px; font-weight: 400; margin-top: 1px; }

.btn-logout { 
  background: transparent; border: none; color: rgba(255,255,255,0.7); cursor: pointer; 
  padding: 6px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.btn-logout:hover { background: rgba(255,255,255,0.1); color: #ffffff; }

/* ── MAIN CONTENT ─────────────────────────── */
.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

.top-header { 
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 40px; background: var(--c-bg-surface);
  border-bottom: 1px solid var(--c-bg-surface-soft);
  min-height: 72px;
}
.page-title-block h2 { margin: 0; font-size: 22px; font-weight: 700; color: var(--c-text-main); letter-spacing: -0.4px; }

.header-user-pill { 
  display: flex; align-items: center; gap: 10px;
  background: var(--c-bg-surface-soft); border: 1px solid var(--c-primary);
  padding: 8px 16px 8px 10px; border-radius: 50px;
  font-size: 13px; font-weight: 600; color: var(--c-primary-dark);
}
.pill-avatar { 
  width: 28px; height: 28px; background: var(--c-primary); border-radius: 50%; 
  display: flex; align-items: center; justify-content: center; 
  font-size: 12px; font-weight: 700; color: #ffffff;
}

.view-content { flex: 1; overflow-y: auto; padding: 36px 40px; }
</style>
