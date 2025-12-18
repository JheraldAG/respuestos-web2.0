// index-content.js - Contenido dinámico para index.html
document.addEventListener('DOMContentLoaded', function() {
    console.log("Cargando contenido para index.html");
    
    // Verificar si estamos en la página principal
    if (!window.location.pathname.includes('index.html') && 
        window.location.pathname.endsWith('/')) {
        // Estamos en la raíz, también es la página principal
    } else if (!window.location.pathname.includes('index.html')) {
        return; // No estamos en index.html
    }
    
    // Inicializar Session Manager si no existe
    if (!window.sessionManager) {
        window.sessionManager = new SessionManager();
    }
    
    // Actualizar carrito
    updateCartCount();
    
    // Agregar efectos especiales
    addSpecialEffects();
});

// Actualizar contador del carrito
function updateCartCount() {
    try {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const totalItems = carrito.reduce((total, item) => total + (item.cantidad || 1), 0);
        
        document.querySelectorAll('.cart-count').forEach(element => {
            const oldCount = parseInt(element.textContent) || 0;
            element.textContent = totalItems;
            
            // Efecto de animación si cambia
            if (totalItems > oldCount) {
                element.classList.add('pulse-animation');
                setTimeout(() => element.classList.remove('pulse-animation'), 300);
            }
            
            // Mostrar/ocultar según cantidad
            if (totalItems > 0) {
                element.style.display = 'flex';
            } else {
                element.style.display = 'none';
            }
        });
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Efectos especiales para la página principal
function addSpecialEffects() {
    // Efecto de escritura en el título
    const heroTitle = document.querySelector('.hero-title .gradient-text');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        heroTitle.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < originalText.length) {
                heroTitle.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            } else {
                // Efecto de brillo continuo
                setInterval(() => {
                    heroTitle.style.textShadow = '0 0 20px rgba(108, 99, 255, 0.7)';
                    setTimeout(() => {
                        heroTitle.style.textShadow = '0 0 10px rgba(108, 99, 255, 0.3)';
                    }, 1000);
                }, 2000);
            }
        };
        
        setTimeout(typeWriter, 1000);
    }
    
    // Animación para las tarjetas de características
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 300 + (index * 100));
    });
    
    // Contador de productos en tiempo real
    updateProductCounters();
}

// Actualizar contadores de productos
function updateProductCounters() {
    // Simular contadores en tiempo real
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target')) || 1000;
        let current = 0;
        const increment = Math.ceil(target / 50);
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                if (current > target) current = target;
                counter.textContent = current.toLocaleString();
                setTimeout(updateCounter, 30);
            }
        };
        
        updateCounter();
    });
}

// Escuchar eventos del carrito
window.addEventListener('carritoActualizado', updateCartCount);
window.addEventListener('storage', function(e) {
    if (e.key === 'carrito') {
        updateCartCount();
    }
});

// Función para mostrar notificaciones
window.showNotification = function(message, type = 'info') {
    // Crear contenedor de notificaciones si no existe
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        `;
        document.body.appendChild(container);
    }
    
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        background: ${type === 'success' ? 'rgba(46, 204, 113, 0.9)' : 
                     type === 'error' ? 'rgba(231, 76, 60, 0.9)' : 
                     'rgba(52, 152, 219, 0.9)'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        margin-bottom: 10px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 300px;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 
                          type === 'error' ? 'exclamation-circle' : 
                          'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    // Auto-eliminar después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
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
            
            .pulse-animation {
                animation: pulse 0.3s ease-in-out;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.3); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
};








// En index-content.js o en el script principal de cada página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay que redirigir por compra pendiente
    if (window.sessionManager && window.sessionManager.hasPendingPurchase() && 
        window.sessionManager.isLoggedIn() && 
        !window.location.pathname.includes('carrito.html')) {
        
        console.log("Usuario logueado con compra pendiente, sugiriendo continuar...");
        
        // Puedes mostrar una notificación o banner
        setTimeout(() => {
            if (confirm('Tienes una compra pendiente. ¿Quieres continuar con el pago?')) {
                window.location.href = 'carrito.html?openModal=true';
            }
        }, 1000);
    }
});