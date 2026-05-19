import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import MainLayout from '../components/layout/MainLayout.vue'
import InicioView from '../views/InicioView.vue'
import MisVehiculosView from '../views/MisVehiculosView.vue'
import MisFacturasView from '../views/MisFacturasView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/',
      name: 'main',
      component: MainLayout,
      redirect: '/inicio',
      children: [
        {
          path: 'inicio',
          name: 'inicio',
          component: InicioView,
          meta: { title: 'Panel Principal' },
        },
        {
          path: 'mis-vehiculos',
          name: 'mis-vehiculos',
          component: MisVehiculosView,
          meta: { title: 'Mis Vehículos' },
        },
        {
          path: 'mis-facturas',
          name: 'mis-facturas',
          component: MisFacturasView,
          meta: { title: 'Mis Facturas' },
        },
        {
          path: 'historial',
          name: 'historial',
          component: () => import('../views/HistorialVehiculosView.vue'),
          meta: { title: 'Historial de Vehículos' },
        },
        {
          path: 'servicios',
          name: 'servicios',
          component: () => import('../views/ServiciosView.vue'),
          meta: { title: 'Historial de Servicios' },
        },
        {
          path: 'cuenta',
          name: 'cuenta',
          component: () => import('../views/CuentaView.vue'),
          meta: { title: 'Mi Cuenta' },
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const isAuth = localStorage.getItem('user_admin') !== null
  if (to.name !== 'login' && !isAuth) next({ name: 'login' })
  else if (to.name === 'login' && isAuth) next({ name: 'inicio' })
  else next()
})

export default router
