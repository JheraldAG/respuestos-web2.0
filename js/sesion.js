// sesion.js - VERSIÓN QUE SOLO REDIRIGE DESDE MODAL DEL CARRITO
document.addEventListener('DOMContentLoaded', function () {
    console.log("=== SESION.JS CARGADO ===");

    // ===================================================================
    // ELEMENTOS DEL DOM
    // ===================================================================
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const showPasswordBtn = document.getElementById('showPassword');
    const submitBtn = document.getElementById('submitBtn');
    const rememberMe = document.getElementById('rememberMe');

    // Elementos de error
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');

    // ===================================================================
    // PARÁMETROS DE URL Y ESTADO
    // ===================================================================
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get('redirect') || 'index.html';
    const fromCarritoModal = urlParams.get('fromCarritoModal') === 'true';
    const hasPendingPurchase = urlParams.get('pendingPurchase') === 'true';
    
    console.log("Parámetros URL:", {
        redirect: redirectTo,
        fromCarritoModal: fromCarritoModal,
        pendingPurchase: hasPendingPurchase,
        referrer: document.referrer
    });

    // ===================================================================
    // INICIALIZACIÓN
    // ===================================================================
    
    // Cargar email recordado si existe
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail && emailInput) {
        emailInput.value = rememberedEmail;
        if (rememberMe) rememberMe.checked = true;
    }

    // Mostrar/ocultar contraseña
    if (showPasswordBtn) {
        showPasswordBtn.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }

    // Enfocar email al cargar
    if (emailInput && !emailInput.value) {
        emailInput.focus();
    }
    
    // Mostrar mensaje informativo si viene del modal del carrito
    if (fromCarritoModal || hasPendingPurchase) {
        showInfoMessage('Inicia sesión para continuar con tu compra');
    }

    // ===================================================================
    // FUNCIONES DE VALIDACIÓN (MANTENER IGUAL)
    // ===================================================================
    
    function validateForm() {
        let isValid = true;

        const email = emailInput.value.trim();
        if (!email) {
            showError(emailError, 'Por favor ingresa tu email');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError(emailError, 'Por favor ingresa un email válido');
            isValid = false;
        } else {
            hideError(emailError);
        }

        const password = passwordInput.value;
        if (!password) {
            showError(passwordError, 'Por favor ingresa tu contraseña');
            isValid = false;
        } else {
            hideError(passwordError);
        }

        return isValid;
    }

    function showError(element, message) {
        element.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        element.classList.add('show');
    }

    function hideError(element) {
        element.textContent = '';
        element.classList.remove('show');
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showInfoMessage(message) {
        let infoContainer = document.getElementById('infoMessageContainer');
        if (!infoContainer) {
            infoContainer = document.createElement('div');
            infoContainer.id = 'infoMessageContainer';
            infoContainer.style.cssText = `
                background: rgba(52, 152, 219, 0.1);
                border: 1px solid rgba(52, 152, 219, 0.3);
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
                color: #3498db;
                display: flex;
                align-items: center;
                gap: 10px;
            `;
            
            const formHeader = document.querySelector('.form-header');
            if (formHeader) {
                formHeader.parentNode.insertBefore(infoContainer, formHeader.nextSibling);
            }
        }
        
        infoContainer.innerHTML = `
            <i class="fas fa-shopping-cart"></i>
            <span>${message}</span>
        `;
    }

    // ===================================================================
    // FUNCIONES DE AUTENTICACIÓN
    // ===================================================================
    
    function findUser(email, password) {
        console.log("Buscando usuario:", email);
        const allUsers = JSON.parse(localStorage.getItem('allUsers')) || [];
        const user = allUsers.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (user) {
            console.log("Usuario encontrado");
            return user;
        }

        console.log("Usuario NO encontrado");
        return null;
    }

    // FUNCIÓN PRINCIPAL MODIFICADA: Solo redirige si viene del modal
    function handleSuccessfulLogin(user) {
        console.log("=== LOGIN EXITOSO ===");
        
        // Guardar "Recordar email" si está marcado
        if (rememberMe && rememberMe.checked) {
            localStorage.setItem('rememberedEmail', user.email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        // Guardar usuario en el sistema
        const userForNavbar = {
            name: user.name || user.email.split('@')[0],
            email: user.email,
            loggedIn: true,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('user', JSON.stringify(userForNavbar));
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');

        // Marcar que ya no es nuevo usuario
        if (localStorage.getItem('isNewUser') === 'true') {
            localStorage.setItem('isNewUser', 'false');
        }

        console.log('Sesión iniciada, usuario guardado');
        
        // ==============================================
        // LÓGICA DE REDIRECCIÓN MEJORADA
        // ==============================================
        
        let destination = redirectTo;
        let message = '¡Bienvenido! Inicio de sesión exitoso.';
        
        // SOLO redirigir al carrito si viene específicamente del modal
        if (fromCarritoModal || hasPendingPurchase) {
            console.log("Viene del modal del carrito, redirigiendo automáticamente...");
            destination = 'carrito.html?openModal=true';
            message = '¡Bienvenido! Redirigiendo a tu compra...';
            
            // Marcar que fue un login desde modal (para tracking)
            localStorage.setItem('loginFromCarritoModal', 'true');
            localStorage.setItem('loginTimestamp', new Date().toISOString());
        } else {
            console.log("Login normal, redirigiendo a:", destination);
            // Limpiar cualquier flag de login desde modal
            localStorage.removeItem('loginFromCarritoModal');
        }
        
        // Mostrar notificación
        showLoginNotification(message, 'success');
        
        // Disparar evento para actualizar navbar
        window.dispatchEvent(new CustomEvent('authStateChanged'));
        
        // Redirigir después de un breve delay
        setTimeout(() => {
            console.log("Redirigiendo a:", destination);
            window.location.href = destination;
        }, 1000);
    }

    function showLoginNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `login-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'rgba(46, 204, 113, 0.9)' : 'rgba(52, 152, 219, 0.9)'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 9999;
            animation: slideInRight 0.3s ease;
        `;
        
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        if (!document.getElementById('login-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'login-notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ===================================================================
    // EVENT LISTENERS
    // ===================================================================
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            console.log("Formulario de login enviado");

            if (!validateForm()) {
                console.log("Validación fallida");
                return;
            }

            // Mostrar loading
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';

            await new Promise(resolve => setTimeout(resolve, 800));

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            console.log("Intentando login con:", email);

            const user = findUser(email, password);

            if (user) {
                console.log("Login exitoso");
                handleSuccessfulLogin(user);
            } else {
                console.log("Login fallido");
                showError(passwordError, 'Email o contraseña incorrectos');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                passwordInput.focus();
            }
        });
    }

    // Validación en tiempo real
    if (emailInput) {
        emailInput.addEventListener('input', function () {
            hideError(emailError);
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', function () {
            hideError(passwordError);
        });
    }

    // ===================================================================
    // VERIFICACIÓN DE SESIÓN EXISTENTE
    // ===================================================================
    
    function checkExistingSession() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        if (isLoggedIn && window.location.pathname.includes('sesion.html')) {
            // Usuario ya logueado, redirigir según origen
            console.log("Usuario ya logueado en página de login");
            
            let destination = redirectTo;
            
            // SOLO redirigir al carrito si viene del modal
            if (fromCarritoModal || hasPendingPurchase) {
                destination = 'carrito.html?openModal=true';
                console.log("Viene del modal, redirigiendo a carrito");
            }
            
            setTimeout(() => {
                window.location.href = destination;
            }, 500);
        }
    }

    // Inicializar
    checkExistingSession();

    console.log("=== SESION.JS INICIALIZADO CORRECTAMENTE ===");
});