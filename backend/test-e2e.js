const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'http://localhost:3001';

async function runTest() {
  console.log('🚀 Iniciando pruebas E2E...');
  
  try {
    // 1. Login Admin
    console.log('\n🔐 1. Intentando iniciar sesión como admin...');
    const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
      username: 'admin',
      password: 'Admin2026!'
    });
    
    console.log('✅ Login exitoso. Estatus:', loginRes.status);
    console.log('Datos recibidos:', loginRes.data);
    
    // Guardar cookies
    const cookies = loginRes.headers['set-cookie'];
    if (!cookies) {
      throw new Error('No se recibió la cookie de sesión');
    }
    const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
    console.log('🍪 Cookie obtenida:', cookieHeader.substring(0, 30) + '...');

    // 2. Subir Archivo Excel
    console.log('\n📊 2. Cargando archivo Excel real...');
    const excelPath = 'c:\\Users\\CREDIAN\\Desktop\\compass_dabox\\2173 Reporte Mensual por participantes al mes de abril 2026.xlsx';
    if (!fs.existsSync(excelPath)) {
      throw new Error(`No se encontró el archivo Excel en: ${excelPath}`);
    }
    
    const form = new FormData();
    form.append('file', fs.createReadStream(excelPath));
    form.append('periodDate', '2026-04-01T12:00:00');

    const uploadRes = await axios.post(`${API_URL}/api/admin/upload`, form, {
      headers: {
        ...form.getHeaders(),
        'Cookie': cookieHeader
      }
    });

    console.log('✅ Archivo subido con éxito!');
    console.log('Estadísticas de la carga:');
    console.log(`- Registros procesados: ${uploadRes.data.recordsProcessed}`);
    console.log(`- Nuevos usuarios creados: ${uploadRes.data.newUsersCreated}`);
    console.log(`- Credenciales generadas: ${uploadRes.data.credentials?.length ?? 0}`);
    if (uploadRes.data.errors && uploadRes.data.errors.length > 0) {
      console.log('⚠️ Advertencias/Errores encontrados:', uploadRes.data.errors);
    }

    // Guardar una credencial para probar login de usuario
    const firstCredential = uploadRes.data.credentials?.[0];

    // 3. Consultar Dashboard Admin
    console.log('\n📈 3. Obteniendo métricas del dashboard de administrador...');
    const dashboardRes = await axios.get(`${API_URL}/api/admin/dashboard`, {
      headers: { 'Cookie': cookieHeader }
    });
    
    console.log('✅ Métricas obtenidas con éxito:');
    console.log(JSON.stringify(dashboardRes.data, null, 2));

    // 4. Consultar Lista de Colaboradores
    console.log('\n👥 4. Consultando lista de colaboradores...');
    const employeesRes = await axios.get(`${API_URL}/api/admin/employees?limit=5`, {
      headers: { 'Cookie': cookieHeader }
    });
    
    console.log('✅ Lista de colaboradores obtenida. Primeros registros:');
    console.log(employeesRes.data.employees.map(e => ({
      id: e.id,
      fullName: e.fullName,
      payrollCode: e.payrollCode,
      currentBalance: e.currentBalance
    })));

    // 5. Probar Login de Colaborador Creado
    if (firstCredential) {
      console.log(`\n🔑 5. Probando inicio de sesión de colaborador creado: ${firstCredential.username}...`);
      const userLoginRes = await axios.post(`${API_URL}/api/auth/login`, {
        username: firstCredential.username,
        password: firstCredential.tempPassword
      });
      
      console.log('✅ Inicio de sesión de colaborador exitoso!');
      console.log('Datos del colaborador:', userLoginRes.data);
      
      const userCookies = userLoginRes.headers['set-cookie'];
      const userCookieHeader = userCookies.map(c => c.split(';')[0]).join('; ');

      // 6. Consultar resumen de colaborador
      console.log('\n💰 6. Consultando resumen de ahorros del colaborador...');
      const summaryRes = await axios.get(`${API_URL}/api/user/summary`, {
        headers: { 'Cookie': userCookieHeader }
      });
      console.log('Resumen de ahorros:', summaryRes.data);
    } else {
      console.log('\n⚠️ Saltando prueba de colaborador (no se crearon credenciales porque ya existían en el seed o en cargas previas).');
    }

    console.log('\n🏆 ¡Todas las pruebas finalizaron exitosamente sin errores!');

  } catch (error) {
    console.error('\n❌ La prueba falló con error:');
    if (error.response) {
      console.error(`Estatus: ${error.response.status}`);
      console.error('Detalles del error:', error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

runTest();
