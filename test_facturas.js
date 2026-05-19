import axios from 'axios';


const api = axios.create({
  baseURL: 'https://apimivehiculo-production.up.railway.app'
});

async function testFactura() {
  try {
    // 1. Iniciar sesión para obtener token (usando el usuario de prueba que creamos antes)
    const newDoc = Math.floor(Math.random() * 1000000);
    await api.post('/api/auth/register', {
      nombres: 'Test', apellidos: 'Factura', correo: `testf${newDoc}@test.com`,
      fecha_nacimiento: '1990-01-01', documento_identidad: newDoc, contrasena: 'password123'
    });

    const loginParams = new URLSearchParams();
    loginParams.append('username', newDoc.toString());
    loginParams.append('password', 'password123');
    const loginRes = await api.post('/api/auth/login', loginParams);
    const token = loginRes.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // 2. Registrar un vehículo
    await api.post(`/api/usuarios/${newDoc}/vehiculos`, {
      vehiculo: { placa: 'ABC123D', cilindraje: 1500, marca: 'Toyota' },
      tarjeta_propiedad: {
        numero_tarjeta: 123456, nombre_propietario: 'Test', documento_propietario: newDoc,
        clase_vehiculo: 'Auto', modelo: '2020', capacidad: 5, servicio: 'Particular',
        tipo_carroceria: 'Sedan', linea_vehiculo: 'Corolla', numero_motor: '12345',
        combustible: 'Gasolina', color: 'Rojo'
      }
    });

    console.log('Usuario y Vehículo creados');

    // Aquí no puedo subir un PDF real fácilmente, necesitaría un archivo de prueba.
    // Vamos a ver si al menos puedo hacer un GET para ver qué onda
    const vehiculos = await api.get(`/api/usuarios/${newDoc}/vehiculos`);
    console.log('Vehiculos:', vehiculos.data);

  } catch (e) {
    console.error('Error:', e.response?.data || e.message);
  }
}

testFactura();
