import axios from 'axios';

const api = axios.create({
  baseURL: 'https://apimivehiculo-production.up.railway.app'
});

async function test() {
  try {
    // 1. Register a test user
    const doc = Math.floor(Math.random() * 1000000);
    await api.post('/api/auth/register', {
      nombres: 'Test',
      apellidos: 'User',
      correo: `test${doc}@test.com`,
      fecha_nacimiento: '1990-01-01',
      documento_identidad: doc,
      contrasena: 'password123'
    });

    // 2. Login
    const loginParams = new URLSearchParams();
    loginParams.append('username', doc.toString());
    loginParams.append('password', 'password123');
    const loginRes = await api.post('/api/auth/login', loginParams);
    const token = loginRes.data.access_token;

    // 3. Try updating password with ALL fields included
    try {
      const passRes = await api.put(`/api/usuarios/${doc}`, {
        nombres: 'Test',
        apellidos: 'User',
        correo: `test${doc}@test.com`,
        fecha_nacimiento: '1990-01-01',
        contrasena: 'newpassword123'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Update with contrasena success:', passRes.data);
    } catch(e) {
      console.log('Update with contrasena failed:', e.response?.data || e.message);
    }

    // 4. Try logging in with the NEW password
    try {
      const loginParams2 = new URLSearchParams();
      loginParams2.append('username', doc.toString());
      loginParams2.append('password', 'newpassword123');
      await api.post('/api/auth/login', loginParams2);
      console.log('Login with NEW password success!');
    } catch (e) {
      console.log('Login with NEW password failed:', e.response?.data || e.message);
    }

  } catch (e) {
    console.error('Error:', e.response?.data || e.message);
  }
}

test();
