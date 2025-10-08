document.addEventListener('DOMContentLoaded', () => {
  // Elementos del DOM
  const loginSection = document.getElementById('loginSection');
  const panelSection = document.getElementById('panelSection');
  const loginBtn = document.getElementById('loginBtn');
  const usuarioEl = document.getElementById('usuario');
  const passwordEl = document.getElementById('password');
  const loginMsg = document.getElementById('loginMsg');
  const userPanel = document.getElementById('userPanel');
  const userName = document.getElementById('userName');
  const logoutBtn = document.getElementById('logoutBtn');
  const rolLabel = document.getElementById('rolLabel');
  const adminPanel = document.getElementById('adminPanel');
  const cajaPanel = document.getElementById('cajaPanel');
  const btnCrearProd = document.getElementById('btnCrearProd');
  const prodNombre = document.getElementById('prodNombre');
  const prodPrecio = document.getElementById('prodPrecio');
  const btnBuscarProd = document.getElementById('btnBuscarProd');
  const prodBuscar = document.getElementById('prodBuscar');
  const adminProductos = document.getElementById('adminProductos');
  const btnNuevaVenta = document.getElementById('btnNuevaVenta');
  const ventaTotal = document.getElementById('ventaTotal');
  const ventaCliente = document.getElementById('ventaCliente');
  const ventaDetalle = document.getElementById('ventaDetalle');
  
  // NUEVO: Referencia al elemento de estado de conexión
  const statusDisplay = document.getElementById('statusDisplay'); 

  // Estado actual
  let currentTab = 'admin'; // 'admin' o 'caja'
  const tabs = document.querySelectorAll('.tabBtn');
  tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));

  // Inicio
  checkStatus();

  // Eventos
  loginBtn.addEventListener('click', async () => {
    const usuario = usuarioEl.value.trim();
    const password = passwordEl.value.trim();
    if (!usuario || !password) {
      loginMsg.textContent = 'Ingresa usuario y contraseña';
      loginMsg.style.color = 'red';
      return;
    }
    // Llamada de login (necesitas endpoint /api/login en backend)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ usuario, password }),
      });
      const data = await res.json();
      if (data.ok) {
        loginMsg.textContent = 'Login exitoso';
        loginMsg.style.color = 'green';
        // Refrescar estado
        await checkStatus();
      } else {
        loginMsg.textContent = data.error || 'Error de login';
        loginMsg.style.color = 'red';
      }
    } catch (e) {
      loginMsg.textContent = 'Error de conexión';
      loginMsg.style.color = 'red';
    }
  });

  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    // Refrescar estado
    await checkStatus();
  });

  btnCrearProd.addEventListener('click', async () => {
    const nombre = prodNombre.value.trim();
    const precio = parseFloat(prodPrecio.value);
    if (!nombre || isNaN(precio) || precio <= 0) {
      alert('Ingrese nombre y precio válidos');
      return;
    }
    try {
      // id_categoria: 1 es un valor de ejemplo que espera el backend
      const res = await fetch('/api/admin/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nombre, descripcion: 'Nuevo producto', precio_venta: precio, id_categoria: 1 }),
      });
      const data = await res.json();
      if (data.ok) {
        prodNombre.value = '';
        prodPrecio.value = '';
        alert('Producto creado con ID: ' + data.id_producto);
        loadAdminProductos();
      } else {
        alert('Error al crear producto: ' + (data.error || 'Desconocido'));
      }
    } catch (e) {
      alert('Error de red al crear producto');
    }
  });

  btnBuscarProd.addEventListener('click', async () => {
    const q = prodBuscar.value.trim();
    await loadAdminProductos(q);
  });
  
  btnNuevaVenta.addEventListener('click', async () => {
    const cliente = ventaCliente.value.trim();
    const total = parseFloat(ventaTotal.value);
    
    if (isNaN(total) || total <= 0) {
      alert('Ingrese un total de venta válido');
      return;
    }

    // La ruta de caja en el backend espera { monto, id_cliente }
    try {
      const res = await fetch('/api/caja/venta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id_cliente: cliente || null, monto: total }),
      });
      const data = await res.json();
      if (data.ok) {
        ventaTotal.value = '';
        ventaCliente.value = '';
        ventaDetalle.innerHTML = `<div class="item success">Venta registrada (ID: ${data.id_venta}): ${total.toFixed(2)}</div>`;
      } else {
        alert(data.error || 'Error al registrar venta');
      }
    } catch (e) {
      alert('Error de red al registrar venta');
    }
  });

  // Funciones de utilidad
  async function checkStatus() {
    try {
      const res = await fetch('/api/status', { credentials: 'include' });
      const data = await res.json();
      
      // NUEVO: Mostrar estado del Servidor y BD
      const servidorStatus = data.servidor ? 'Servidor: ✅ OK' : 'Servidor: ❌ FAIL';
      const bdStatus = data.bd ? 'BD: ✅ OK' : 'BD: ❌ FAIL';
      statusDisplay.textContent = `${servidorStatus} | ${bdStatus}`;
      statusDisplay.style.color = (data.servidor && data.bd) ? 'var(--success-color)' : 'var(--error-color)';
      
      if (data.servidor && data.bd && data.usuario) {
        // Autenticado
        loginSection.style.display = 'none';
        panelSection.style.display = 'block';
        userPanel.classList.remove('hidden');
        
        userName.textContent = data.usuario;
        rolLabel.textContent = data.rol || 'Usuario';
        
        // Cargar panel según rol
        const rol = (data.rol || '').toLowerCase();
        if (rol === 'administrador') {
          switchTab('admin');
          await loadAdminProductos();
        } else if (rol === 'caja') {
          switchTab('caja');
        } else {
          // Rol desconocido: mostrar panel por defecto
          switchTab(currentTab);
        }
      } else {
        // No autenticado
        loginSection.style.display = 'block';
        panelSection.style.display = 'none';
        userPanel.classList.add('hidden');
      }
    } catch (e) {
      // Si falla la solicitud, sugiere conectar
      statusDisplay.textContent = 'Servidor: ❌ OFFLINE | BD: ❌ DESCONOCIDA';
      statusDisplay.style.color = 'var(--error-color)';
      loginSection.style.display = 'block';
      panelSection.style.display = 'none';
      userPanel.classList.add('hidden');
      loginMsg.textContent = 'Error de conexión con el servidor (ver consola)';
      loginMsg.style.color = 'red';
      console.error(e);
    }
  }

  async function loadAdminProductos(q = '') {
    try {
      const query = q ? `?q=${q}` : '';
      const res = await fetch(`/api/admin/productos${query}`, { credentials: 'include' });
      const data = await res.json();
      
      if (data.productos) {
        adminProductos.innerHTML = data.productos.map(p => `  
          <div class="item">  
            ID: ${p.id_producto} | ${p.nombre} | $${parseFloat(p.precio_venta).toFixed(2)}  
          </div>  
        `).join('');
      } else {
        adminProductos.innerHTML = '<div class="item">No hay productos. Intenta crear uno.</div>';
      }
    } catch (e) {
      adminProductos.innerHTML = '<div class="item error">Error al cargar productos (Permiso/Red)</div>';
    }
  }

  function switchTab(tab) {
    currentTab = tab;
    if (tab === 'admin') {
      adminPanel.style.display = 'block';
      cajaPanel.style.display = 'none';
    } else {
      adminPanel.style.display = 'none';
      cajaPanel.style.display = 'block';
    }
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  }
   // Inicializar estado de tabs
  switchTab(currentTab);
});