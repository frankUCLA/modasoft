document.addEventListener('DOMContentLoaded', () => {
    // --- Mostrar tallas dinámicas en registro de producto ---
    const tallasDinamicasDiv = document.getElementById('tallas-dinamicas');
    async function mostrarTallasDinamicas() {
        if (!tallasDinamicasDiv) return;
        try {
            const res = await fetch('/api/tallas');
            const data = await res.json();
            tallasDinamicasDiv.innerHTML = '';
            data.tallas.forEach(talla => {
                const label = document.createElement('label');
                label.style.marginRight = '10px';
                label.innerHTML = `<b>${talla.nombre}</b> <input type='number' min='0' value='0' style='width:60px;' name='cantidad_talla_${talla.id_talla}' data-id-talla='${talla.id_talla}'>`;
                tallasDinamicasDiv.appendChild(label);
            });
        } catch {}
    }
    mostrarTallasDinamicas();
    // --- ADMINISTRADOR: Gestión de Tallas ---
    const formTalla = document.getElementById('form-talla');
    const catalogoTallas = document.getElementById('catalogoTallas');
    async function cargarTallas() {
        try {
            const res = await fetch('/api/tallas');
            const data = await res.json();
            if (catalogoTallas) {
                catalogoTallas.innerHTML = '';
                if (data.tallas.length === 0) {
                    catalogoTallas.innerHTML = '<div class="item">No hay tallas registradas.</div>';
                } else {
                    data.tallas.forEach(talla => {
                        const div = document.createElement('div');
                        div.className = 'item';
                        div.innerHTML = `<b>${talla.nombre}</b> | Ajuste: ${talla.ajuste || ''} | Pecho: ${talla.pecho || '-'} | Cintura: ${talla.cintura || '-'} | Cadera: ${talla.cadera || '-'} | Largo: ${talla.largo || '-'} <button class='btn danger' style='background:#ef4444;color:#fff;margin-left:10px;' onclick='eliminarTalla(${talla.id_talla})'>Eliminar</button>`;
                        catalogoTallas.appendChild(div);
                    });
                }
            }
        } catch { catalogoTallas.innerHTML = '<div class="item">Error al cargar tallas.</div>'; }
    }
    if (formTalla) {
        formTalla.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('tallaNombre').value.trim();
            const ajuste = document.getElementById('tallaAjuste').value;
            const pecho = parseInt(document.getElementById('tallaPecho').value) || null;
            const cintura = parseInt(document.getElementById('tallaCintura').value) || null;
            const cadera = parseInt(document.getElementById('tallaCadera').value) || null;
            const largo = parseInt(document.getElementById('tallaLargo').value) || null;
            if (!nombre || !ajuste) return;
            try {
                const nombre = document.getElementById('tallaNombre').value.trim();
                const ajuste = document.getElementById('tallaAjuste').value;
                const pecho = parseInt(document.getElementById('tallaPecho').value) || null;
                const cintura = parseInt(document.getElementById('tallaCintura').value) || null;
                const cadera = parseInt(document.getElementById('tallaCadera').value) || null;
                const largo = parseInt(document.getElementById('tallaLargo').value) || null;
                const res = await fetch('/api/tallas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, ajuste, pecho, cintura, cadera, largo })
                });
                const data = await res.json();
                if (data.ok) {
                    formTalla.reset();
                    cargarTallas();
                } else {
                    alert('Error al crear talla');
                }
            } catch (err) { alert('Error de conexión'); }
        });
        cargarTallas();
    }
    window.eliminarTalla = async function(id) {
        if (!confirm('¿Seguro que deseas eliminar esta talla?')) return;
        try {
            const res = await fetch(`/api/tallas/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.ok) {
                cargarTallas();
            } else {
                alert('Error al eliminar talla');
            }
        } catch { alert('Error de conexión'); }
    };
    // Funciones para cargar opciones en el modal de edición
    async function cargarOpcionesEdicionCategoria(selectedId) {
        const select = document.getElementById('editCategoria');
        if (!select) return;
        try {
            const res = await fetch('/api/categorias');
            const data = await res.json();
            select.innerHTML = '';
            data.categorias.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.id_categoria;
                opt.textContent = cat.nombre;
                if (cat.id_categoria == selectedId) opt.selected = true;
                select.appendChild(opt);
            });
        } catch {}
    }
    async function cargarOpcionesEdicionProveedor(selectedId) {
        const select = document.getElementById('editProveedor');
        if (!select) return;
        try {
            const res = await fetch('/api/proveedores');
            const data = await res.json();
            select.innerHTML = '';
            data.proveedores.forEach(prov => {
                const opt = document.createElement('option');
                opt.value = prov.id_proveedor;
                opt.textContent = prov.nombre;
                if (prov.id_proveedor == selectedId) opt.selected = true;
                select.appendChild(opt);
            });
        } catch {}
    }
    // --- Modal de edición de producto ---
    const modalEditar = document.getElementById('modalEditarProducto');
    const formEditar = document.getElementById('formEditarProducto');
    const btnCerrarModal = document.getElementById('btnCerrarModal');
    async function mostrarModalEditar(prod) {
    document.getElementById('editIdProducto').value = prod.id_producto;
    document.getElementById('editMarca').value = prod.marca || '';
    document.getElementById('editNombre').value = prod.nombre;
    document.getElementById('editInventario').value = prod.inventario ?? 0;
    document.getElementById('editPrecio').value = prod.precio_venta;
    await cargarOpcionesEdicionCategoria(prod.id_categoria);
    await cargarOpcionesEdicionProveedor(prod.id_proveedor);
    modalEditar.style.display = 'flex';
    }
    if (btnCerrarModal) {
        btnCerrarModal.onclick = () => { modalEditar.style.display = 'none'; };
    }
    if (formEditar) {
        formEditar.onsubmit = async (e) => {
            e.preventDefault();
            const id = document.getElementById('editIdProducto').value;
            const marca = document.getElementById('editMarca').value.trim();
            const nombre = document.getElementById('editNombre').value.trim();
            const inventario = parseInt(document.getElementById('editInventario').value);
            const precio = parseFloat(document.getElementById('editPrecio').value);
            const id_categoria = document.getElementById('editCategoria').value;
            const id_proveedor = document.getElementById('editProveedor').value;
            if (!marca || !nombre || isNaN(inventario) || isNaN(precio) || !id_categoria || !id_proveedor) {
                alert('Completa todos los campos.'); return;
            }
            try {
                const res = await fetch(`/api/admin/productos/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ marca, nombre, inventario, precio, id_categoria, id_proveedor })
                });
                const data = await res.json();
                if (data.ok) {
                    modalEditar.style.display = 'none';
                    cargarProductos();
                } else {
                    alert('Error al editar producto');
                }
            } catch { alert('Error de conexión'); }
        };
    }
    window.editarProducto = async function(id) {
        try {
            const res = await fetch(`/api/admin/productos/${id}`);
            const data = await res.json();
            if (data.producto) {
                mostrarModalEditar(data.producto);
            } else {
                alert('No se encontró el producto');
            }
        } catch { alert('Error al cargar producto'); }
    };
    // --- ADMINISTRADOR: Listado, edición y eliminación de productos ---
    const adminProductos = document.getElementById('adminProductos');
    async function cargarProductos() {
        try {
            const res = await fetch('/api/admin/productos');
            const data = await res.json();
            if (adminProductos) {
                adminProductos.innerHTML = '';
                if (data.productos.length === 0) {
                    adminProductos.innerHTML = '<div class="item">No hay productos registrados.</div>';
                } else {
                    // Crear tabla bonita
                    let tabla = `<table class='tabla-productos' style='width:100%;border-collapse:collapse;'>
                        <thead>
                            <tr style='background:#e0e7ef;'>
                                <th>Marca</th>
                                <th>Nombre</th>
                                <th>Cantidad</th>
                                <th>Precio ($)</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>`;
                    data.productos.forEach(prod => {
                        tabla += `<tr style='border-bottom:1px solid #ccc;'>
                            <td>${prod.marca || ''}</td>
                            <td>${prod.nombre}</td>
                            <td>${prod.tallas || ''}</td>
                            <td>${prod.precio_venta}</td>
                            <td>
                                <button class='btn' style='background:#3b82f6;color:#fff;margin-right:5px;' onclick='editarProducto(${prod.id_producto})'>Editar</button>
                                <button class='btn danger' style='background:#ef4444;color:#fff;' onclick='eliminarProducto(${prod.id_producto})'>Eliminar</button>
                            </td>
                        </tr>`;
                    });
                    tabla += '</tbody></table>';
                    adminProductos.innerHTML = tabla;
                }
            }
        } catch { adminProductos.innerHTML = '<div class="item">Error al cargar productos.</div>'; }
    }
    // (Ya está definida la versión funcional de window.editarProducto más arriba)
    window.eliminarProducto = async function(id) {
        if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
        try {
            const res = await fetch(`/api/admin/productos/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.ok) {
                cargarProductos();
            } else {
                alert('Error al eliminar producto');
            }
        } catch { alert('Error de conexión'); }
    };
    // Cargar productos al iniciar
    cargarProductos();
    // --- ADMINISTRADOR: Registro de Categorías ---
    const formCategoria = document.getElementById('form-categoria');
    const catalogoCategorias = document.getElementById('catalogoCategorias');
    const prodCategoria = document.getElementById('prodCategoria');
    async function cargarCategorias() {
        try {
            const res = await fetch('/api/categorias');
            const data = await res.json();
            if (catalogoCategorias) {
                catalogoCategorias.innerHTML = '';
                data.categorias.forEach(cat => {
                    const div = document.createElement('div');
                    div.className = 'item';
                    div.innerHTML = `${cat.nombre} <button class='btn danger' style='background:#ef4444;color:#fff;margin-left:10px;' onclick='eliminarCategoria(${cat.id_categoria})'>Eliminar</button>`;
                    catalogoCategorias.appendChild(div);
                });
            }
            if (prodCategoria) {
                prodCategoria.innerHTML = '<option value="">Selecciona Categoría</option>';
                data.categorias.forEach(cat => {
                    const opt = document.createElement('option');
                    opt.value = cat.id_categoria;
                    opt.textContent = cat.nombre_categoria;
                    prodCategoria.appendChild(opt);
                });
            }
        } catch {}
    }
    if (formCategoria) {
        formCategoria.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('catNombre').value.trim();
            if (!nombre) return;
            try {
                const res = await fetch('/api/categorias', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre })
                });
                const data = await res.json();
                if (data.ok) {
                    formCategoria.reset();
                    cargarCategorias();
                } else {
                    alert('Error al crear categoría');
                }
            } catch { alert('Error de conexión'); }
        });
        cargarCategorias();
    }

    // --- ADMINISTRADOR: Registro de Proveedores ---
    const formProveedor = document.getElementById('form-proveedor');
    const catalogoProveedores = document.getElementById('catalogoProveedores');
    const prodProveedor = document.getElementById('prodProveedor');
    async function cargarProveedores() {
        try {
            const res = await fetch('/api/proveedores');
            const data = await res.json();
            if (catalogoProveedores) {
                catalogoProveedores.innerHTML = '';
                data.proveedores.forEach(prov => {
                    const div = document.createElement('div');
                    div.className = 'item';
                    div.innerHTML = `${prov.nombre} <button class='btn danger' style='background:#ef4444;color:#fff;margin-left:10px;' onclick='eliminarProveedor(${prov.id_proveedor})'>Eliminar</button>`;
                    catalogoProveedores.appendChild(div);
                });
    window.eliminarCategoria = async function(id) {
        if (!confirm('¿Seguro que deseas eliminar esta categoría?')) return;
        try {
            const res = await fetch(`/api/categorias/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.ok) {
                cargarCategorias();
            } else {
                alert('Error al eliminar categoría');
            }
        } catch { alert('Error de conexión'); }
    };

    window.eliminarProveedor = async function(id) {
        if (!confirm('¿Seguro que deseas eliminar este proveedor?')) return;
        try {
            const res = await fetch(`/api/proveedores/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.ok) {
                cargarProveedores();
            } else {
                alert('Error al eliminar proveedor');
            }
        } catch { alert('Error de conexión'); }
    };
            }
            if (prodProveedor) {
                prodProveedor.innerHTML = '<option value="">Selecciona Proveedor</option>';
                data.proveedores.forEach(prov => {
                    const opt = document.createElement('option');
                    opt.value = prov.id_proveedor;
                    opt.textContent = prov.nombre;
                    prodProveedor.appendChild(opt);
                });
            }
        } catch {}
    }
    if (formProveedor) {
        formProveedor.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('provNombre').value.trim();
            const contacto = document.getElementById('provContacto').value.trim();
            const telefono = document.getElementById('provTelefono').value.trim();
            if (!nombre) return;
            try {
                const res = await fetch('/api/proveedores', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, contacto, telefono })
                });
                const data = await res.json();
                if (data.ok) {
                    formProveedor.reset();
                    cargarProveedores();
                } else {
                    alert('Error al crear proveedor');
                }
            } catch { alert('Error de conexión'); }
        });
        cargarProveedores();
    }
    // --- ADMINISTRADOR: Registro de Productos ---
    const formProductoAdmin = document.getElementById('form-producto-admin');
    if (formProductoAdmin) {
        formProductoAdmin.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Obtener datos del formulario
            const marca = document.getElementById('prodMarca').value.trim();
            const categoria = document.getElementById('prodCategoria').value;
            const proveedor = document.getElementById('prodProveedor').value;
            const nombre = document.getElementById('prodNombre').value.trim();
            const precio = parseFloat(document.getElementById('prodPrecio').value);
            const inventario = parseInt(document.getElementById('prodInventario').value);
            // Obtener cantidades por talla
            const cantidades = [];
            if (tallasDinamicasDiv) {
                const inputs = tallasDinamicasDiv.querySelectorAll('input[type="number"]');
                inputs.forEach(input => {
                    const id_talla = input.getAttribute('data-id-talla');
                    const cantidad = parseInt(input.value) || 0;
                    cantidades.push({ id_talla, cantidad });
                });
            }
            // Validación básica
            if (!marca || !categoria || !proveedor || !nombre || isNaN(precio) || isNaN(inventario)) {
                alert('Completa todos los campos obligatorios.');
                return;
            }
            // Enviar al backend
            try {
                const res = await fetch('/api/productos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ marca, categoria, proveedor, nombre, precio, inventario, cantidades })
                });
                const data = await res.json();
                if (data.ok) {
                    alert('Producto registrado correctamente.');
                    formProductoAdmin.reset();
                    mostrarTallasDinamicas();
                } else {
                    alert('Error al registrar producto: ' + (data.error || ''));
                }
            } catch (err) {
                alert('Error de conexión al guardar producto.');
            }
        });
    }

    // --- CAJA: Registro de Ventas ---
    const formVentaCaja = document.getElementById('form-venta-caja');
    if (formVentaCaja) {
        // Autocompletar datos del cliente al ingresar la cédula
        const inputCedula = document.getElementById('ventaClienteCedula');
        const inputNombre = document.getElementById('ventaClienteNombre');
        const inputTelefono = document.getElementById('ventaClienteTelefono');
        const inputEmail = document.getElementById('ventaClienteEmail');

        inputCedula.addEventListener('blur', async () => {
            const cedula = inputCedula.value.trim();
            if (!cedula) return;
            try {
                const res = await fetch(`/api/clientes/buscar?cedula=${encodeURIComponent(cedula)}`);
                const data = await res.json();
                if (data.cliente) {
                    inputNombre.value = data.cliente.nombre;
                    // En la tabla, telefono es la cedula y email es el telefono
                    if (inputTelefono) inputTelefono.value = data.cliente.telefono || '';
                    if (inputEmail) inputEmail.value = data.cliente.email || '';
                } else {
                    inputNombre.value = '';
                    if (inputTelefono) inputTelefono.value = '';
                    if (inputEmail) inputEmail.value = '';
                }
            } catch {}
        });
        // Actualizar totales automáticamente
        const precioUnitario = document.getElementById('ventaPrecioUnitario');
        const cantidad = document.getElementById('ventaCantidad');
        const totalDolar = document.getElementById('ventaTotalDolar');
        const totalBs = document.getElementById('ventaTotalBs');

        async function actualizarTotales() {
            const precio = parseFloat(precioUnitario.value) || 0;
            const cant = parseInt(cantidad.value) || 0;
            const total = precio * cant;
            totalDolar.value = total.toFixed(2);
            // Obtener tasa BCV
            let tasa = 36; // Valor fijo de ejemplo, deberías obtenerlo de una API real
            try {
                const res = await fetch('/api/tasa-bcv');
                const data = await res.json();
                if (data.tasa) tasa = parseFloat(data.tasa);
            } catch {}
            totalBs.value = (total * tasa).toFixed(2);
        }
        precioUnitario.addEventListener('input', actualizarTotales);
        cantidad.addEventListener('input', actualizarTotales);

        formVentaCaja.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Obtener datos del formulario
            const cliente_nombre = document.getElementById('ventaClienteNombre').value.trim();
            const cliente_cedula = document.getElementById('ventaClienteCedula').value.trim();
            const cliente_telefono = document.getElementById('ventaClienteTelefono') ? document.getElementById('ventaClienteTelefono').value.trim() : '';
            const cliente_email = document.getElementById('ventaClienteEmail') ? document.getElementById('ventaClienteEmail').value.trim() : '';
            const marca = document.getElementById('ventaMarca').value.trim();
            const talla = document.getElementById('ventaTalla').value;
            const cantidadVal = parseInt(document.getElementById('ventaCantidad').value);
            const precio_unitario = parseFloat(document.getElementById('ventaPrecioUnitario').value);
            const total_dolar = parseFloat(document.getElementById('ventaTotalDolar').value);
            const total_bs = parseFloat(document.getElementById('ventaTotalBs').value);
            const tipo_pago = document.getElementById('ventaTipoPago').value;

            if (!cliente_nombre || !cliente_cedula || !marca || !talla || isNaN(cantidadVal) || isNaN(precio_unitario)) {
                alert('Completa todos los campos obligatorios.');
                return;
            }

            // Enviar al backend
            try {
                const res = await fetch('/api/ventas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cliente_nombre, cliente_cedula, cliente_telefono, cliente_email, marca, talla, cantidad: cantidadVal, precio_unitario, total_dolar, total_bs, tipo_pago })
                });
                const data = await res.json();
                if (data.ok) {
                    alert('Venta registrada correctamente.');
                    formVentaCaja.reset();
                    totalDolar.value = '';
                    totalBs.value = '';
                } else {
                    alert('Error al registrar venta: ' + (data.error || ''));
                }
            } catch (err) {
                alert('Error de conexión al guardar venta.');
            }
        });
    }
    // 1. Elementos del DOM
    const loginSection = document.getElementById('loginSection');
    const loginBtn = document.getElementById('loginBtn');
    const usuarioEl = document.getElementById('usuario');
    const passwordEl = document.getElementById('password');
    const loginMsg = document.getElementById('loginMsg');
    const statusDisplay = document.getElementById('statusDisplay');
    // Elemento genérico para cerrar sesión (espera ser usado en otros HTML)
    const logoutBtn = document.getElementById('logoutBtn'); 
    
    /**
     * Función reutilizable para cerrar la sesión.
     */
    async function handleLogout() {
        if (loginMsg) loginMsg.textContent = 'Cerrando sesión...';
        try {
            await fetch('/api/logout', { method: 'POST', credentials: 'include' });
        } catch (e) {
            console.error('Error al intentar cerrar sesión:', e);
        }
        // Recargar la página para limpiar el estado y volver al login
        window.location.href = 'index.html'; // Siempre volvemos al index.html
    }


    /**
     * Función que chequea el estado del servidor y la sesión.
     * @param {boolean} shouldRedirect - Si es true, redirige al usuario según su rol si está autenticado.
     */
    async function checkStatus(shouldRedirect = false) {
        if (!statusDisplay || !loginSection) return;

        statusDisplay.textContent = 'Cargando estado...';
        statusDisplay.style.color = 'gray';
        if (loginMsg) loginMsg.textContent = '';
        
        try {
            const res = await fetch('/api/status', { credentials: 'include' });
            const data = await res.json();
            
            // 3.1. Actualizar indicador de estado
            const servidorStatus = data.servidor ? 'Servidor: ✅ OK' : 'Servidor: ❌ FAIL';
            const bdStatus = data.bd ? 'BD: ✅ OK' : 'BD: ❌ FAIL';
            statusDisplay.textContent = `${servidorStatus} | ${bdStatus}`;
            statusDisplay.style.color = (data.servidor && data.bd) ? '#10b981' : '#ef4444'; 
            
            // 3.2. Manejo de autenticación
            if (data.servidor && data.bd && data.usuario) {
                const rol = (data.rol || '').toLowerCase();
                
                if (shouldRedirect) {
                    // Solo redirigimos si es un login EXITOSO (shouldRedirect=true)
                    if (rol === 'administrador') {
                        window.location.href = 'admin.html';
                    } else if (rol === 'caja') {
                        window.location.href = 'caja.html';
                    } else {
                        // Rol no reconocido, mostramos mensaje de sesión activa aquí
                        displayActiveSession(data, rol);
                    }
                } else {
                    // Sesión activa en carga inicial, PERO NO REDIRIGIMOS
                    // Mostramos el mensaje de sesión activa en lugar del formulario.
                    displayActiveSession(data, rol);
                }
            } else {
                // No autenticado: Mostrar el formulario de login.
                if (loginSection) loginSection.style.display = 'block';
                if (loginMsg) {
                    loginMsg.textContent = 'Introduce tus credenciales para continuar.';
                    loginMsg.style.color = '#3b82f6';
                }
            }
        } catch (e) {
            // Falla de red/servidor apagado
            statusDisplay.textContent = 'Servidor: ❌ OFFLINE | BD: ❌ DESCONOCIDA';
            statusDisplay.style.color = '#ef4444';
            if (loginMsg) {
                loginMsg.textContent = 'Error: No se pudo conectar con el servidor. Revise Node.js.';
                loginMsg.style.color = '#ef4444';
            }
            console.error('Fallo grave de conexión:', e);
        }
    }

    // Nueva función para mostrar la sesión activa y el botón de logout
    function displayActiveSession(data, rol) {
        // En index.html, reemplazamos el formulario de login
        if (loginSection) {
            loginSection.innerHTML = `
                <h2 style="color: #3b82f6;">Sesión Activa</h2>
                <p style="padding: 15px; background: #e0f2fe; border-radius: 4px; margin-top: 15px;">
                    Bienvenido, <strong>${data.usuario}</strong> (${data.rol || 'Usuario'}). 
                    <br>Por favor, usa el botón de abajo para ir a tu panel o cerrar sesión.
                    <br>Tu rol es: <strong>${rol.toUpperCase()}</strong>
                </p>
                <button id="goToPanelBtn" class="btn primary" style="margin-top: 15px;">Ir a mi Panel</button>
                <button id="logoutDummyBtn" class="btn secondary" style="margin-top: 15px;">Cerrar sesión</button>
            `;
            
            const logoutDummyBtn = document.getElementById('logoutDummyBtn');
            const goToPanelBtn = document.getElementById('goToPanelBtn');

            if (logoutDummyBtn) {
                logoutDummyBtn.addEventListener('click', handleLogout);
            }

            if (goToPanelBtn) {
                goToPanelBtn.addEventListener('click', () => {
                    // Forzamos la redirección manual al panel correcto
                    const targetRol = (data.rol || '').toLowerCase();
                    if (targetRol === 'administrador') {
                        window.location.href = 'admin.html';
                    } else if (targetRol === 'caja') {
                        window.location.href = 'caja.html';
                    } else {
                        // En el entorno real, usarías un modal o mensaje.
                        alert('Tu rol no tiene un panel de destino definido.'); 
                    }
                });
            }
        }
    }


    // 4. Eventos
    // Evento de Login (Solo en index.html)
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const usuario = usuarioEl.value.trim();
            const password = passwordEl.value.trim();
            if (loginMsg) loginMsg.textContent = ''; 

            if (!usuario || !password) {
                if (loginMsg) {
                    loginMsg.textContent = 'Ingresa usuario y contraseña';
                    loginMsg.style.color = '#ef4444'; 
                }
                return;
            }

            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ usuario, password }),
                });
                const data = await res.json();
                if (data.ok) {
                    if (loginMsg) {
                        loginMsg.textContent = 'Login exitoso, redirigiendo...';
                        loginMsg.style.color = '#10b981';
                    }
                    // Redirigimos SÓLO después de un login exitoso (checkStatus(true))
                    await checkStatus(true); 
                } else {
                    if (loginMsg) {
                        loginMsg.textContent = data.error || 'Error de login. Credenciales inválidas.';
                        loginMsg.style.color = '#ef4444';
                    }
                    if (passwordEl) passwordEl.value = '';
                }
            } catch (e) {
                if (loginMsg) {
                    loginMsg.textContent = 'Error de conexión con el servidor.';
                    loginMsg.style.color = '#ef4444';
                }
            }
        });
    }

    // 5. Inicialización
    // Llama a checkStatus(false) para verificar el estado de la conexión PERO NO REDIRIGIR AUTOMÁTICAMENTE
    // Si hay una sesión activa en index.html, muestra el mensaje de "Sesión Activa".
    checkStatus(false);
    
    // 6. Listener para el botón genérico de Logout
    // Esto hace que el mismo script funcione en admin.html y caja.html si tienen un elemento con ID 'logoutBtn'
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});
