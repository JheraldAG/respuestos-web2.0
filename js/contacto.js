// contacto.js - Funcionalidad para la página de contacto
document.addEventListener('DOMContentLoaded', function() {
    console.log("Página de contacto cargada");
    
    // Inicializar Session Manager
    if (!window.sessionManager) {
        window.sessionManager = new SessionManager();
    }
    
    // Elementos del formulario
    const contactForm = document.getElementById('contactForm');
    const btnEnviar = document.querySelector('.btn-enviar');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
        
        // Validación en tiempo real
        setupRealTimeValidation();
    }
    
    // Inicializar efectos
    inicializarEfectosContacto();
    
    // Actualizar carrito
    actualizarContadorCarrito();
});

// Manejar envío del formulario
async function handleContactSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const btnEnviar = form.querySelector('.btn-enviar');
    const originalText = btnEnviar.innerHTML;
    
    // Validar formulario
    if (!validateContactForm(form)) {
        return;
    }
    
    // Obtener datos del formulario
    const formData = {
        nombre: form.querySelector('#nombre').value.trim(),
        email: form.querySelector('#email').value.trim(),
        telefono: form.querySelector('#telefono').value.trim(),
        asunto: form.querySelector('#asunto').value,
        mensaje: form.querySelector('#mensaje').value.trim(),
        fecha: new Date().toISOString(),
        ip: await getIPAddress()
    };
    
    // Mostrar estado de envío
    btnEnviar.disabled = true;
    btnEnviar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    
    try {
        // Simular envío (en producción, aquí iría una petición a tu servidor)
        await simulateSendMessage(formData);
        
        // Mostrar mensaje de éxito
        showMessage('¡Mensaje enviado con éxito! Te responderemos pronto.', 'success');
        
        // Limpiar formulario
        form.reset();
        
        // Guardar en localStorage (para historial)
        saveMessageToHistory(formData);
        
    } catch (error) {
        // Mostrar mensaje de error
        showMessage('Error al enviar el mensaje. Inténtalo de nuevo.', 'error');
        console.error('Error sending message:', error);
        
    } finally {
        // Restaurar botón
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = originalText;
    }
}

// Validar formulario
function validateContactForm(form) {
    let isValid = true;
    
    // Limpiar errores previos
    clearErrors();
    
    // Validar nombre
    const nombre = form.querySelector('#nombre').value.trim();
    if (!nombre || nombre.length < 2) {
        showError('#nombre', 'Por favor ingresa tu nombre completo');
        isValid = false;
    }
    
    // Validar email
    const email = form.querySelector('#email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        showError('#email', 'Por favor ingresa un email válido');
        isValid = false;
    }
    
    // Validar teléfono (opcional)
    const telefono = form.querySelector('#telefono').value.trim();
    if (telefono && telefono.length < 10) {
        showError('#telefono', 'El teléfono debe tener al menos 8 dígitos');
        isValid = false;
    }
    
    // Validar asunto
    const asunto = form.querySelector('#asunto').value;
    if (!asunto) {
        showError('#asunto', 'Por favor selecciona un asunto');
        isValid = false;
    }
    
    // Validar mensaje
    const mensaje = form.querySelector('#mensaje').value.trim();
    if (!mensaje || mensaje.length < 10) {
        showError('#mensaje', 'El mensaje debe tener al menos 10 caracteres');
        isValid = false;
    }
    
    return isValid;
}

// Configurar validación en tiempo real
function setupRealTimeValidation() {
    const inputs = document.querySelectorAll('#contactForm input, #contactForm textarea, #contactForm select');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            clearError(this.id);
            
            // Validación específica por tipo
            switch (this.id) {
                case 'email':
                    if (this.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value)) {
                        showError('#' + this.id, 'Email inválido');
                    }
                    break;
                    
                case 'telefono':
                    if (this.value && this.value.length < 10) {
                        showError('#' + this.id, 'Mínimo 8 dígitos');
                    }
                    break;
                    
                case 'mensaje':
                    if (this.value && this.value.length < 10) {
                        showError('#' + this.id, 'Mínimo 10 caracteres');
                    }
                    break;
            }
        });
        
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                showError('#' + this.id, 'Este campo es requerido');
            }
        });
    });
}

// Mostrar error
function showError(selector, message) {
    const element = document.querySelector(selector);
    if (!element) return;
    
    // Crear o actualizar elemento de error
    let errorElement = element.parentNode.querySelector('.error-text');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-text';
        element.parentNode.appendChild(errorElement);
    }
    
    errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    errorElement.style.cssText = `
        color: #ff6b6b;
        font-size: 13px;
        margin-top: 5px;
        display: flex;
        align-items: center;
        gap: 5px;
    `;
    
    // Resaltar campo
    element.style.borderColor = '#ff6b6b';
    element.style.boxShadow = '0 0 0 2px rgba(255, 107, 107, 0.2)';
}

// Limpiar error específico
function clearError(fieldId) {
    const element = document.getElementById(fieldId);
    if (!element) return;
    
    const errorElement = element.parentNode.querySelector('.error-text');
    if (errorElement) {
        errorElement.remove();
    }
    
    element.style.borderColor = '';
    element.style.boxShadow = '';
}

// Limpiar todos los errores
function clearErrors() {
    document.querySelectorAll('.error-text').forEach(el => el.remove());
    document.querySelectorAll('#contactForm input, #contactForm textarea, #contactForm select').forEach(el => {
        el.style.borderColor = '';
        el.style.boxShadow = '';
    });
}

// Mostrar mensaje de éxito/error
function showMessage(message, type) {
    // Crear contenedor si no existe
    let container = document.getElementById('contact-messages');
    if (!container) {
        container = document.createElement('div');
        container.id = 'contact-messages';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        `;
        document.body.appendChild(container);
    }
    
    // Crear mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `contact-message ${type}`;
    messageDiv.style.cssText = `
        background: ${type === 'success' ? 'rgba(46, 204, 113, 0.9)' : 'rgba(231, 76, 60, 0.9)'};
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
    
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(messageDiv);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 5000);
}

// Simular envío de mensaje
function simulateSendMessage(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simular éxito 95% del tiempo
            if (Math.random() < 0.95) {
                console.log('Mensaje simulado enviado:', data);
                resolve(data);
            } else {
                reject(new Error('Error simulado en el envío'));
            }
        }, 1500);
    });
}

// Obtener dirección IP (simulada)
async function getIPAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return '127.0.0.1'; // IP local por defecto
    }
}

// Guardar mensaje en historial
function saveMessageToHistory(message) {
    try {
        const history = JSON.parse(localStorage.getItem('contactHistory')) || [];
        history.unshift({
            ...message,
            id: 'msg_' + Date.now(),
            leido: false
        });
        
        // Mantener solo los últimos 50 mensajes
        if (history.length > 50) {
            history.pop();
        }
        
        localStorage.setItem('contactHistory', JSON.stringify(history));
    } catch (error) {
        console.error('Error saving message to history:', error);
    }
}

// Inicializar efectos visuales
function inicializarEfectosContacto() {
    // Efecto de aparición para los elementos de información
    const infoItems = document.querySelectorAll('.info-item');
    infoItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, 200 + (index * 100));
    });
    
    // Efecto para el formulario
    const formulario = document.querySelector('.formulario-contacto');
    if (formulario) {
        formulario.style.opacity = '0';
        formulario.style.transform = 'translateX(20px)';
        
        setTimeout(() => {
            formulario.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            formulario.style.opacity = '1';
            formulario.style.transform = 'translateX(0)';
        }, 500);
    }
    
    // Agregar animaciones CSS si no existen
    if (!document.getElementById('contact-animations')) {
        const style = document.createElement('style');
        style.id = 'contact-animations';
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
        `;
        document.head.appendChild(style);
    }
}

// Actualizar contador del carrito
function actualizarContadorCarrito() {
    try {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const totalItems = carrito.reduce((total, item) => total + (item.cantidad || 1), 0);
        
        document.querySelectorAll('.cart-count').forEach(element => {
            element.textContent = totalItems;
        });
    } catch (error) {
        console.error('Error actualizando contador:', error);
    }
}

// Escuchar eventos del carrito
window.addEventListener('carritoActualizado', actualizarContadorCarrito);
window.addEventListener('storage', function(e) {
    if (e.key === 'carrito') {
        actualizarContadorCarrito();
    }

});
