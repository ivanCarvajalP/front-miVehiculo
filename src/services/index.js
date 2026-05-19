import api from './api'

// ─── Autenticación ────────────────────────────────────────────────────────────
export const authService = {
  /**
   * POST /api/auth/login
   * Requiere formato application/x-www-form-urlencoded para OAuth2
   */
  login(documento_identidad, contrasena) {
    const params = new URLSearchParams()
    params.append('username', documento_identidad.toString())
    params.append('password', contrasena)

    return api.post('/api/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  },

  /**
   * POST /api/auth/register
   * Envía JSON
   */
  register(payload) {
    return api.post('/api/auth/register', payload)
  },
}

// ─── Usuarios ──────────────────────────────────────────────────────────────────
export const usuariosService = {
  /** GET /api/usuarios/:documento */
  getByDocumento(documento) {
    return api.get(`/api/usuarios/${documento}`)
  },

  /** PUT /api/usuarios/:documento */
  update(documento, payload) {
    return api.put(`/api/usuarios/${documento}`, payload)
  },

  /** Actualizar Contraseña (PUT) */
  actualizarPassword(documento, contrasena) {
    return api.put(`/api/usuarios/${documento}`, { contrasena })
  },

  /** GET /api/usuarios/:documento/vehiculos */
  getVehiculos(documento) {
    return api.get(`/api/usuarios/${documento}/vehiculos`)
  },

  /** POST /api/usuarios/:documento/vehiculos */
  registrarVehiculo(documento, payload) {
    return api.post(`/api/usuarios/${documento}/vehiculos`, payload)
  },

  /** DELETE /api/usuarios/:documento/vehiculos/:placa */
  eliminarVehiculo(documento, placa) {
    return api.delete(`/api/usuarios/${documento}/vehiculos/${placa}`)
  },
}

// ─── Facturas ──────────────────────────────────────────────────────────────────
export const facturasService = {
  /** POST /api/facturas/upload */
  upload(documento, placa, file) {
    const formData = new FormData()
    // Forzamos un nombre de archivo ultra-único para evitar bloqueos del backend
    const uniqueName = `upload_${Date.now()}_${Math.floor(Math.random() * 1000)}_${file.name}`

    formData.append('file', file, uniqueName)
    formData.append('placa', placa.trim().toUpperCase())
    formData.append('documento_identidad', documento.toString().trim())

    return api.post('/api/facturas/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  /** GET /api/facturas/usuario/:documento */
  getByUsuario(documento) {
    return api.get(`/api/facturas/usuario/${documento}`)
  },

  /** GET /api/facturas/vehiculo/:placa */
  getByVehiculo(placa) {
    return api.get(`/api/facturas/vehiculo/${placa}`)
  },

  /** GET /api/facturas/tarjeta/:placa */
  getTarjetaPropiedad(placa) {
    return api.get(`/api/facturas/tarjeta/${placa}`)
  },

  /** DELETE /api/facturas/:id_factura */
  delete(idFactura) {
    return api.delete(`/api/facturas/${idFactura}`)
  },

  /** Obtiene la URL completa para visualizar el PDF */
  getFacturaUrl(idFactura) {
    return `${api.defaults.baseURL}/api/facturas/${idFactura}/view`
  },
}

// ─── Semántica / SPARQL via Fuseki ────────────────────────────────────────────
export const semanticaService = {
  /** GET /api/semantica/usuarios-vehiculos */
  getUsuariosConVehiculos() {
    return api.get('/api/semantica/usuarios-vehiculos')
  },

  /** GET /api/semantica/usuarios/:documento/vehiculos */
  getVehiculosPorDocumento(documento) {
    return api.get(`/api/semantica/usuarios/${documento}/vehiculos`)
  },

  /** GET /api/semantica/facturas-vehiculos */
  getFacturasConVehiculos() {
    return api.get('/api/semantica/facturas-vehiculos')
  },

  /** GET /api/semantica/vehiculos/:placa/servicios */
  getServiciosPorPlaca(placa) {
    return api.get(`/api/semantica/vehiculos/${placa}/servicios`)
  },
}

// ─── Inteligencia Artificial ──────────────────────────────────────────────────
export const iaService = {
  /** POST /api/ia/chat */
  chat(mensaje) {
    return api.post('/api/ia/chat', { mensaje })
  }
}
