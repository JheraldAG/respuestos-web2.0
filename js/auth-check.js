// auth-check.js - Verificador de autenticación mejorado
// Este archivo se debe cargar en TODAS las páginas después del navbar

document.addEventListener('DOMContentLoaded', function() {
    console.log("=== INICIANDO VERIFICACIÓN DE AUTENTICACIÓN ===");
    
    // Inicializar Session Manager si no existe
    if (!window.sessionManager) {
        console.log("Session Manager no encontrado, cargando fallback...");
        // Cargar fallback básico
        initializeFallbackAuth();
    } else {
        console.log("Session Manager encontrado, verificando estado...");
        // El Session Manager se encargará de todo
        window.sessionManager.init();
    }
    
    // Verificar estado actual (para debug)
    checkCurrentAuthStatus();
    
    // Configurar botón de logout global
    setupGlobalLogout();
    
    // Actualizar contador del carrito
    updateCartCount();
});

// ============================================================================
// FUNCIONES PRINCIPALES
// ============================================================================

/**
 * Función de fallback para cuando no hay Session Manager
 */
function initializeFallbackAuth() {
    console.log("Usando sistema de autenticación fallback");
    
    // Verificar usuario actual
    const user = getCurrentUser();
    const isLoggedIn = checkIfLoggedIn();
    
    console.log("Estado de autenticación:", {
        usuario: user,
        logueado: isLoggedIn
    });
    
    // Actualizar navbar
    updateNavbarAuth(user, isLoggedIn);
    
    // Configurar eventos
    setupAuthListeners();
}

/**
 * Obtener usuario actual de localStorage
 */
function getCurrentUser() {
    try {
        // Intentar formato antiguo primero
        let user = JSON.parse(localStorage.getItem('user'));
        
        if (user && user.loggedIn) {
            return user;
        }
        
        // Intentar formato nuevo
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (currentUser && isLoggedIn) {
            user = {
                name: currentUser.name || currentUser.email.split('@')[0],
                email: currentUser.email,
                loggedIn: true
            };
            
            // Guardar en formato antiguo para compatibilidad
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        }
        
        // Intentar formato "repuestos_*"
        const repuestosCurrentUser = JSON.parse(localStorage.getItem('repuestos_currentUser'));
        const repuestosIsLoggedIn = localStorage.getItem('repuestos_isLoggedIn') === 'true';
        
        if (repuestosCurrentUser && repuestosIsLoggedIn) {
            user = {
                name: repuestosCurrentUser.name || repuestosCurrentUser.email.split('@')[0],
                email: repuestosCurrentUser.email,
                loggedIn: true
            };
            
            // Migrar a formato estándar
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('currentUser', JSON.stringify(repuestosCurrentUser));
            localStorage.setItem('isLoggedIn', 'true');
            
            return user;
        }
        
        return null;
        
    } catch (error) {
        console.error("Error obteniendo usuario:", error);
        return null;
    }
}

/**
 * Verificar si el usuario está logueado
 */
function checkIfLoggedIn() {
    try {
        // Verificar múltiples formatos
        const user = getCurrentUser();
        return user !== null && user.loggedIn === true;
        
    } catch (error) {
        console.error("Error verificando login:", error);
        return false;
    }
}

/**
 * Actualizar navbar según estado de autenticación
 */
function updateNavbarAuth(user, isLoggedIn) {
    const authButtons = document.getElementById('authButtons');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const btnLogout = document.getElementById('btnLogout');
    
    if (!authButtons || !userInfo) {
        console.warn("Elementos del navbar no encontrados");
        return;
    }
    
    if (isLoggedIn && user) {
        // Usuario logueado
        console.log("Mostrando información de usuario en navbar");
        
        authButtons.style.display = 'none';
        userInfo.style.display = 'flex';
        
        if (userName) {
            // Mostrar solo el primer nombre
            const displayName = user.name ? user.name.split(' ')[0] : user.email.split('@')[0];
            userName.textContent = displayName;
        }
        
        // Configurar botón de logout si existe
        if (btnLogout) {
            btnLogout.onclick = function(e) {
                e.preventDefault();
                logoutUser();
            };
        }
        
    } else {
        // Usuario no logueado
        console.log("Mostrando botones de autenticación en navbar");
        
        authButtons.style.display = 'flex';
        userInfo.style.display = 'none';
    }
}

/**
 * Configurar escuchadores de eventos de autenticación
 */
function setupAuthListeners() {
    // Escuchar cambios en localStorage
    window.addEventListener('storage', function(e) {
        console.log("Cambio en localStorage detectado:", e.key);
        
        if (e.key === 'user' || e.key === 'currentUser' || e.key === 'isLoggedIn' || 
            e.key === 'repuestos_currentUser' || e.key === 'repuestos_isLoggedIn') {
            
            console.log("Actualizando autenticación por cambio en almacenamiento");
            
            const user = getCurrentUser();
            const isLoggedIn = checkIfLoggedIn();
            updateNavbarAuth(user, isLoggedIn);
            updateCartCount();
        }
    });
    
    // Escuchar eventos personalizados
    window.addEventListener('authStateChanged', function() {
        console.log("Evento authStateChanged recibido");
        
        const user = getCurrentUser();
        const isLoggedIn = checkIfLoggedIn();
        updateNavbarAuth(user, isLoggedIn);
        updateCartCount();
    });
    
    // Escuchar eventos del carrito
    window.addEventListener('carritoActualizado', updateCartCount);
}

/**
 * Configurar logout global
 */
function setupGlobalLogout() {
    // Detectar clics en botones de logout
    document.addEventListener('click', function(e) {
        // Buscar si el clic fue en un botón de logout
        const logoutBtn = e.target.closest('#btnLogout') || 
                         e.target.closest('.btn-logout') || 
                         e.target.closest('[data-action="logout"]');
        
        if (logoutBtn) {
            e.preventDefault();
            logoutUser();
        }
    });
}

/**
 * Función para cerrar sesión
 */
function logoutUser() {
    console.log("=== CERANDO SESIÓN ===");
    
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        // Limpiar TODOS los formatos de usuario
        localStorage.removeItem('user');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('repuestos_currentUser');
        localStorage.removeItem('repuestos_isLoggedIn');
        localStorage.removeItem('rememberedEmail');
        
        // También limpiar usuarios antiguos si existen
        localStorage.removeItem('allUsers');
        localStorage.removeItem('repuestos_users');
        
        console.log("Datos de sesión eliminados");
        
        // Disparar evento
        window.dispatchEvent(new Event('authStateChanged'));
        
        // Mostrar notificación
        showNotification('Sesión cerrada exitosamente', 'success');
        
        // Redirigir a inicio después de un momento
        setTimeout(() => {
            if (!window.location.href.includes('index.html') && 
                !window.location.href.endsWith('/')) {
                window.location.href = 'index.html';
            }
        }, 1000);
    }
}

/**
 * Actualizar contador del carrito
 */
function updateCartCount() {
    try {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const totalItems = carrito.reduce((total, item) => total + (item.cantidad || 1), 0);
        
        document.querySelectorAll('.cart-count').forEach(element => {
            const oldCount = parseInt(element.textContent) || 0;
            
            // Actualizar número
            element.textContent = totalItems;
            
            // Efecto visual si cambió
            if (totalItems > oldCount) {
                element.classList.add('cart-pulse');
                setTimeout(() => element.classList.remove('cart-pulse'), 500);
            }
            
            // Mostrar/ocultar según cantidad
            if (totalItems > 0) {
                element.style.display = 'flex';
            } else {
                element.style.display = 'none';
            }
        });
        
        console.log("Carrito actualizado:", totalItems, "productos");
        
    } catch (error) {
        console.error("Error actualizando carrito:", error);
    }
}

/**
 * Mostrar notificación
 */
function showNotification(message, type = 'info') {
    console.log("Mostrando notificación:", message);
    
    // Crear contenedor si no existe
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }
    
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Colores según tipo
    let bgColor, textColor, icon;
    switch(type) {
        case 'success':
            bgColor = 'rgba(46, 204, 113, 0.9)';
            textColor = 'white';
            icon = 'fa-check-circle';
            break;
        case 'error':
            bgColor = 'rgba(231, 76, 60, 0.9)';
            textColor = 'white';
            icon = 'fa-exclamation-circle';
            break;
        case 'warning':
            bgColor = 'rgba(241, 196, 15, 0.9)';
            textColor = 'black';
            icon = 'fa-exclamation-triangle';
            break;
        default:
            bgColor = 'rgba(52, 152, 219, 0.9)';
            textColor = 'white';
            icon = 'fa-info-circle';
    }
    
    notification.style.cssText = `
        background: ${bgColor};
        color: ${textColor};
        padding: 12px 20px;
        border-radius: 8px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
        font-size: 14px;
    `;
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
        <button class="notification-close" style="
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            margin-left: 10px;
            font-size: 16px;
        ">&times;</button>
    `;
    
    container.appendChild(notification);
    
    // Botón para cerrar
    notification.querySelector('.notification-close').onclick = function() {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    };
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
    
    // Agregar estilos de animación si no existen
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .cart-pulse {
                animation: cartPulse 0.5s ease;
            }
            
            @keyframes cartPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.3); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Verificar estado actual (para debug)
 */
function checkCurrentAuthStatus() {
    console.log("=== ESTADO DE AUTENTICACIÓN ACTUAL ===");
    console.log("user:", JSON.parse(localStorage.getItem('user') || 'null'));
    console.log("currentUser:", JSON.parse(localStorage.getItem('currentUser') || 'null'));
    console.log("isLoggedIn:", localStorage.getItem('isLoggedIn'));
    console.log("repuestos_currentUser:", JSON.parse(localStorage.getItem('repuestos_currentUser') || 'null'));
    console.log("repuestos_isLoggedIn:", localStorage.getItem('repuestos_isLoggedIn'));
    console.log("allUsers:", JSON.parse(localStorage.getItem('allUsers') || '[]').length, "usuarios registrados");
    console.log("carrito:", JSON.parse(localStorage.getItem('carrito') || '[]').length, "productos");
    console.log("=====================================");
}

/**
 * Función global para debug (útil para desarrollo)
 */
window.debugAuth = function() {
    checkCurrentAuthStatus();
    
    // También mostrar alerta con información básica
    const user = getCurrentUser();
    if (user) {
        alert(`Usuario: ${user.name || user.email}\nEmail: ${user.email}\nLogueado: Sí`);
    } else {
        alert("No hay usuario logueado");
    }
};

/**
 * Función global para forzar actualización del navbar
 */
window.updateAuthStatus = function() {
    const user = getCurrentUser();
    const isLoggedIn = checkIfLoggedIn();
    updateNavbarAuth(user, isLoggedIn);
    updateCartCount();
};

/**
 * Función para verificar permisos (ejemplo para futuras funcionalidades)
 */
window.hasPermission = function(permission) {
    const user = getCurrentUser();
    if (!user) return false;
    
    // Aquí puedes agregar lógica de permisos según el usuario
    // Por ahora, todos los usuarios logueados tienen permisos básicos
    return user.loggedIn === true;
};

// ============================================================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================================================

window.Auth = {
    // Estado
    isLoggedIn: checkIfLoggedIn,
    getUser: getCurrentUser,
    
    // Acciones
    logout: logoutUser,
    showNotification: showNotification,
    
    // Utilidades
    update: updateAuthStatus,
    debug: debugAuth,
    hasPermission: window.hasPermission
};

// Agregar botón de debug en desarrollo
if (window.location.href.includes('localhost') || window.location.href.includes('127.0.0.1')) {
    setTimeout(() => {
        const debugBtn = document.createElement('button');
        debugBtn.textContent = "🔧 Auth Debug";
        debugBtn.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            z-index: 9999;
            padding: 8px 12px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
            opacity: 0.7;
            transition: opacity 0.3s;
        `;
        debugBtn.onmouseenter = () => debugBtn.style.opacity = '1';
        debugBtn.onmouseleave = () => debugBtn.style.opacity = '0.7';
        debugBtn.onclick = debugAuth;
        document.body.appendChild(debugBtn);
    }, 1000);
}

console.log("=== VERIFICACIÓN DE AUTENTICACIÓN INICIADA ===");