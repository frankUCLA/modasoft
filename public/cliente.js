document.addEventListener('DOMContentLoaded', () => {
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
